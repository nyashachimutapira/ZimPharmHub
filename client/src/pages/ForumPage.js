import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ForumPage.css';

function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/forum');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-page">
      <div className="container">
        <div className="forum-header">
          <h1>Community Forum</h1>
          <Link to="#" className="btn btn-primary">Create Post</Link>
        </div>

        {loading ? (
          <p>Loading discussions...</p>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post._id} className="forum-post">
                <div className="post-author">
                  <div className="author-avatar"></div>
                  <div className="author-info">
                    <p className="author-name">{post.author?.firstName} {post.author?.lastName}</p>
                    <p className="post-date">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="post-content">
                  <h3>{post.title}</h3>
                  <p>{post.content.substring(0, 200)}...</p>
                  <div className="post-tags">
                    {post.tags?.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="post-stats">
                  <span>{post.views} views</span>
                  <span>{post.comments?.length || 0} comments</span>
                  <span>{post.likes?.length || 0} likes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForumPage;
