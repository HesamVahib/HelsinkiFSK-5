import Blogs from './components/Blogs'
import { Display, ErrorDisplay } from './components/Display'
import { useState, useEffect } from 'react'


const fetchedBlogs = async () => {
  try {
    const response = await fetch('/api/blogs');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
};

const App = () => {


  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [updatedBlog, setBlogs] = useState([]);
  const [error, setError] = useState(null);

  

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser');
    if (loggedUserJSON && loggedUserJSON !== 'undefined') {
      try {
        const user = JSON.parse(loggedUserJSON);
        setUser(user);
      } catch (error) {
        console.error('Error parsing logged user:', error);
      }
    }
    fetchedBlogs().then(blogs => {
      setBlogs(blogs);
    });

  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      setTimeout(() => {
        setError(null);
      }, 5000);
      return ;
    }
    console.log('logging in with', username, password);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const user = await response.json();
      console.log('user', user);
      setUser(user);
      setUsername('');
      setPassword('');
      setError(null);
      window.localStorage.setItem('loggedUser', JSON.stringify(user));
    } catch (exception) {
      setError(exception.message || 'Wrong username or password');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const loginForm = () => {
    return (
      <div>
      <Display tag="h2" text="Log in to application" />
      {error && <ErrorDisplay color="red" message={error} />}
      <form onSubmit={handleLogin}>
          <div>
          username
          <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
          />
          </div>
          <div>
          password
          <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
          />
          </div>
          <button type="submit">login</button>
      </form>
      </div>
  )}

  const logoutButton = () => {
    const handleLogout = () => {
      setUser(null);
      window.localStorage.removeItem('loggedUser');
    }
    return (
      <button onClick={handleLogout}
      >logout</button>
    )
  }

  const handleNewBlog = (event) => {
    event.preventDefault();
    const newBlog = {
      id: updatedBlog.length + 1,
      title: event.target.title.value,
      author: event.target.author.value,
      url: event.target.url.value
    };
    setBlogs([...updatedBlog, newBlog]);
    setError(`a new blog ${newBlog.title} by ${newBlog.author} added`);
    setTimeout(() => {
      setError(null);
    }, 5000);
    event.target.title.value = '';
    event.target.author.value = '';
    event.target.url.value = '';
  }

 const CreateBlogForm = () => {
  
    return (
      <form onSubmit={handleNewBlog}>
        <Display tag="h2" text="Create new" />
        <div>
          title:
          <input type="text" name="title" />
        </div>
        <div>
          author: 
          <input type="text" name="author" />
        </div>
        <div>
          url: 
          <input type="text" name="url" />
        </div>
        <button type="submit">create</button>
      </form>
    )
  }

  const blogPost = () => {
    return (
    <div>
      <Display tag="h2" text="Blogs" />
      {error && <ErrorDisplay color="green" message={error} />}
      <Display tag="p">
        {user.username} logged in {logoutButton()}
      </Display>
      <CreateBlogForm />
      {updatedBlog.map((updatedBlog) => (
        <Blogs key={updatedBlog.id} blog={updatedBlog} />
      ))}
    </div>
  )
  }

 
  return (
    <>
      {user === null ? loginForm() : blogPost()}
    </>
  )
}

export default App
