import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types/category';
import { Thread } from '../types/thread';

interface HomeProps {
  featuredCategories?: Category[];
  recentThreads?: Thread[];
}

const Home: React.FC<HomeProps> = ({ 
  featuredCategories = [], 
  recentThreads = [] 
}) => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to Modern Forum</h1>
        <p>A place for meaningful discussions and community building</p>
        <div className="hero-actions">
          <Link to="/register" className="primary-button">
            Join Now
          </Link>
          <Link to="/threads" className="secondary-button">
            Browse Threads
          </Link>
        </div>
      </section>

      {featuredCategories.length > 0 && (
        <section className="featured-categories">
          <h2>Featured Categories</h2>
          <div className="category-grid">
            {featuredCategories.map(category => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="category-card"
              >
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentThreads.length > 0 && (
        <section className="recent-threads">
          <h2>Recent Discussions</h2>
          <div className="thread-list">
            {recentThreads.map(thread => (
              <div key={thread.id} className="thread-card">
                <div className="thread-header">
                  <Link to={`/threads/${thread.id}`} className="thread-title">
                    {thread.title}
                  </Link>
                  <span className="thread-category">
                    in <Link to={`/categories/${thread.category.id}`}>{thread.category.name}</Link>
                  </span>
                </div>
                <div className="thread-meta">
                  <span className="thread-author">
                    by <Link to={`/users/${thread.author.id}`}>{thread.author.username}</Link>
                  </span>
                  <span className="thread-stats">
                    {thread.viewCount} views • {thread.posts?.length || 0} replies
                  </span>
                  <span className="thread-time">
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home; 