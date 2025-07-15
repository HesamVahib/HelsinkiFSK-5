import { Display, ErrorDisplay } from './components/Display'
import { useState, useEffect } from 'react'
import CreateBlogForm from './components/NewBlog'
import SortBlogs from './components/Blogs';


const App = () => {


  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [updatedBlog, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  

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
    const fetchBlogs = async () => {
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
    fetchBlogs().then(blogs => {
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

  const addBlog = async (newBlog) => {

      try {
        const response = await fetch('/api/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(newBlog)
        })
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add blog');
        }
        
        const savedBlog = await response.json();
        setBlogs([...updatedBlog, savedBlog]);
        setError(`a new blog ${savedBlog.title} by ${savedBlog.author} added`)
        } catch (error) {
          console.error('Error adding blog:', error);
          setError(error.message);
        }
    }

  const handleNewBlog = (event) => {
    event.preventDefault();
    const newBlog = {
      title: event.target.title.value,
      author: event.target.author.value,
      url: event.target.url.value
    };
    
    addBlog(newBlog);
    
    setTimeout(() => {
      setError(null);
    }, 5000);
    event.target.title.value = '';
    event.target.author.value = '';
    event.target.url.value = '';
    setVisible(false);
  }

  const buttonFormToggle = () => {
    return (
      <button onClick={() => setVisible(!visible)}>
        {visible ? 'cancel' : 'new blog'}
      </button>
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
      <CreateBlogForm handleNewBlog={handleNewBlog} visible={visible} /> 
      {buttonFormToggle()}
      <SortBlogs setBlogs={setBlogs} blogs={updatedBlog} user={user} />
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
