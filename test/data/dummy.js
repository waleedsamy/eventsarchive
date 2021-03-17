const _ = require('lodash')
const faker = require('faker')

module.exports.dummyEvents = function (size) {

    let messages = _.times(size, n => {
        let messages = [
            `the buyer #${faker.random.number()} has placed an order successfully`,
            `the buyer #${faker.random.number()} has an error while placing an order`,
        ]
        return _.sample(messages)
    })

    return _.times(size, n => {
        let createAt = faker.date.recent(90).getTime() / 1000

        return {
            email: faker.internet.email(),
            component: _.sample(['inventory', 'cart', 'search']),
            createdAt: createAt,
            environment: _.sample(['production', 'staging', 'development']),
            message: _.sample(messages),
            payload: JSON.stringify({
                order_id: faker.random.number(), amount: faker.finance.amount(), created_at: createAt
            })
        }
    })
}