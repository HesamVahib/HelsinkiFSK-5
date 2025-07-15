import { useState } from "react";


const Blogs = ({ blog }) => {

  const [detailsVisible, setDetailsVisible] = useState(false);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleDetails = () => {
    return (
    <button onClick={() => setDetailsVisible(!detailsVisible)}>
      {detailsVisible ? 'hide' : 'view'}
    </button>
    )
  }

  const likeButton = (blogId) => {

    return (
      <button onClick={() => console.log(`like button clicked for blog ${blogId}`)}>
        like
      </button>
    )
  }

  return (
    <>
      <div style={blogStyle}>
      {blog.title} {blog.author} {toggleDetails()}
      {detailsVisible && (
        <div>
          <div>{blog.url}</div>
          <div>{blog.likes} likes {likeButton(blog.id)}</div>
          <div>added by {blog.user.name}</div>
        </div>
      )}
      </div>
    </>
  );
}

export default Blogs
