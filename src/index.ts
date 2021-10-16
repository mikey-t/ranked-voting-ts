import { VoteController } from './VoteController'
import { VoteOption } from './models'
import { VoteTestUtil } from './VoteTestUtil'

console.log('\nRanked voting simulation\n')

const controller = new VoteController([
    new VoteOption('bananas'),
    new VoteOption('strawberries'),
    new VoteOption('cherries'),
    new VoteOption('peaches')])

const testUtil = new VoteTestUtil(controller)
testUtil.configure(1, 4, 500)

console.log('gathering test votes...')
const testVotes = testUtil.getPopulationTestVotes()
controller.acceptPopulationVotes(testVotes)

console.log('calculating result...')
let finalResult = controller.getFinalResult()

console.log('Final result: ', finalResult)

// controller.outputResult()

console.log('\ndone')
