const { DateTime } = require('luxon')
const Event = require('../models').Event

function plainEvent(event) {
    let plain = event.get({ plain: true })
    delete plain['updatedAt']
    delete plain["createdAtDate"]
    return plain
}

function addEvent(eventItem) {
    return Event.create(eventItem).then(plainEvent)
}

function filterEvents(filterRequest) {

    if (!filterRequest.pageNumber) {
        filterRequest.pageNumber = 1
    }

    if (!filterRequest.resultPerPage) {
        filterRequest.resultPerPage = 10
    }

    if (!filterRequest.since) {
        filterRequest.since = DateTime.utc().toISO()
    } else {
        let parsedISODate = DateTime.fromISO(filterRequest.since, { zone: "Canada/Eastern" }).setZone("UTC")
        if (!parsedISODate.isValid)
            return Promise.reject(new Error("since must be and iso 8601 i.e 2021-03-16"))
        filterRequest.since = parsedISODate.toISO()
    }

    const start = DateTime.now()
    return Event.filterEvents(filterRequest).then(hits => {
        let plainHits = hits.rows.map(plainEvent)
        return {
            request: filterRequest,
            recordsCount: hits.count || 0,
            hitsCount: plainHits.length || 0,
            took: DateTime.now().diff(start).as('milliseconds'),
            hits: plainHits,
        }
    })
}

module.exports.addEvent = addEvent
module.exports.filterEvents = filterEvents
