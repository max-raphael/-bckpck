require('dotenv').config()

module.exports = {

    development: {
        client: 'pg',
        connection: `postgres://localhost/${process.env.Database}`
    }
}