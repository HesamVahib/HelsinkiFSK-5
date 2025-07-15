import React, { useState } from 'react';
import { Display } from './Display';

 const CreateBlogForm = ({buttonFormToggle, handleNewBlog, visible}) => {
  
    return ( visible ? (
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
        <button type="submit" onSubmit={buttonFormToggle}>create</button>
      </form>
    ) : null)
  }

  export default CreateBlogForm;
