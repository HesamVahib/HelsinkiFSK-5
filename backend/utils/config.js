const dotenv = require('dotenv')
dotenv.config()

const PORT = process.env.PORT
const NODE_ENV = process.env.NODE_ENV

const MONGODB_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

console.log('Environment:', NODE_ENV)
console.log('Using database:', MONGODB_URI ? 'Connected' : 'Not configured')

module.exports = { MONGODB_URI, PORT, NODE_ENV }