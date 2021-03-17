const express = require('express')
const cors = require('cors')
const config = require('../../config/config')
const logger = require('../../lib/common/logger')
const events = require('../../lib/events')

const app = express()
const port = config.get("restPort")


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('swagger'))

app.post('/api/event', function (req, res, next) {
    let eventItem = req.body
    events.addEvent(eventItem).then(event => {
        res.json(event)
    }).catch(err => {
        logger.error(err)
        next(err)
    })
})

app.get('/api/filter', (req, res, next) => {
    let filterRequest = req.query
    events.filterEvents(filterRequest).then(events => {
        res.json(events)
    }).catch(err => {
        logger.error(err)
        next(err)
    })
})

app.use(function (err, req, res, next) {
    res.status(500).json({
        error: err.message,
    });
});

process.on('uncaughtException', (err) => {
    logger.alert(`uncaught exception: ${err.stack}`);
    process.exit(1);
});

process.on('exit', (code) => {
    logger.alert(`exit with code ${code}`);
});

app.listen(port, () => {
    logger.info(`rest server listening on 0.0.0.0:${port}`)
})