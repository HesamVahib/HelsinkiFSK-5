const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1
  })

  if (!blogs) {
    return response.status(404).json({ error: 'No blogs found' })
  }
  return response.status(200).json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const decodeToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodeToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  
  const user = await User.findById(decodeToken.id)
  if (!user) {
    return response.status(400).json({ error: 'User not found' })
  }
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })
  
  if (!blog.title || !blog.url) {
    return response.status(400).json({ error: 'Title and URL are required' })
  }
  
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = request.body
  const postId = request.params.id

  const result = await Blog.findByIdAndUpdate(postId, updatedBlog, { new: true, runValidators: true })
  if (!result) {
    return response.status(404).json({ error: 'Blog not found' })
  }
  response.status(200).json(result)
})
    
  


module.exports = blogsRouter
