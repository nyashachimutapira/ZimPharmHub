import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ArticlesPage.css';

function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/articles');
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="articles-page">
      <div className="container">
        <h1>Resource Hub</h1>
        <p className="subtitle">Articles, guides, and training opportunities</p>

        {loading ? (
          <p>Loading articles...</p>
        ) : (
          <div className="articles-grid">
            {articles.map((article) => (
              <div key={article._id} className="article-card">
                <div className="article-image"></div>
                <div className="article-content">
                  <span className="article-category">{article.category}</span>
                  <h3>{article.title}</h3>
                  <p className="article-excerpt">{article.excerpt || article.content.substring(0, 150)}...</p>
                  <div className="article-meta">
                    <span className="article-author">{article.author?.firstName}</span>
                    <span className="article-date">{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesPage;
