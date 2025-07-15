import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Blogs} from './Blogs';

test ('renders blog title and author', async () => {
  const blog = {
    id: 1,
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 5,
    user: { name: 'Test User',
        token: 'test-token' }
    };

    render(<Blogs blog={blog} user={blog.user} setBlogs={() => {}} />);

    // Initially, details should be hidden
    expect(screen.queryByText('http://test.com')).toBeNull();
    expect(screen.queryByText(/5 likes/)).toBeNull();

    const user = userEvent.setup();
    const button1 = screen.getByText('view');
    await user.click(button1);

    // After clicking, button text should change to 'hide'
    expect(screen.getByText('hide')).toBeDefined();


    const element = screen.getByText('Test Blog Test Author');
    // screen.debug(element);
    expect(element).toBeDefined();
})