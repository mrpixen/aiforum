import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/Thread.css';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  reactions: {
    type: string;
    count: number;
  }[];
}

interface Thread {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  category: {
    id: string;
    name: string;
  };
  posts: Post[];
}

const Thread: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const response = await api.get<Thread>(`/threads/${id}`);
        setThread(response.data);
      } catch (err) {
        setError('Failed to load thread');
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [id]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await api.post<Post>(`/threads/${id}/posts`, {
        content: newPost,
      });
      setThread(prev => prev ? {
        ...prev,
        posts: [...prev.posts, response.data],
      } : null);
      setNewPost('');
    } catch (err) {
      setError('Failed to post reply');
    }
  };

  const handleReaction = async (postId: string, type: string) => {
    try {
      await api.post(`/posts/${postId}/reactions`, { type });
      // Update the thread state with the new reaction count
      setThread(prev => {
        if (!prev) return null;
        return {
          ...prev,
          posts: prev.posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                reactions: post.reactions.map(reaction => 
                  reaction.type === type
                    ? { ...reaction, count: reaction.count + 1 }
                    : reaction
                ),
              };
            }
            return post;
          }),
        };
      });
    } catch (err) {
      setError('Failed to add reaction');
    }
  };

  if (loading) {
    return <div>Loading thread...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!thread) {
    return <div>Thread not found</div>;
  }

  return (
    <div className="thread-container">
      <div className="thread-header">
        <h1>{thread.title}</h1>
        <div className="thread-meta">
          <span>Posted by {thread.author.username}</span>
          <span>in {thread.category.name}</span>
          <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="thread-content">
        <p>{thread.content}</p>
      </div>

      <div className="posts-container">
        <h2>Replies ({thread.posts.length})</h2>
        {thread.posts.map(post => (
          <div key={post.id} className="post">
            <div className="post-header">
              <span className="post-author">{post.author.username}</span>
              <span className="post-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="post-content">
              <p>{post.content}</p>
            </div>
            <div className="post-reactions">
              {post.reactions.map(reaction => (
                <button
                  key={reaction.type}
                  className="reaction-button"
                  onClick={() => handleReaction(post.id, reaction.type)}
                >
                  {reaction.type} ({reaction.count})
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handlePostSubmit} className="post-form">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Write your reply..."
            required
          />
          <button type="submit" className="submit-button">
            Post Reply
          </button>
        </form>
      )}
    </div>
  );
};

export default Thread; 