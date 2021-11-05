import { assert } from 'chai'
import { FinalResult, StageResult, UserVotes, VoteOption } from '../src/models'
import { VoteController } from '../src/VoteController'
import { RankedVoteCounts } from './../src/models'

let RED = 'red', BLUE = 'blue', GREEN = 'green'
let voteController: VoteController
let options = [new VoteOption(RED), new VoteOption(BLUE), new VoteOption(GREEN)]

let debugString = (obj: any): string => {
    return JSON.stringify(obj, null, 2)
}

let getUserVotes = () => {
    return [
        new UserVotes([RED, BLUE, GREEN]),
        new UserVotes([GREEN, BLUE, RED])]
}

beforeEach(function () {
    voteController = new VoteController(options)
})

describe('VoteController', function () {
    describe('ctor', function () {
        it('throws if no options passed', function () {
            assert.throws(() => new VoteController([]), 'options are required')
        })
    })

    describe('acceptUserVotes', function () {
        it('initializes with userVotes param', function () {
            let expectedUserVotes = new UserVotes([RED, BLUE, GREEN])

            voteController.acceptUserVotes(expectedUserVotes)

            assert.deepEqual(voteController.originalVotes, [expectedUserVotes])
        })
    })

    describe('acceptPopulationVotes', function () {
        it('initializes with allVotes param', function () {
            let expectedUserVotesArray = getUserVotes()

            voteController.acceptPopulationVotes(expectedUserVotesArray)

            assert.deepEqual(voteController.originalVotes, expectedUserVotesArray)
        })
    })

    describe('getStageResult', function () {
        it('returns object with copy of user votes', function () {
            let userVotes = getUserVotes()
            let result = voteController.getStageResult(userVotes)
            assert.isNotEmpty(result.userVotes)
            assert.equal(result.userVotes.length, 2)

            // Make sure it stored a copy and not a reference to the original
            userVotes.pop()
            assert.equal(userVotes.length, 1)
            assert.equal(result.userVotes.length, 2)
            userVotes[0].orderedVoteOptions.pop()
            assert.equal(userVotes[0].orderedVoteOptions.length, 2)
            assert.equal(result.userVotes[0].orderedVoteOptions.length, 3)
        })

        it('returns object with correct rankedVoteCounts dictionary', function () {
            let userVotes = getUserVotes()
            userVotes.push(new UserVotes([RED, BLUE, GREEN]))
            let result = voteController.getStageResult(userVotes)

            let expectedRankedVoteCountsRed = new RankedVoteCounts(3)
            expectedRankedVoteCountsRed.addVote(0)
            expectedRankedVoteCountsRed.addVote(2)
            expectedRankedVoteCountsRed.addVote(0)

            let expectedRankedVoteCountsBlue = new RankedVoteCounts(3)
            expectedRankedVoteCountsBlue.addVote(1)
            expectedRankedVoteCountsBlue.addVote(1)
            expectedRankedVoteCountsBlue.addVote(1)

            let expectedRankedVoteCountsGreen = new RankedVoteCounts(3)
            expectedRankedVoteCountsGreen.addVote(0)
            expectedRankedVoteCountsGreen.addVote(2)
            expectedRankedVoteCountsGreen.addVote(2)

            let redVoteCounts = result.rankedVoteCounts[RED]
            let blueVoteCounts = result.rankedVoteCounts[BLUE]
            let greenVoteCounts = result.rankedVoteCounts[GREEN]

            assert.deepEqual(redVoteCounts, expectedRankedVoteCountsRed)
            assert.deepEqual(blueVoteCounts, expectedRankedVoteCountsBlue)
            assert.deepEqual(greenVoteCounts, expectedRankedVoteCountsGreen)
        })
    })

    describe('getStageWinner', function () {
        it('returns null if no winner (on option has more than 50% rank 1 votes)', function () {
            let stageResult = voteController.getStageResult(getUserVotes())
            let winner = voteController.getStageWinner(stageResult)
            assert.isNull(winner)
        })

        it('returns the winner option name or null if no option has greater than 50% first rank votes', function () {
            let userVotes = getUserVotes()
            userVotes.push(new UserVotes([RED, BLUE, GREEN]))
            let stageResult = voteController.getStageResult(userVotes)

            let winner = voteController.getStageWinner(stageResult)

            assert.equal(winner, RED)

            userVotes = getUserVotes()
            userVotes.push(new UserVotes([GREEN, BLUE, RED]))
            stageResult = voteController.getStageResult(userVotes)
            winner = voteController.getStageWinner(stageResult)

            assert.equal(winner, GREEN)
        })
    })
    
    describe('getOptionsWithVotes', function() {
        it('returns array with unique list of options that have votes', function () {
            let userVotesArray = [
                new UserVotes([RED, BLUE]),
                new UserVotes([BLUE])]
            let stageResult = voteController.getStageResult(userVotesArray)

            let optionsWithVotes = voteController.getOptionsWithVotes(stageResult.rankedVoteCounts)

            assert.deepEqual(optionsWithVotes, [RED, BLUE])
        })
    })
    
    describe('getNextStageResult', function() {
        it('throws if losers param is empty', function() {
            let userVotesArray = getUserVotes()
            let stageResult = voteController.getStageResult(userVotesArray)
            
            assert.throws(() => voteController.getNextStageResult(stageResult, []), 'losers must be passed to generate the next StageResult')
        })
        
        it('returns StageResult where all UserVotes lists have had losers removed', function(){
            let firstStageVotes = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([RED, GREEN, BLUE]),
                new UserVotes([BLUE, RED, GREEN]),
                new UserVotes([BLUE, RED, GREEN]),
                new UserVotes([BLUE, RED, GREEN]),
                new UserVotes([GREEN, RED]),
                new UserVotes([GREEN])
            ]
            
            let stageResult = voteController.getStageResult(firstStageVotes)
            
            let nextStageResult = voteController.getNextStageResult(stageResult, [GREEN])
            
            let expectedNextStageVotes = [
                new UserVotes([RED, BLUE]),
                new UserVotes([RED, BLUE]),
                new UserVotes([RED, BLUE]),
                new UserVotes([BLUE, RED]),
                new UserVotes([BLUE, RED]),
                new UserVotes([BLUE, RED]),
                new UserVotes([RED]),
                new UserVotes([])
            ]
            
            assert.deepEqual(nextStageResult.userVotes, expectedNextStageVotes)
        })
    })
    
    describe('getLosers', function() {
        it('returns single loser when there\'s no ties', function(){
            let userVotesArray = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([BLUE, GREEN, RED]),
                new UserVotes([BLUE, RED, BLUE]),
                new UserVotes([GREEN, BLUE, RED])]
            let stageResult = voteController.getStageResult(userVotesArray)
            
            let losers = voteController.getLosers(stageResult.rankedVoteCounts)
            
            assert.deepEqual(losers, [GREEN])
        })
        
        it.only('returns tied losers when there\'s no tie-breaker condition', function(){
            let userVotesArray = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([BLUE, GREEN, RED]),
                new UserVotes([GREEN, BLUE, RED])]
            let stageResult = voteController.getStageResult(userVotesArray)
            
            let losers = voteController.getLosers(stageResult.rankedVoteCounts)
            
            assert.sameMembers(losers, [GREEN, BLUE])
        })
        
        // TODO:
        // - Perfect tie between 2 options
        // - Two way tie where 1 is worse than other and is returned
        // - Three way tie where 1 is worse loser than other 2 and is returned
    })

    describe('getFinalResult', function () {
        it('returns populated FinalResult object with winner and one StageResult if no elimination steps are required', function () {
            // Give red the winning scenario
            let userVotesArray = getUserVotes()
            userVotesArray.push(new UserVotes([RED, GREEN, BLUE]))
            voteController.acceptPopulationVotes(userVotesArray)

            let result = voteController.getFinalResult()

            assert.equal(result.winner, RED)
        })

        // it('returns FinalResult with null winner and populated tieOptions property when there\s a tie', function () {
        // })

        // TODO:
        // - Various real tie scenarios
        // - Winner where tie-breaker logic applies

    })
})
