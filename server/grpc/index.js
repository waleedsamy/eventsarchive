const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")

const config = require('../../config/config')
const logger = require('../../lib/common/logger')
const handlers = require("./handlers")

const packageDef = protoLoader.loadSync("proto/events.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const eventsArchivePackage = grpcObject.eventsArchivePackage;

const server = new grpc.Server();

server.addService(eventsArchivePackage.Events.service, {
    "addEvent": handlers.addEvent,
    "filterEvents": handlers.filterEvents,
})

server.bindAsync(`0.0.0.0:${config.get("grpcPort")}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        logger.error(err)
        process.exit(1)
    }
    server.start();
    logger.info(`grpc server listening on 0.0.0.0:${port}`)
})
