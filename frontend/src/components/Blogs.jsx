const Blogs = ({ blog }) => {
  return (
    <li>
      {blog.title} {blog.author}
    </li>
  );
}

export default Blogs
