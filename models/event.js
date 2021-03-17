const { Sequelize, Model } = require('sequelize')
const Op = Sequelize.Op

module.exports = (sequelize, DataTypes) => {
    class Event extends Model {
        static filterEvents(filterRequest) {
            let searchQuery = {}
            if (filterRequest.email)
                searchQuery.email = filterRequest.email
            if (filterRequest.component)
                searchQuery.component = filterRequest.component
            if (filterRequest.environment)
                searchQuery.environment = filterRequest.environment
            if (filterRequest.since)
                searchQuery.createdAtDate = {
                    [Op.gt]: filterRequest.since
                }
            if (filterRequest.message) {
                searchQuery.message = {
                    [Op.like]: `%${filterRequest.message}%`,
                }
            }

            return this.findAndCountAll({
                where: searchQuery,
                limit: filterRequest.resultPerPage,
                offset: (filterRequest.pageNumber - 1) * filterRequest.resultPerPage
            })
        }
    }

    Event.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
                notEmpty: true,
            }
        },
        component: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        environment: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        payload: {
            type: Sequelize.JSON,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        createdAt: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.createdAtDate.getTime() / 1000 // seconds since unix epoc time
            },
            set(utcSeconds) {
                const d = new Date(0)
                d.setUTCSeconds(utcSeconds)
                this.setDataValue('createdAtDate', d)
            }
        }
    }, {
        sequelize,
        timestamps: true,
        createdAt: 'createdAtDate'
    });
    return Event;
}