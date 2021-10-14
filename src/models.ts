export class VoteOption {
    private rankedVoteCounts: RankVoteCountDict = {}
    
    constructor(public name: string) {
    }
    
    getRankedVoteCounts(): RankVoteCountDict {
        return this.rankedVoteCounts
    }
    
    addVote(rank: number) {
        if (this.rankedVoteCounts[rank]) {
            this.rankedVoteCounts[rank]++
        }
        else {
            this.rankedVoteCounts[rank] = 1
        }
    }
}

export class VoteList {
    votes: string[] = []
}

type RankVoteCountDict = {[key: number]: number}