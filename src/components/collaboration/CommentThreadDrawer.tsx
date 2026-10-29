import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, X, Send, AtSign } from 'lucide-react';

export const CommentThreadDrawer: React.FC = () => {
  const {
    isCommentsDrawerOpen,
    setIsCommentsDrawerOpen,
    commentTarget,
    comments,
    addComment,
    allUsers
  } = useApp();

  const [commentText, setCommentText] = useState('');

  if (!isCommentsDrawerOpen) return null;

  // Filter comments for this target if targeted, else show all project comments
  const displayComments = commentTarget
    ? comments.filter(c => c.targetType === commentTarget.type && c.targetId === commentTarget.id)
    : comments;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(
      commentTarget?.type || 'object',
      commentTarget?.id || 'general',
      commentTarget?.name || 'Project Wide',
      commentText.trim()
    );

    setCommentText('');
  };

  const insertMention = (userName: string) => {
    setCommentText(prev => `${prev} @${userName.split(' ')[0]} `);
  };

  // Helper to highlight @mentions
  const formatBodyWithMentions = (body: string) => {
    const parts = body.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="comment-mention">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="side-drawer" id="comments-thread-drawer">
      <div className="side-drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <MessageSquare size={18} color="#818cf8" />
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              {commentTarget ? commentTarget.name : 'Team Discussions'}
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {commentTarget ? `Target: ${commentTarget.type}` : 'All Project Threads'}
            </span>
          </div>
        </div>
        <button className="node-btn-icon" onClick={() => setIsCommentsDrawerOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="side-drawer-content">
        {displayComments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
            <MessageSquare size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No comments yet.</p>
            <p style={{ fontSize: '0.78rem' }}>Start the thread below. Type @ to mention team members.</p>
          </div>
        ) : (
          displayComments.map(cmt => (
            <div key={cmt.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-author-info">
                  <img src={cmt.authorAvatar} alt={cmt.authorName} className="avatar-circle" style={{ width: 24, height: 24 }} />
                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{cmt.authorName}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="comment-body-text">{formatBodyWithMentions(cmt.body)}</div>
              {cmt.targetName && !commentTarget && (
                <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600 }}>
                  on {cmt.targetName} ({cmt.targetType})
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Form with Mention Shortcuts */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.6)' }}>
        {/* Quick mentions bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', overflowX: 'auto' }}>
          <AtSign size={12} color="#64748b" />
          <span style={{ fontSize: '0.7rem', color: '#64748b', marginRight: '0.2rem' }}>Mention:</span>
          {allUsers.map(u => (
            <button
              key={u.id}
              type="button"
              onClick={() => insertMention(u.name)}
              className="field-type-chip"
              style={{ cursor: 'pointer', fontSize: '0.7rem', padding: '1px 6px' }}
            >
              @{u.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Type your comment or question..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-pill primary" style={{ padding: '0.55rem' }}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
