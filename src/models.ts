export class VoteOption {
    constructor(public name: string) { }
}

export class UserVotes {
    orderedVoteOptions: string[] = []
}

export class RankedVoteCounts {
    numOptions
    voteCounts: number[] = []

    constructor(numOptions: number) {
        if (numOptions < 0) {
            throw new Error('numOptions must be >= 0')
        }
        this.numOptions = numOptions
        for (let i = 0; i < numOptions; i++) {
            this.voteCounts.push(0)
        }
    }

    addVote(rank: number): void {
        if (rank < 0 || rank >= this.numOptions) {
            throw new Error('vote rank must be >= 0 && < total options')
        }
        this.voteCounts[rank]++
    }
}

type OptionNameToVoteCountsDict = { [key: string]: RankedVoteCounts }

export class StageResult {
    rankedVoteCounts: OptionNameToVoteCountsDict = {}

    constructor(voteOptions: VoteOption[]) {
        for (let voteOption of voteOptions) {
            this.rankedVoteCounts[voteOption.name] = new RankedVoteCounts(voteOptions.length)
        }
    }
}

export class FinalResult {
    totalNumVoters = 0
    stageResults: StageResult[] = []
    winner: string | null = null
}