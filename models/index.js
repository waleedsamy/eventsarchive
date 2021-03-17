'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config')

const basename = path.basename(__filename)
const eventsDBConfig = config.get('eventsDB')
const db = {};

let sequelize = new Sequelize(eventsDBConfig.database, eventsDBConfig.username, eventsDBConfig.password, eventsDBConfig)

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

(async () => {
    if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ force: true });
    }
})()

db.sequelize = sequelize
db.Sequelize = Sequelize
module.exports = db
