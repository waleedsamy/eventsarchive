const logger = require('../../lib/common/logger')
const events = require('../../lib/events')

function addEvent(call, callback) {
    let eventItem = call.request
    events.addEvent(eventItem).then(res => {
        return callback(null, res)
    }).catch(err => {
        logger.error(err)
        return callback(err)
    })
}

function filterEvents(call, callback) {
    let filterRequest = call.request
    events.filterEvents(filterRequest).then(res => {
        return callback(null, res)
    }).catch(err => {
        logger.error(err)
        return callback(err)
    })
}

module.exports.addEvent = addEvent
module.exports.filterEvents = filterEvents
