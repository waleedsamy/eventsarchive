function showEvent(event) {
    return `
    \t id          : ${event.id}
    \t createdAt   : ${event.createdAt}
    \t environment : ${event.environment}
    \t email       : ${event.email}
    \t component   : ${event.component}
    \t message     : ${event.message}`
}


module.exports.showEvent = showEvent