const { DateTime } = require('luxon')
const expect = require('chai').expect
const faker = require('faker')
const validator = require('validator')
const models = require('../../models')
const events = require('../../lib/events')
const dummyEvents = require('../data/dummy').dummyEvents

describe('Events', function () {
    describe('#addEvent()', () => {

        before(function (done) {
            (async () => {
                await models.sequelize.sync()
                done()
            })();
        })

        after(function (done) {
            (async () => {
                await models.sequelize.drop()
                done()
            })();
        });

        it('should save valid event', done => {
            const event1 = {
                email: faker.internet.email(),
                component: faker.commerce.department(),
                createdAt: faker.time.recent() / 1000,
                environment: faker.commerce.product(),
                message: `the buyer #${faker.random.number()} has placed an order successfully`,
                payload: JSON.stringify({
                    order_id: faker.random.number(), amount: faker.finance.amount(), created_at: faker.time.recent() / 1000
                })
            }
            events.addEvent(event1).then(ev => {
                expect(validator.isUUID(ev.id), 'uuid as identifier').to.be.true
                expect(ev.email).to.equal(event1.email)
                expect(ev.component).to.equal(event1.component)
                expect(ev.environment).to.equal(event1.environment)
                expect(ev.message).to.equal(event1.message)
                expect(ev.payload).to.equal(event1.payload)
                done()
            })
        });

        it('throw error on invalid event email', done => {
            const event1 = {
                email: faker.name.lastName(),
                component: faker.commerce.department(),
                createdAt: faker.time.recent() / 1000,
                environment: faker.commerce.product(),
                message: `the buyer #${faker.random.number()} has placed an order successfully`,
                payload: JSON.stringify({
                    order_id: faker.random.number(), amount: faker.finance.amount(), created_at: faker.time.recent() / 1000
                })
            }
            events.addEvent(event1).catch(err => {
                expect(err.message).to.equal('Validation error: Validation isEmail on email failed')
                done()
            })
        });

        it('throw error on missing event message', done => {
            const event1 = {
                email: faker.internet.email(),
                component: faker.commerce.department(),
                createdAt: faker.time.recent() / 1000,
                environment: faker.commerce.product(),
                payload: JSON.stringify({
                    order_id: faker.random.number(), amount: faker.finance.amount(), created_at: faker.time.recent() / 1000
                })
            }
            events.addEvent(event1).catch(err => {
                expect(err.message).to.equal('notNull Violation: Event.message cannot be null')
                done()
            })
        });
    });


    describe('#filterEvents()', () => {

        before(function (done) {
            (async () => {
                await models.sequelize.sync()
                done()
            })();
        })

        after(function (done) {
            (async () => {
                await models.sequelize.drop()
                done()
            })();
        });

        before(done => {
            let devent = dummyEvents(400)
            Promise.all(devent.map(events.addEvent))
                .then(result => {
                    done()
                }).catch(err => {
                    console.log(err)
                    done(err)
                })
        })

        it('find events since date', done => {
            const dtLocal = DateTime.now().minus({ days: 91 })
            const dtEST = dtLocal.setZone("Canada/Eastern").toISO()
            const request1 = {
                resultPerPage: 10,
                since: dtEST
            }
            events.filterEvents(request1).then(result => {
                expect(result).to.include.all.keys('request', 'hitsCount', 'hits');
                expect(result).to.deep
                expect(result.request).to.deep.equal({
                    pageNumber: 1,
                    resultPerPage: 10,
                    since: dtLocal.toUTC().toISO()
                })
                expect(result.hitsCount).to.equal(10)
                expect(result.recordsCount).to.equal(400)
                done()
            }).catch(err => {
                done(err)
            })
        });

        it('find events since date with message, environment and component', done => {
            const dtLocal = DateTime.now().minus({ days: 91 })
            const dtEST = dtLocal.setZone("Canada/Eastern").toISO()
            const request1 = {
                pageNumber: 2,
                resultPerPage: 10,
                since: dtEST,
                message: 'error',
                component: 'search',
                environment: 'development'
            }
            events.filterEvents(request1).then(result => {
                expect(result).to.include.all.keys('request', 'hitsCount', 'hits');
                expect(result).to.deep
                expect(result.request).to.deep.equal({
                    pageNumber: 2,
                    resultPerPage: 10,
                    since: dtLocal.toUTC().toISO(),
                    message: 'error',
                    component: 'search',
                    environment: 'development'
                })
                expect(result.hitsCount).to.be.gt(1)
                expect(result.recordsCount).to.be.gt(1)
                done()
            }).catch(err => {
                done(err)
            })
        });

        it('throw error on non iso 8601 since date', done => {
            const request1 = {
                since: "non iso 8601"
            }
            events.filterEvents(request1).catch(err => {
                expect(err.message).to.equal('since must be and iso 8601 i.e 2021-03-16')
                done()
            })
        });
    })
});
