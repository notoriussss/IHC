import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../../types/forum';
import './PostItem.css';

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  return (
    <div className="post-item">
      <div className="post-content">
        <Link to={`/post/${post.id}`} className="post-link">
          <div className="post-header">
            <h3 className="post-title">{post.title}</h3>
            {post.category && (
              <span className={`post-category category-${post.category.toLowerCase()}`}>
                {post.category}
              </span>
            )}
          </div>
          <div className="post-meta">
            <span>
              <i className="fas fa-user"></i> {post.author}
            </span>
            <span>
              <i className="fas fa-calendar"></i> {new Date(post.date).toLocaleDateString()}
            </span>
            <span>
              <i className="fas fa-comments"></i> {post.comments.length} comentarios
            </span>
          </div>
          <div className="post-body">
            {post.content}
          </div>
        </Link>
      </div>
      <div className="post-footer">
        <Link to={`/post/${post.id}`} className="action-btn">
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default PostItem;