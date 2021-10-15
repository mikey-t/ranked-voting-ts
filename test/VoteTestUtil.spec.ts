import { assert } from 'chai'
import { VoteOption } from '../src/models'
import { VoteController } from '../src/VoteController'
import { VoteTestUtil } from '../src/VoteTestUtil'

var voteController = new VoteController([new VoteOption('whatever')])
var voteTestUtil = new VoteTestUtil(voteController)

beforeEach(function() {
    voteTestUtil = new VoteTestUtil(voteController)
})

describe('VoteTestUtil', function(){
    describe('configure', function() {
        it('throws if minUserVotes is greater than maxUserVotes', function() {
            assert.throws(() => voteTestUtil.configure(5, 4 ,42), 'minUserVotes must be less than maxUserVotes')
        })
    })
})
