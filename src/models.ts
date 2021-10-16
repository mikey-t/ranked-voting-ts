export class VoteOption {
    constructor(public name: string) { }
}

export class UserVotes {
    orderedVoteOptions: string[] = []
}

export class RankedVoteCounts {
    voteCounts: number[] = []

    constructor(numOptions: number) {
        for (let i = 0; i < numOptions; i++) {
            this.voteCounts.push(0)
        }
    }

    addVote(rank: number): void {
        this.voteCounts[rank]++
    }
}

type OptionNameToVoteCountsDict = { [key: string]: RankedVoteCounts }

export class StageResult {
    optionRankedVoteCounts: OptionNameToVoteCountsDict = {}

    constructor(voteOptions: VoteOption[]) {
        for (let voteOption of voteOptions) {
            this.optionRankedVoteCounts[voteOption.name] = new RankedVoteCounts(voteOptions.length)
        }
    }
}

export class FinalResult {
    totalNumVoters = 0
    stageResults: StageResult[] = []
    winner: string | null = null
}
