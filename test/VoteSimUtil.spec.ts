import { assert } from 'chai'
import { VoteOption } from '../src/models'
import { VoteController } from '../src/VoteController'
import { VoteSimUtil } from '../src/VoteSimUtil'

var voteController = new VoteController([
  new VoteOption('option1'),
  new VoteOption('option2'),
  new VoteOption('option3'),
  new VoteOption('option4'),
  new VoteOption('option5')
])
var voteSimUtil = new VoteSimUtil(voteController)

beforeEach(function () {
  voteSimUtil = new VoteSimUtil(voteController)
})

describe('VoteSimUtil', function () {
  describe('configure', function () {
    it('throws if minUserVotes is greater than maxUserVotes', function () {
      assert.throws(() => voteSimUtil.configure(5, 4, 42), 'minUserVotes must be less than maxUserVotes')
    })

    it('throws if minUserVotes or maxUserVotes is less than 0', function () {
      assert.throws(() => voteSimUtil.configure(-1, 4, 42), 'minUserVotes must be between 0 and the number of vote options')
      assert.throws(() => voteSimUtil.configure(-2, -1, 42), 'minUserVotes must be between 0 and the number of vote options')
    })

    it('throws if minUserVotes or maxUserVotes is greater than then total number of options', function () {
      assert.throws(() => voteSimUtil.configure(6, 7, 42), 'minUserVotes must be between 0 and the number of vote options')
      assert.throws(() => voteSimUtil.configure(1, 7, 42), 'maxUserVotes must be less than or equal to the total number of options')
    })

    it('throws if numVoters is less than or equal to zero', function () {
      assert.throws(() => voteSimUtil.configure(1, 5, 0), 'numUsers must be greater than 0')
      assert.throws(() => voteSimUtil.configure(1, 5, -1), 'numUsers must be greater than 0')
    })

    it('sets values if configure is called with valid params', function () {
      const minVotes = 1,
        maxVotes = 5,
        numVoters = 42
      voteSimUtil.configure(minVotes, maxVotes, numVoters)
      assert.equal(voteSimUtil.getMinUserVotes(), minVotes)
      assert.equal(voteSimUtil.getMaxUserVotes(), maxVotes)
      assert.equal(voteSimUtil.getNumVoters(), numVoters)
    })
  })

  describe('getPopulationTestUserVotes', function () {
    it('returns correct number of random user vote arrays where number of votes per user is in valid range', function () {
      const minVotes = 2,
        maxVotes = 4,
        numVoters = 42
      voteSimUtil.configure(minVotes, maxVotes, numVoters)
      let randomVoteArrays = voteSimUtil.getPopulationTestUserVotes()

      assert.equal(randomVoteArrays.length, numVoters)

      for (let userVotes of randomVoteArrays) {
        assert.isAtLeast(userVotes.length, minVotes)
        assert.isAtMost(userVotes.length, maxVotes)
      }
    })
  })
})
