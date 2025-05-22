import React, { useState } from 'react';
import './CommentBox.css';

interface CommentBoxProps {
  onSubmit: (comment: string) => void;
  avatarUrl?: string; // Opcional: para mostrar avatar
}

const CommentBox: React.FC<CommentBoxProps> = ({ onSubmit, avatarUrl }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment);
      setComment('');
    }
  };

  return (
    <form className="comment-box" onSubmit={handleSubmit}>
      {avatarUrl && (
        <img src={avatarUrl} alt="avatar" className="comment-avatar" />
      )}
      <div className="comment-input-area">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Agrega un comentario público..."
          className="comment-textarea"
          rows={3}
        />
        <div className="comment-actions">
          <button
            type="submit"
            className="comment-submit"
            disabled={!comment.trim()}
          >
            Comentar
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentBox;
