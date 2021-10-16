import { FinalResult, StageResult, UserVotes, VoteOption } from './models'

export class VoteController {
    originalVotes: UserVotes[] = []

    constructor(public options: VoteOption[]) {
        if (!options || options.length <= 0) {
            throw new Error('options are required')
        }
    }

    acceptUserVotes(userVotes: UserVotes): void {
        this.originalVotes.push(userVotes)
    }

    acceptPopulationVotes(allVotes: UserVotes[]): void {
        for (let userVotes of allVotes) {
            this.acceptUserVotes(userVotes)
        }
    }

    getFinalResult(): FinalResult {
        let finalResult = new FinalResult()
        finalResult.totalNumVoters = this.originalVotes.length

        let stageResult = this.getStageResult(this.originalVotes)

        // If done check here
        // If not done, create new votes list and get next stage


        return finalResult
    }

    getStageResult(allUserVotes: UserVotes[]): StageResult {
        let stageResult = new StageResult(this.options)

        for (let userVotes of allUserVotes) {
            for (let i = 0; i < userVotes.orderedVoteOptions.length; i++) {
                stageResult.optionRankedVoteCounts[userVotes.orderedVoteOptions[i]].addVote(i)
            }
        }

        return stageResult
    }

    getStageResultWinner(stageResult: StageResult): string | null {
        let firstRankVoteCounts = []
        // TODO: left off here 
        return null
    }

    private getIndexedOptions(): { [key: string]: VoteOption } {
        let indexedOptions: { [key: string]: VoteOption } = {}
        for (let option of this.options) {
            indexedOptions[option.name] = option
        }
        return indexedOptions
    }
}
