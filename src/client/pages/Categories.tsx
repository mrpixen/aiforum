import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Categories.css';

interface Category {
  id: string;
  name: string;
  description: string;
  threadCount: number;
  lastThread?: {
    id: string;
    title: string;
    createdAt: string;
  };
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<Category[]>('/api/categories');
        setCategories(response.data);
      } catch (err) {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="categories-container">
      <h1>Categories</h1>
      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <h2>{category.name}</h2>
            <p>{category.description}</p>
            <div className="category-stats">
              <span>{category.threadCount} threads</span>
              {category.lastThread && (
                <div className="last-thread">
                  <span>Latest: </span>
                  <Link to={`/thread/${category.lastThread.id}`}>
                    {category.lastThread.title}
                  </Link>
                  <span className="thread-date">
                    {new Date(category.lastThread.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories; 