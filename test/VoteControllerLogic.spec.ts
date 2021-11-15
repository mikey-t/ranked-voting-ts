import { VoteControllerLogic } from '../src/VoteControllerLogic'
import { RankedVoteCounts, UserVotes, VoteOption } from '../src/models'
import { assert } from 'chai'

let RED = 'red', BLUE = 'blue', GREEN = 'green'
let logic: VoteControllerLogic
let options = [new VoteOption(RED), new VoteOption(BLUE), new VoteOption(GREEN)]

let getUserVotes = () => {
    return [
        new UserVotes([RED, BLUE, GREEN]),
        new UserVotes([GREEN, BLUE, RED])]
}

beforeEach(function () {
    logic = new VoteControllerLogic(options)
})

describe('VoteControllerLogic', function () {
    describe('ctor', function () {
        it('throws if no options passed', function () {
            assert.throws(() => new VoteControllerLogic([]), 'options are required')
        })
    })

    describe('getStageResult', function () {
        it('returns object with copy of user votes', function () {
            let userVotes = getUserVotes()
            let result = logic.getStageResult(userVotes)
            assert.isNotEmpty(result.userVotes)
            assert.equal(result.userVotes.length, 2)

            // Make sure it stored a copy and not a reference to the original
            userVotes.pop()
            assert.equal(userVotes.length, 1)
            assert.equal(result.userVotes.length, 2)
            userVotes[0].pop()
            assert.equal(userVotes[0].length, 2)
            assert.equal(result.userVotes[0].length, 3)
        })

        it('returns object with correct rankedVoteCounts dictionary', function () {
            let userVotes = getUserVotes()
            userVotes.push(new UserVotes([RED, BLUE, GREEN]))
            let result = logic.getStageResult(userVotes)

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
            let stageResult = logic.getStageResult(getUserVotes())
            let winner = logic.getStageWinner(stageResult)
            assert.isNull(winner)
        })

        it('returns the winner option name or null if no option has greater than 50% first rank votes', function () {
            let userVotes = getUserVotes()
            userVotes.push(new UserVotes([RED, BLUE, GREEN]))
            let stageResult = logic.getStageResult(userVotes)

            let winner = logic.getStageWinner(stageResult)

            assert.equal(winner, RED)

            userVotes = getUserVotes()
            userVotes.push(new UserVotes([GREEN, BLUE, RED]))
            stageResult = logic.getStageResult(userVotes)
            winner = logic.getStageWinner(stageResult)

            assert.equal(winner, GREEN)
        })
    })

    describe('getOptionsWithRankOneVotes', function () {
        it('returns array with unique list of options that have rank one votes', function () {
            let userVotesArray = [
                new UserVotes([RED, BLUE]),
                new UserVotes([RED, GREEN, BLUE]),
                new UserVotes([BLUE])]
            let stageResult = logic.getStageResult(userVotesArray)

            let optionsWithVotes = logic.getOptionsWithRankOneVotes(stageResult.rankedVoteCounts)

            assert.deepEqual(optionsWithVotes, [RED, BLUE])
        })
    })

    describe('getNextStageResult', function () {
        it('throws if losers param is empty', function () {
            let userVotesArray = getUserVotes()
            let stageResult = logic.getStageResult(userVotesArray)

            assert.throws(() => logic.getNextStageResult(stageResult, []), 'losers must be passed to generate the next StageResult')
        })

        it('returns StageResult where all UserVotes lists have had losers removed', function () {
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

            let stageResult = logic.getStageResult(firstStageVotes)

            let nextStageResult = logic.getNextStageResult(stageResult, [GREEN])

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

    describe('getLosers', function () {
        it('returns single loser when there\'s no ties', function () {
            let userVotesArray = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([BLUE, GREEN, RED]),
                new UserVotes([BLUE, RED, BLUE]),
                new UserVotes([GREEN, BLUE, RED])]
            let stageResult = logic.getStageResult(userVotesArray)

            let losers = logic.getLosers(stageResult)

            assert.deepEqual(losers, [GREEN])
        })

        it('returns tied losers when there\'s no tie-breaker condition', function () {
            let userVotesArray = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([BLUE, GREEN, RED]),
                new UserVotes([GREEN, BLUE, RED])]
            let stageResult = logic.getStageResult(userVotesArray)

            let losers = logic.getLosers(stageResult)

            assert.sameMembers(losers, [GREEN, BLUE])
        })

        it('returns all loser ties even if there is a tie-breaker condition, as long as the number of losers is less than total number of remaining options', function () {
            let userVotesArray = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([BLUE]),
                new UserVotes([GREEN, BLUE, RED])]
            let stageResult = logic.getStageResult(userVotesArray)

            let losers = logic.getLosers(stageResult)

            assert.sameMembers(losers, [GREEN, BLUE])
        })

        it('returns worst losers when tie-breaker condition exists and all remaining options are among the tied losers', function () {
            let userVotesArray = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([GREEN, BLUE, GREEN]),
                new UserVotes([BLUE, RED, GREEN])
            ]
            let stageResult = logic.getStageResult(userVotesArray)

            let losers = logic.getLosers(stageResult)

            assert.sameMembers(losers, [GREEN])
        })
    })

    describe('getRankOneVotesDict', function () {
        it('returns correct dictionary mapping optionName to number of rank one votes', function () {
            let userVotesArray = getUserVotes()
            let stageResult = logic.getStageResult(userVotesArray)

            let rankOneVotesDict = logic.getRankOneVotesDict(stageResult.rankedVoteCounts)


        })
    })

    describe('sameOptions', function () {
        it('returns true of same options in same order', function () {
            let optionsA = [RED, GREEN]
            let optionsB = [RED, GREEN]

            assert.isTrue(logic.sameOptions(optionsA, optionsB))
        })

        it('returns true of same options in different order', function () {
            let optionsA = [RED, GREEN]
            let optionsB = [GREEN, RED]

            assert.isTrue(logic.sameOptions(optionsA, optionsB))
        })

        it('returns false if different options', function () {
            let optionsA = [RED, GREEN]
            let optionsB = [RED, BLUE]

            assert.isFalse(logic.sameOptions(optionsA, optionsB))
        })

        it('returns false if different number of options', function () {
            let optionsA = [RED, GREEN]
            let optionsB = [RED, GREEN, BLUE]

            assert.isFalse(logic.sameOptions(optionsA, optionsB))
        })
    })
})