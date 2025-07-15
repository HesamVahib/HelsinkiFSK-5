const mongoose = require('mongoose')

const loginSchema = new mongoose.Schema({
    username: String,
    password: String
})

loginSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.password
    }
})

const Login = mongoose.model('Login', loginSchema)

module.exports = Login