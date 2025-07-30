import React, { useState, useEffect } from 'react';
import { commentService, type Comment } from '../services/supabase';
import { updateIPCommentCount } from '../services/ipService';
import CommentModeration from './CommentModeration';

interface CommentSectionProps {
  ipId: string;
  className?: string;
}

interface CommentFormProps {
  ipId: string;
  parentCommentId?: string;
  onCommentAdded: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  ipId,
  parentCommentId,
  onCommentAdded,
  onCancel,
  placeholder = "Add a comment..."
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    setUserAddress(window.ethereum?.selectedAddress || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    if (!userAddress) {
      alert('Please connect your wallet to comment');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await commentService.createComment({
        ip_id: ipId,
        author_address: userAddress,
        content: content.trim(),
        parent_comment_id: parentCommentId
      });
      
      setContent('');
      onCommentAdded();
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to create comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none resize-none"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500">
          {!userAddress && "Connect wallet to comment"}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting || !userAddress}
            className="px-4 py-2 bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </form>
  );
};

interface CommentItemProps {
  comment: Comment;
  ipId: string;
  onCommentUpdated: () => void;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  ipId,
  onCommentUpdated,
  level = 0
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(true);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    setUserAddress(window.ethereum?.selectedAddress || '');
    loadReplies();
  }, [comment.id]);

  const loadReplies = async () => {
    try {
      const allComments = await commentService.getComments(ipId);
      const commentReplies = allComments.filter(c => c.parent_comment_id === comment.id);
      setReplies(commentReplies);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleLike = async () => {
    if (!userAddress) {
      alert('Please connect your wallet to like comments');
      return;
    }

    try {
      await commentService.toggleLike(comment.id, userAddress);
      onCommentUpdated();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await commentService.updateComment(comment.id, { content: editContent.trim() });
      setIsEditing(false);
      onCommentUpdated();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await commentService.deleteComment(comment.id);
      onCommentUpdated();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleReplyAdded = () => {
    setIsReplying(false);
    loadReplies();
    onCommentUpdated();
  };

  const isAuthor = userAddress === comment.author_address;
  const isLiked = JSON.parse(localStorage.getItem(`liked_comments_${userAddress}`) || '[]').includes(comment.id);

  return (
    <div className={`border-l-2 border-gray-200 pl-4 ${level > 0 ? 'ml-4' : ''}`}>
      <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pepe-green rounded-full flex items-center justify-center text-black font-bold text-sm">
              {comment.author_address.slice(2, 6).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-sm">
                {comment.author_username || `${comment.author_address.slice(0, 6)}...${comment.author_address.slice(-4)}`}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
                {comment.updated_at !== comment.created_at && ' (edited)'}
              </div>
            </div>
          </div>
          {isAuthor && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleEdit}
                disabled={isSubmitting}
                className="px-3 py-1 bg-pepe-green text-black text-sm rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-800 mb-3 whitespace-pre-wrap">
            {comment.content}
          </div>
        )}

        {/* Comment Actions */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={handleLike}
            disabled={!userAddress}
            className={`flex items-center gap-1 ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } ${!userAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{comment.like_count}</span>
          </button>
          
          <button
            onClick={() => setIsReplying(!isReplying)}
            disabled={!userAddress}
            className={`text-gray-500 hover:text-blue-600 ${!userAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            💬 Reply
          </button>

          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showReplies ? '👁️ Hide' : '👁️ Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {/* Moderation */}
          {!isAuthor && (
            <CommentModeration
              comment={comment}
              onCommentUpdated={onCommentUpdated}
            />
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3">
            <CommentForm
              ipId={ipId}
              parentCommentId={comment.id}
              onCommentAdded={handleReplyAdded}
              onCancel={() => setIsReplying(false)}
              placeholder={`Reply to ${comment.author_username || comment.author_address.slice(0, 6)}...`}
            />
          </div>
        )}
      </div>

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              ipId={ipId}
              onCommentUpdated={onCommentUpdated}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ ipId, className = '' }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    setUserAddress(window.ethereum?.selectedAddress || '');
    loadComments();
  }, [ipId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const allComments = await commentService.getComments(ipId);
      // Filter to only top-level comments (no parent_comment_id)
      const topLevelComments = allComments.filter(comment => !comment.parent_comment_id);
      setComments(topLevelComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = () => {
    loadComments();
    // Update the IP's comment count
    updateIPCommentCount(ipId).catch(error => {
      console.error('Error updating comment count:', error);
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-2xl mb-2">⚠️</div>
          <p>{error}</p>
          <button
            onClick={loadComments}
            className="mt-2 px-4 py-2 bg-pepe-green text-black rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-black">
          💬 Comments ({comments.length})
        </h3>
        {!userAddress && (
          <div className="text-sm text-gray-500">
            Connect wallet to comment
          </div>
        )}
      </div>

      {/* Comment Form */}
      <CommentForm
        ipId={ipId}
        onCommentAdded={handleCommentAdded}
        placeholder="Share your thoughts on this IP..."
      />

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💭</div>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              ipId={ipId}
              onCommentUpdated={handleCommentAdded}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection; 