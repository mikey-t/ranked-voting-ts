import { FinalResult, UserVotes, VoteOption } from './models'
import { VoteControllerLogic } from './VoteControllerLogic'

export class VoteController {
    private logic: VoteControllerLogic
    originalVotes: UserVotes[] = []

    constructor(public options: VoteOption[]) {
        if (!options || options.length <= 0) {
            throw new Error('options are required')
        }
        this.logic = new VoteControllerLogic(options)
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

        let stageResult = this.logic.getStageResult(this.originalVotes)
        finalResult.stageResults.push(stageResult)

        let winner = this.logic.getStageWinner(stageResult)
        while (winner === null) {
            let losers = this.logic.getLosers(stageResult)

            let optionsWithRankOneVotes = this.logic.getOptionsWithRankOneVotes(stageResult.rankedVoteCounts)

            // Tie if losers are exact same as optionsWithRankOneVotes
            if (this.logic.sameOptions(losers, optionsWithRankOneVotes)) {
                finalResult.tieOptions = optionsWithRankOneVotes
                return finalResult
            }

            stageResult = this.logic.getNextStageResult(stageResult, losers)
            finalResult.stageResults.push(stageResult)

            winner = this.logic.getStageWinner(stageResult)
        }

        finalResult.winner = winner

        return finalResult
    }

    
}
