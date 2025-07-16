import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Blogs} from './Blogs';
import { vi } from 'vitest';

global.fetch = vi.fn();

test ('renders blog title and author and likes increase by clicking', async () => {
  const blog = {
    id: 1,
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 5,
    user: { name: 'Test User',
        token: 'test-token' }
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ likes: 6 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ likes: 7 })
      });

    render(<Blogs blog={blog} user={blog.user} setBlogs={() => {}} />);

    const user = userEvent.setup();
    const button1 = screen.getByText('view');
    await user.click(button1);

    expect(screen.getByText(/5 likes/)).toBeDefined();

    const likeButton = screen.getByText('like');
    
    await user.click(likeButton);
    expect(screen.getByText(/6 likes/)).toBeDefined();
    
    await user.click(likeButton);
    expect(screen.getByText(/7 likes/)).toBeDefined();

    const element = screen.getByText('Test Blog Test Author');
    expect(element).toBeDefined();
})