const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')


const api = supertest(app)

const initialBlogs = [
  {
    title: "HTML is easy",
    author: "Test Author 1", 
    url: "https://example.com/html",
    likes: 5
  },
  {
    title: "CSS is fun",
    author: "Test Author 2",
    url: "https://example.com/css", 
    likes: 10
  },
  {
    title: "JavaScript is powerful",
    author: "Test Author 3",
    url: "https://example.com/js",
    likes: 15
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})

describe('Blog API tests', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.deepStrictEqual(response.body.length, 3)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const contents = response.body.map(e => e.title)
    assert.deepStrictEqual(contents, [
      "HTML is easy",
      "CSS is fun",
      "JavaScript is powerful"
    ])
  })

  test('idIdentifier returns the id of a blog', async () => {
    const blogPosts = await api.get('/api/blogs')
    blogPosts.body.forEach(blog => {
      assert.strictEqual(typeof blog.id, 'string') // Should have 'id' property
      assert.strictEqual(blog._id, undefined)  // Should not have _id
    })
  })
})

describe('Routing tests', () => {
  test('POST request creates a new blog', async () => {
    const newBlog = {
      title: "New Blog Post",
      author: "Test Author 1", 
      url: "https://example.com/html",
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(blog => blog.title)

    assert.strictEqual(titles.includes(newBlog.title),true)

    assert.strictEqual(response.body.length, initialBlogs.length + 1, 'Length of blogs should increase by 1')
    })

  test('missing likes defaults to 0', async () => {
    const newBlog = {
      title: "Blog without likes",
      author: "Test Author 4",
      url: "https://example.com/no-likes"
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    assert.strictEqual(response.body.likes, 0, 'Likes should default to 0')
  })

  test('missing title OR url returns 400', async () => {
    const newBlogNoTitle = {
      author: "Test Author 5",
      url: "https://example.com/no-title",
      likes: 3
    }

    await api
      .post('/api/blogs')
      .send(newBlogNoTitle)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const newBlogNoUrl = {
      title: "Blog without URL",
      author: "Test Author 6",
      likes: 3
    }

    await api
      .post('/api/blogs')
      .send(newBlogNoUrl)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
  })

  test('DELETE /api/blogs/:id deletes a blog', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1)

    const ids = blogsAtEnd.body.map(b => b.id)
    assert.ok(!ids.includes(blogToDelete.id))
  })
})

test('PUT /api/blogs/:id updates a blog', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]

  const updatedBlog = {
    ...blogToUpdate,
    likes: blogToUpdate.likes + 1
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  assert.strictEqual(response.body.likes, updatedBlog.likes, 'Likes should be updated')

})

after(async () => {
  await mongoose.connection.close()
})