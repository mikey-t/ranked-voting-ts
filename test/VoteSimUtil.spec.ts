import { assert } from 'chai'
import { VoteOption } from '../src/models'
import { VoteController } from '../src/VoteController'
import { VoteSimUtil } from '../src/VoteSimUtil'

var voteController = new VoteController([new VoteOption('whatever')])
var voteSimUtil = new VoteSimUtil(voteController)

beforeEach(function() {
    voteSimUtil = new VoteSimUtil(voteController)
})

describe('VoteSimUtil', function(){
    describe('configure', function() {
        it('throws if minUserVotes is greater than maxUserVotes', function() {
            assert.throws(() => voteSimUtil.configure(5, 4 ,42), 'minUserVotes must be less than maxUserVotes')
        })
    })
})
