import { assert } from 'chai'
import { UserVotes, VoteOption } from '../src/models'
import { VoteController } from '../src/VoteController'

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

    describe('getFinalResult', function () {
        it('returns populated FinalResult object with winner and one StageResult if no elimination steps are required', function () {
            let userVotesArray = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([GREEN, BLUE, GREEN]),
                new UserVotes([BLUE, RED, GREEN]),
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([RED])
            ]
            voteController.acceptPopulationVotes(userVotesArray)

            let result = voteController.getFinalResult()

            assert.equal(result.winner, RED)
            assert.equal(result.stageResults.length, 1)
        })

        it('returns FinalResult with null winner and populated tieOptions property when there\s a tie', function () {
            // Blue eliminated first, then red and green have no tie-breaker
            let userVotesArray = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([GREEN, BLUE, RED])
            ]
            voteController.acceptPopulationVotes(userVotesArray)

            let result = voteController.getFinalResult()

            assert.isNull(result.winner)
            assert.isNotNull(result.tieOptions)
            assert.sameMembers(result.tieOptions as string[], [RED, GREEN])
        })

        it('returns winner when tie-breaker is possible', function () {
            let userVotesArray = [
                new UserVotes([RED, BLUE, GREEN]),
                new UserVotes([RED, BLUE]),
                new UserVotes([BLUE, RED, GREEN]),
                new UserVotes([BLUE, GREEN]),
                new UserVotes([GREEN])
            ]
            voteController.acceptPopulationVotes(userVotesArray)

            let result = voteController.getFinalResult()

            assert.equal(result.winner, BLUE)
        })
    })
})
