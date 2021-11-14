import { VoteController } from './VoteController'
import { VoteOption } from './models'
import { VoteSimUtil } from './VoteSimUtil'

console.log('\nRanked voting simulation\n')

const controller = new VoteController([
    new VoteOption('bananas'),
    new VoteOption('strawberries'),
    new VoteOption('cherries'),
    new VoteOption('peaches'),
    new VoteOption('pineapple')])

const testUtil = new VoteSimUtil(controller)
testUtil.configure(1, 1, 10000)

console.log('gathering test votes...')
const testVotes = testUtil.getPopulationTestUserVotes()
controller.acceptPopulationVotes(testVotes)

console.log('calculating result...')
let finalResult = controller.getFinalResult()

// console.log('Final result: ', JSON.stringify(finalResult, null, 2))

if (finalResult.winner !== null) {
    console.log(`winner is ${finalResult.winner} after ${finalResult.stageResults.length} stages`)
} else {
    console.log('tie between ' + finalResult.tieOptions?.join(', '))
}

console.log('\ndone')
