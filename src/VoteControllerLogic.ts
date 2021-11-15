import { StringNumDict, OptionNameToVoteCountsDict, StageResult, UserVotes, VoteOption } from './models'

export class VoteControllerLogic {

  constructor(public options: VoteOption[]) {
    if (!options || options.length <= 0) {
      throw new Error('options are required')
    }
  }

  // This comparison method only works here because we're operating
  // on arrays where options only ever appear once
  sameOptions(optionsA: string[], optionsB: string[]) {
    return optionsA.length === optionsB.length && optionsA.every(val => optionsB.includes(val))
  }

  getNextStageResult(currentStageResult: StageResult, losers: string[]): StageResult {
    if (!losers || losers.length === 0) {
      throw new Error('losers must be passed to generate the next StageResult')
    }

    let nextUserVotes: UserVotes[] = []

    for (let userVotes of currentStageResult.userVotes) {
      let votesWithoutLosers = new UserVotes(userVotes.filter(option => !losers.includes(option)))
      nextUserVotes.push(votesWithoutLosers)
    }

    let nextStageResult = this.getStageResult(nextUserVotes)

    return nextStageResult
  }

  getOptionsWithRankOneVotes(optionNameToVoteCountsDict: OptionNameToVoteCountsDict): string[] {
    return Object.keys(optionNameToVoteCountsDict)
      .filter(key => optionNameToVoteCountsDict[key].voteCounts[0] > 0)
      .map(key => key)
  }

  getLosers(currentStageResult: StageResult): string[] {
    let losers: string[] = []
    let allVoteCounts = currentStageResult.rankedVoteCounts

    let fewestRankOneVotes: number | null = null

    for (let optionName in allVoteCounts) {
      if (!this.optionHasVotes(optionName, allVoteCounts)) {
        continue
      }
      let rankOneVotes = allVoteCounts[optionName].voteCounts[0]
      if (fewestRankOneVotes === null || rankOneVotes < fewestRankOneVotes) {
        fewestRankOneVotes = rankOneVotes
      }
    }

    for (let optionName in allVoteCounts) {
      if (allVoteCounts[optionName].voteCounts[0] === fewestRankOneVotes) {
        losers.push(optionName)
      }
    }

    let numTiedLosers = losers.length
    let numOptionsLeftWithRankOneVotes = this.getOptionsWithRankOneVotes(currentStageResult.rankedVoteCounts).length

    // Tie breaker logic only required if tie is between all remaining viable options
    if (numTiedLosers === 1 || numTiedLosers !== numOptionsLeftWithRankOneVotes) {
      return losers
    }

    let eliminationScenarioCounts: StringNumDict = {}
    for (let loser of losers) {
      eliminationScenarioCounts[loser] = 0
    }

    for (let loser of losers) {
      let nextStageResultWithoutLoser = this.getNextStageResult(currentStageResult, [loser])
      for (let optionName in nextStageResultWithoutLoser.rankedVoteCounts) {
        if (!losers.includes(optionName)) {
          continue
        }
        let rankOneVotes = nextStageResultWithoutLoser.rankedVoteCounts[optionName].voteCounts[0]
        eliminationScenarioCounts[optionName] += rankOneVotes
      }
    }

    fewestRankOneVotes = Math.min(...Object.values(eliminationScenarioCounts))

    let worstLosers = Object.keys(eliminationScenarioCounts)
      .filter(key => eliminationScenarioCounts[key] == fewestRankOneVotes)
      .map(key => key)

    return worstLosers
  }

  getRankOneVotesDict(voteCounts: OptionNameToVoteCountsDict): StringNumDict {
    let dict: StringNumDict = {}

    for (let optionName in voteCounts) {
      dict[optionName] = voteCounts[optionName].voteCounts[0]
    }

    return dict
  }

  optionHasVotes(optionName: string, allVoteCounts: OptionNameToVoteCountsDict): boolean {
    let voteCounts = allVoteCounts[optionName]
    for (let count of voteCounts.voteCounts) {
      if (count > 0) {
        return true
      }
    }
    return false
  }

  getStageResult(userVotesArray: UserVotes[]): StageResult {
    let stageResult = new StageResult(this.options)

    for (let userVotes of userVotesArray) {
      for (let i = 0; i < userVotes.length; i++) {
        stageResult.rankedVoteCounts[userVotes[i]].addVote(i)
      }
    }

    stageResult.userVotes = userVotesArray.map(v => { return new UserVotes([...v]) })

    return stageResult
  }

  getStageWinner(stageResult: StageResult): string | null {
    let totalFirstRankVotes = 0

    for (let option in stageResult.rankedVoteCounts) {
      totalFirstRankVotes += stageResult.rankedVoteCounts[option].voteCounts[0]
    }

    for (let option in stageResult.rankedVoteCounts) {
      let percentage = stageResult.rankedVoteCounts[option].voteCounts[0] / totalFirstRankVotes
      if (percentage > 0.5) {
        return option
      }
    }

    return null
  }
}