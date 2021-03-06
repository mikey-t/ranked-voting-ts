import { assert } from 'chai'
import { FinalResult, RankedVoteCounts, UserVotes } from '../src/models'
import { VoteOption } from './../src/models'

describe('Model tests', function () {
  describe('VoteOption model', function () {
    describe('VoteOption ctor', function () {
      it('initializes with name param', function () {
        const expectedName = 'expected'
        let voteOption = new VoteOption(expectedName)
        assert.equal(voteOption.name, expectedName)
      })
    })
  })

  describe('UserVotes model', function () {
    describe('UserVotes ctor', function () {
      it('initializes to empty array', function () {
        let userVotes = new UserVotes()
        assert.isDefined(userVotes, 'should be defined')
        assert.isEmpty(userVotes, 'should be empty')
      })
    })
  })

  describe('RankedVoteCounts model', function () {
    describe('RankedVoteCounts ctor', function () {
      it('initializes voteCounts array with numOptions param zeros', function () {
        let rankedVoteCounts = new RankedVoteCounts(5)
        assert.isDefined(rankedVoteCounts.voteCounts)
        assert.deepEqual(rankedVoteCounts.voteCounts, [0, 0, 0, 0, 0])
      })
      it('throws if numOptions is less than 0', function () {
        assert.throws(() => new RankedVoteCounts(-1), 'numOptions must be >= 0')
      })
    })

    describe('addVote', function () {
      const expectedNumOptions = 3

      it('throws if rank is not between 0 (inclusive) and numOptions (exclusive)', function () {
        let rankedVoteCounts = new RankedVoteCounts(expectedNumOptions)
        assert.throws(() => rankedVoteCounts.addVote(-1), 'vote rank must be >= 0 && < total options')
        assert.throws(() => rankedVoteCounts.addVote(expectedNumOptions), 'vote rank must be >= 0 && < total options')
      })

      it('increments appropriate voteCounts element if rank is in range', function () {
        let rankedVoteCounts = new RankedVoteCounts(expectedNumOptions)
        let lastRankAsIndex = expectedNumOptions - 1
        rankedVoteCounts.addVote(lastRankAsIndex)
        assert.equal(rankedVoteCounts.voteCounts[lastRankAsIndex], 1)
      })
    })
  })

  describe('FinalResult model', function () {
    describe('FinalResult ctor', function () {
      it('initializes props', function () {
        let result = new FinalResult()
        assert.equal(0, result.totalNumVoters)
        assert.isDefined(result.stageResults)
        assert.isEmpty(result.stageResults)
        assert.isNull(result.winner)
      })
    })
  })
})
