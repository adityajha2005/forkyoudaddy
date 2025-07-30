import React, { useState } from 'react';
import { commentService, type Comment } from '../services/supabase';

interface CommentModerationProps {
  comment: Comment;
  onCommentUpdated: () => void;
}

const CommentModeration: React.FC<CommentModerationProps> = ({
  comment,
  onCommentUpdated
}) => {
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagForm, setShowFlagForm] = useState(false);

  const handleFlagComment = async () => {
    if (!flagReason.trim()) return;
    
    setIsFlagging(true);
    try {
      await commentService.updateComment(comment.id, { 
        is_flagged: true 
      });
      setShowFlagForm(false);
      setFlagReason('');
      onCommentUpdated();
      alert('Comment has been flagged for review. Thank you for helping keep the community safe!');
    } catch (error) {
      console.error('Error flagging comment:', error);
      alert('Failed to flag comment. Please try again.');
    } finally {
      setIsFlagging(false);
    }
  };

  if (comment.is_flagged) {
    return (
      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
        ⚠️ This comment has been flagged for review
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setShowFlagForm(!showFlagForm)}
        className="text-xs text-red-600 hover:text-red-800"
      >
        🚩 Flag
      </button>
      
      {showFlagForm && (
        <div className="mt-2 p-3 bg-red-50 rounded border border-red-200">
          <textarea
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            placeholder="Reason for flagging this comment..."
            rows={2}
            className="w-full px-2 py-1 text-sm border border-red-300 rounded focus:border-red-500 focus:outline-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleFlagComment}
              disabled={!flagReason.trim() || isFlagging}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded disabled:opacity-50"
            >
              {isFlagging ? 'Flagging...' : 'Submit Flag'}
            </button>
            <button
              onClick={() => {
                setShowFlagForm(false);
                setFlagReason('');
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentModeration; 