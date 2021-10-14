import { VoteList, VoteOption } from './models'

export class VoteController {
    private allVoteLists: VoteList[] = []
    
    constructor(public options: VoteOption[]) {
        if (!options || options.length <= 0) {
            throw new Error('options are required')
        }
    }

    acceptUserVoteList(voteList: VoteList): void {
        this.allVoteLists.push(voteList)
    }

    acceptPopulationVotes(allVotes: VoteList[]): void {
        for (let voteList of allVotes) {
            this.acceptUserVoteList(voteList)
        }
    }
    
    calculateResult(): void {
        let indexedOptions = this.getIndexedOptions()
        console.log('indexedOptions: ', indexedOptions)
        for (let voteList of this.allVoteLists) {
            // For each vote, add vote to associated VoteOption and pass which rank
            for (let i = 0; i < voteList.votes.length; i++) {
                let voteRank = i
                let voteOptionName = voteList.votes[i]
                indexedOptions[voteOptionName].addVote(voteRank)
            }
        }
    }

    outputResult() {
        console.log('Num voters: ' + this.allVoteLists.length)
        console.log(this.options)
    }
    
    private getIndexedOptions(): {[key: string]: VoteOption} {
        let indexedOptions: {[key: string]: VoteOption} = {}
        for (let option of this.options) {
            indexedOptions[option.name] = option
        }
        return indexedOptions
    }
}
