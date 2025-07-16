import { render, screen } from '@testing-library/react'
import CreateBlogForm from './NewBlog'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

test('<CreateBlogForm /> calls handleNewBlog with correct details', async () => {
    const handleNewBlog = vi.fn()
    const user = userEvent.setup()
    
    render(<CreateBlogForm handleNewBlog={handleNewBlog} visible={true} />)
    
    const titleInput = screen.getByPlaceholderText('title')
    const authorInput = screen.getByPlaceholderText('author')
    const urlInput = screen.getByPlaceholderText('url')
    const createButton = screen.getByText('create')
    
    await user.type(titleInput, 'Test Blog Title')
    await user.type(authorInput, 'Test Author')
    await user.type(urlInput, 'http://test.com')
    await user.click(createButton)
    

    expect(handleNewBlog).toHaveBeenCalledTimes(1)

    expect(titleInput.value).toBe('Test Blog Title')
    expect(authorInput.value).toBe('Test Author')
    expect(urlInput.value).toBe('http://test.com')
    })