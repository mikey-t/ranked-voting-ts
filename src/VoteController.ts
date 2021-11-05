import { FinalResult, OptionNameToVoteCountsDict, RankedVoteCounts, StageResult, UserVotes, VoteOption } from './models'

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
        finalResult.stageResults.push(stageResult)

        let winner = this.getStageWinner(stageResult)
        while (winner === null) {
            let losers = this.getLosers(stageResult.rankedVoteCounts)
            
            let optionsWithVotes = this.getOptionsWithVotes(stageResult.rankedVoteCounts)
            
            if (losers.length === 0) {
                // All remaining options with votes are tied
                finalResult.tieOptions = optionsWithVotes
                return finalResult
            }
            
            stageResult = this.getNextStageResult(stageResult, losers)
            finalResult.stageResults.push(stageResult)
            
            winner = this.getStageWinner(stageResult)
        }

        finalResult.winner = winner

        return finalResult
    }
    
    getNextStageResult(currentStageResult: StageResult, losers: string[]): StageResult {
        if (!losers || losers.length === 0) {
            throw new Error('losers must be passed to generate the next StageResult')
        }
        
        let nextUserVotes: UserVotes[] = []
        
        for (let userVotes of currentStageResult.userVotes) {
            let votesWithoutLosers = new UserVotes(userVotes.orderedVoteOptions.filter(option => !losers.includes(option)))
            nextUserVotes.push(votesWithoutLosers)
        }
        
        let nextStageResult = this.getStageResult(nextUserVotes)
        
        return nextStageResult
    }
    
    getOptionsWithVotes(optionNameToVoteCountsDict: OptionNameToVoteCountsDict): string[] {
        let optionsWithVotes: string[] = []
        
        for (let optionName of Object.keys(optionNameToVoteCountsDict)) {
            for (let voteCount of optionNameToVoteCountsDict[optionName].voteCounts) {
                if (voteCount > 0) {
                    optionsWithVotes.push(optionName)
                    break
                }
            }
        }
        
        return optionsWithVotes
    }

    // Returns more than one if there's a tie for lowest first-rank votes despite tie-breaker scenarios check.
    // Returns empty if all remaining options are tied.
    getLosers(voteCounts: OptionNameToVoteCountsDict): string[] {
        let losers: string[] = []
        
        let fewestRankOneVotes: number | null = null
        let numOptions = 0
        
        for (let optionName in voteCounts) {
            numOptions++
            let rankOneVotes = voteCounts[optionName].voteCounts[0]
            console.log(`${optionName}: ${rankOneVotes}`)
            if (fewestRankOneVotes === null || rankOneVotes < fewestRankOneVotes) {
                fewestRankOneVotes = rankOneVotes
            }
        }
        
        console.log('fewestRankOneVotes: ' + fewestRankOneVotes)
        
        for (let optionName in voteCounts) {
            if (voteCounts[optionName].voteCounts[0] === fewestRankOneVotes) {
                losers.push(optionName)
            }
        }
        
        if (losers.length === 1) {
            return losers
        }
        
        // TODO: left off here...
        
        // TODO: tie breaker logic
        // For each loser, run scenario to eliminate the option and keep track of what other losers rank 1 numbers would be. If one loser is worse, chose it. If perfect tie between all left, all are tied losers. If some losers simulated scenarios are worse then others, take them and repeat until perfect tie or only one left.
        
        return losers
    }

    getStageResult(userVotesArray: UserVotes[]): StageResult {
        let stageResult = new StageResult(this.options)

        for (let userVotes of userVotesArray) {
            for (let i = 0; i < userVotes.orderedVoteOptions.length; i++) {
                stageResult.rankedVoteCounts[userVotes.orderedVoteOptions[i]].addVote(i)
            }
        }

        stageResult.userVotes = userVotesArray.map(v => { return new UserVotes([...v.orderedVoteOptions]) })

        return stageResult
    }

    getStageWinner(stageResult: StageResult): string | null {
        let totalFirstRankVotes = 0

        for (let option in stageResult.rankedVoteCounts) {
            // console.log(option, stageResult.rankedVoteCounts[option])
            totalFirstRankVotes += stageResult.rankedVoteCounts[option].voteCounts[0]
        }

        for (let option in stageResult.rankedVoteCounts) {
            let percentage = stageResult.rankedVoteCounts[option].voteCounts[0] / totalFirstRankVotes
            // console.log(option, percentage)
            if (percentage > 0.5) {
                return option
            }
        }

        return null
    }
}
