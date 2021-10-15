import { assert } from 'chai'
import { VoteOption } from '../src/models'
import { VoteController } from '../src/VoteController'

describe('VoteTestController', function(){
    describe('ctor', function() {
        it('throws if no options passed', function() {
            assert.throws(() => new VoteController([]), 'options are required')
        })
    })
})
