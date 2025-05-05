import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import io from 'socket.io-client';
import '../styles/Thread.css';

interface ThreadData {
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

interface Post {
  id: string;
  threadId: string;
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

const postsPerPage = 10;  // Define a default value for posts per page

const Thread: React.FC = () => {
  console.log('Thread component mounted for ID:', useParams<{ id: string }>()?.id);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const socket = useRef<any>(null);

  useEffect(() => {
    socket.current = io('http://localhost:4000');
    const fetchThread = async () => {
      try {
        const response = await api.get(`/threads/${id}?page=${page}&limit=${postsPerPage}`);
        if (response.data) {
          setThread(response.data);
        } else {
          console.error('Unexpected API response format:', response);
          setThread(null);
          setError('Unexpected API response format');
        }
      } catch (err) {
        console.error('Failed to load thread:', err);
        setError('Failed to load thread');
      } finally {
        setLoading(false);
      }
    };

    fetchThread();

    socket.current.on('newPost', (newPostData: Post) => {
      if (newPostData.threadId === id) {
        setThread(prev => prev ? { ...prev, posts: [...prev.posts, newPostData] } : null);
      }
    });

    socket.current.on('newReaction', (updatedPost: Post) => {
      if (thread) {
        setThread(prev => prev ? {
          ...prev,
          posts: prev.posts.map(p => p.id === updatedPost.id ? updatedPost : p)
        } : null);
      }
    });

    return () => socket.current.disconnect();
  }, [id, page, thread]);

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

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditedContent(post.content);
  };

  const handleUpdatePost = async (postId: string) => {
    try {
      const response = await api.put(`/posts/${postId}`, { content: editedContent });
      setThread(prev => prev ? {
        ...prev,
        posts: prev.posts.map(p => p.id === postId ? response.data : p)
      } : null);
      setEditingPostId(null);
      setEditedContent('');
    } catch (err) {
      setError('Failed to update post');
    }
  };

  const loadMorePosts = () => {
    setPage(prev => prev + 1);
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
              <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="post-content">
              {editingPostId === post.id ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Edit your post..."
                />
              ) : (
                <p>{post.content}</p>
              )}
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
              {post.author.id === user?.id && !editingPostId && (
                <button onClick={() => handleEditPost(post)}>Edit</button>
              )}
              {editingPostId === post.id && (
                <button onClick={() => handleUpdatePost(post.id)}>Save Edit</button>
              )}
            </div>
          </div>
        ))}
        <button onClick={loadMorePosts}>Load More</button>
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