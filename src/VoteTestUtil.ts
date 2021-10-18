import { UserVotes } from './models'
import { VoteController } from './VoteController'

export class VoteTestUtil {
    private numVoters: number = 100
    private minUserVotes: number = 1
    private maxUserVotes: number = 0

    constructor(private voteController: VoteController) {
        this.maxUserVotes = voteController.options.length
    }

    configure(minUserVotes: number, maxUserVotes: number, numVoters: number): void {
        if (minUserVotes > maxUserVotes) {
            throw new Error('minUserVotes must be less than maxUserVotes')
        }
        if (minUserVotes < 0 || minUserVotes > this.voteController.options.length) {
            throw new Error('minUserVotes must be between 0 and the number of vote options')
        }
        if (maxUserVotes < 0 || maxUserVotes > this.voteController.options.length) {
            throw new Error('maxUserVotes must be between 0 and the number of vote options')
        }
        if (numVoters <=0) {
            throw new Error('numUsers must be greater than 0')
        }
        this.minUserVotes = minUserVotes
        this.maxUserVotes = maxUserVotes
    }

    getRandomUserVotes(): UserVotes {
        const userVotes = new UserVotes()

        const numVotes = this.getRandomInt(this.minUserVotes, this.maxUserVotes)


        let possibleOptions = [...this.voteController.options.map(x => x.name)]

        for (let i = 0; i < numVotes; i++) {
            const choiceIndex = this.getRandomInt(0, possibleOptions.length - 1)
            userVotes.orderedVoteOptions.push(possibleOptions[choiceIndex])
            possibleOptions.splice(choiceIndex, 1)
        }

        return userVotes
    }

    getPopulationTestUserVotes(): UserVotes[] {
        let allVotes: UserVotes[] = []
        for (let i = 0; i < this.numVoters; i++) {
            allVotes.push(this.getRandomUserVotes())
        }
        return allVotes
    }

    // Get random int between min and max (inclusive on both bounds)
    private getRandomInt(min: number, max: number) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}
