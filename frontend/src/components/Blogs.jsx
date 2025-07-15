import { useState } from "react";
import PropTypes from "prop-types";


const Blogs = ({ setBlogs, blog, user }) => {
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [likes, setLikes] = useState(blog.likes);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  };

  const toggleDetails = () => (
    <button onClick={() => setDetailsVisible(!detailsVisible)}>
      {detailsVisible ? 'hide' : 'view'}
    </button>
  );

  const likeButton = (blogId) => {
    const handleLike = async () => {
      try {
        const response = await fetch(`/api/blogs/${blogId}/likes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to like blog');
        }
        const newLikesBlog = await response.json();
        setLikes(newLikesBlog.likes);
      } catch (error) {
        console.error('Error liking blog:', error);
      }
    };

    return <button onClick={handleLike}>like</button>;
  };

  const deleteButton = (blogId) => {
    const deleteButtonStyle = {
      backgroundColor: 'blue',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      cursor: 'pointer',
    };

    const handleDelete = async () => {
      if (!window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) return;
      try {
        const response = await fetch(`/api/blogs/${blogId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete blog');
        }
        setBlogs((prevBlogs) => prevBlogs.filter((b) => b.id !== blogId));
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    };

    return (
      <button onClick={handleDelete} style={deleteButtonStyle}>
        remove
      </button>
    );
  };

  return (
    <div style={blogStyle}>
      {blog.title} {blog.author} {toggleDetails()}
      {detailsVisible && (
        <div>
          <div>{blog.url}</div>
          <div>
            {likes} likes {likeButton(blog.id)}
          </div>
          <div>added by {blog.user.name}</div>
          {deleteButton(blog.id)}
        </div>
      )}
    </div>
  );
};

const SortBlogs = ({ setBlogs, blogs, user }) => {

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes);

  return (
    <div>
      {sortedBlogs.map((blog) => (
        <Blogs key={blog.id} setBlogs={setBlogs} blog={blog} user={user} />
      ))}
    </div>
  );
};

Blogs.propTypes = {
  setBlogs: PropTypes.func.isRequired,
  blog: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}
export {Blogs, SortBlogs };
