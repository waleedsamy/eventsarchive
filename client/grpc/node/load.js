var fs = require('fs')
const _ = require('lodash')
const async = require('async')

const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")

const logger = require('../../../lib/common/logger')
const config = require('../../../config/config')
const dummy = require('../../../test/data/dummy')

const packageDef = protoLoader.loadSync("proto/events.proto", {})
const grpcObject = grpc.loadPackageDefinition(packageDef)
const eventsArchivePackage = grpcObject.eventsArchivePackage

const DUMMY_EVENTS_TO_GENERATE = 500
const csvInputFile = process.argv[2]

const client = new eventsArchivePackage.Events(`0.0.0.0:${config.get("grpcPort")}`, grpc.credentials.createInsecure())

function eventsFromCSV(filePath) {
    var csv = fs.readFileSync(filePath, { encoding: 'utf-8' })

    const content = csv.split('\n');
    const header = content[0].split(',');
    return _.tail(content).map((row) => {
        return _.zipObject(header, row.split(','));
    });
}

function sendEvents(events, callback) {
    let tasks = events.map(event => {
        return (callback) => client.addEvent(event, callback)
    })

    return async.parallel(tasks, callback)
}

let events = []
if (csvInputFile) {
    logger.info(`inserting events from csv ${csvInputFile}....`)
    events = eventsFromCSV(csvInputFile)
} else {
    logger.info(`inserting ${DUMMY_EVENTS_TO_GENERATE} dummy events....`)
    events = dummy.dummyEvents(DUMMY_EVENTS_TO_GENERATE)
}

sendEvents(events, (err, res) => {
    if (err) {
        console.log(err)
        process.exit(1)
    }
    logger.info('done!')
})