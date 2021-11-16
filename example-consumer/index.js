import { UserVotes, VoteOption, VoteController } from 'ranked-voting'

const voteController = new VoteController([
  new VoteOption('spring'),
  new VoteOption('summer'),
  new VoteOption('fall'),
  new VoteOption('winter')
])

voteController.acceptUserVotes(new UserVotes(['spring', 'summer']))
voteController.acceptUserVotes(new UserVotes(['fall', 'spring']))
voteController.acceptUserVotes(new UserVotes(['fall', 'winter']))
voteController.acceptUserVotes(new UserVotes(['summer', 'spring']))
voteController.acceptUserVotes(new UserVotes(['summer', 'winter']))

const result = voteController.getFinalResult()

if (result.winner !== null) {
  console.log(`${result.winner} won after ${result.stageResults.length - 1} stages`)
} else {
  console.log(`tie between ${result.tieOptions.join(', ')}`)
}
