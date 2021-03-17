const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const utils = require('../../../lib/common/utils')
const config = require('../../../config/config')


const packageDef = protoLoader.loadSync("proto/events.proto", {})
const grpcObject = grpc.loadPackageDefinition(packageDef)
const eventsArchivePackage = grpcObject.eventsArchivePackage

const client = new eventsArchivePackage.Events(`0.0.0.0:${config.get("grpcPort")}`, grpc.credentials.createInsecure())


const argv = yargs(hideBin(process.argv)).argv

searchQuery = {}
if (argv.since)
    searchQuery.since = argv.since
if (argv.email)
    searchQuery.email = argv.email
if (argv.component)
    searchQuery.component = argv.component
if (argv.environment)
    searchQuery.environment = argv.environment
if (argv.message)
    searchQuery.message = argv.message
if (argv.pageNumber)
    searchQuery.pageNumber = argv.pageNumber
if (argv.resultPerPage)
    searchQuery.resultPerPage = argv.resultPerPage

client.filterEvents(searchQuery, (err, searchResult) => {
    if (err) {
        console.log(err)
        process.exit(1)
    }

    let hitsStringfied = ''
    if (searchResult.hits)
        hitsStringfied = searchResult.hits.map(utils.showEvent).join('\n')
    else
        hitsStringfied = 'No matches!'

    console.log(`\n\nSearch result:
    request     :
        pageNumber      : ${searchResult.request.pageNumber}
        resultPerPage   : ${searchResult.request.resultPerPage}
        since           : ${searchResult.request.since}
    recordsCount: ${searchResult.recordsCount}
    hitsCount   : ${searchResult.hitsCount}
    took        : ${searchResult.took}ms
    hits        : ${hitsStringfied}
    `)
})