const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const User = require('../models/user')

const api = supertest(app)

const initialUsers = [
    {
        username: "testuser1",
        name: "Test User 1",
        password: "password1"
    },
    {
        username: "testuser2",
        name: "Test User 2",
        password: "password2"
    },
    {
        username: "testuser3",
        name: "Test User 3",
        password: "password3"
    }
]

beforeEach(async () => {
    await User.deleteMany({})
    const userObjects = initialUsers.map(user => new User(user))
    await User.insertMany(userObjects)
})

describe('User API tests', () => {
    test('username is missing', async () => {
        const newUser = {
            name: "New User",
            password: "newpassword"
        }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/users')
        assert.deepStrictEqual(response.body.length, initialUsers.length)
    })

    test('password is missing', async () => {
        const newUser = {
            username: "newuser",
            name: "New User"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/users')
        assert.deepStrictEqual(response.body.length, initialUsers.length)
    })

    test('username and password are too short', async () => {
        const newUser = {
            username: "nu",
            name: "New User",
            password: "pw"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/users')
        assert.deepStrictEqual(response.body.length, initialUsers.length)
    })
    test('username already exists', async () => {
        const newUser = {
            username: "testuser1",
            name: "Duplicate User",
            password: "duplicatepassword"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/users')
        assert.deepStrictEqual(response.body.length, initialUsers.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})