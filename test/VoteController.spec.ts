import { assert } from 'chai'
import { StageResult, VoteOption } from '../src/models'
import { VoteController } from '../src/VoteController'

let voteController: VoteController
let options = [new VoteOption('option1'), new VoteOption('option2'), new VoteOption('option3')]

beforeEach(function() {
    voteController = new VoteController(options)
})

describe('VoteTestController', function(){
    describe('ctor', function() {
        it('throws if no options passed', function() {
            assert.throws(() => new VoteController([]), 'options are required')
        })
    })

    describe('getStageWinner', function() {
        it('does stuff', function() {
            let stageResult = new StageResult(options)
            // TODO: left off here and in method under test. Build out stage to start working through winner logic.
            let winner = voteController.getStageWinner(stageResult)
        })
    })
})
