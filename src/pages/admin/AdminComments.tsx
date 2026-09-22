import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Heart, CornerDownRight, AlertCircle } from 'lucide-react';
import { adminApi, AdminNovelListItem, CommentItem } from '../../lib/resources';
import { ApiError } from '../../lib/api';

export default function AdminComments() {
  const [novels, setNovels] = useState<AdminNovelListItem[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<number | ''>('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    adminApi.listNovels()
      .then(list => {
        setNovels(list);
        if (list.length > 0) setSelectedNovelId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadComments = (novelId: number) => {
    setCommentsLoading(true);
    adminApi.listComments(novelId, 1, 50)
      .then(res => setComments(res.items))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  };

  useEffect(() => {
    if (selectedNovelId) {
      loadComments(Number(selectedNovelId));
    } else {
      setComments([]);
    }
  }, [selectedNovelId]);

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Delete this comment and all its replies?')) return;
    setActionMsg('');
    setErrorMsg('');
    try {
      await adminApi.deleteComment(commentId);
      setActionMsg('Comment deleted successfully.');
      if (selectedNovelId) loadComments(Number(selectedNovelId));
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Failed to delete comment.');
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!window.confirm('Delete this reply?')) return;
    setActionMsg('');
    setErrorMsg('');
    try {
      await adminApi.deleteReply(replyId);
      setActionMsg('Reply deleted successfully.');
      if (selectedNovelId) loadComments(Number(selectedNovelId));
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Failed to delete reply.');
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Comments Moderation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Moderate community comments across novels</p>
        </div>

        <div className="w-full sm:w-72">
          <select
            value={selectedNovelId}
            onChange={e => setSelectedNovelId(e.target.value ? Number(e.target.value) : '')}
            className="input-field py-2 text-sm"
            disabled={loading || novels.length === 0}
          >
            {novels.length === 0 ? (
              <option value="">No novels found</option>
            ) : (
              novels.map(n => (
                <option key={n.id} value={n.id}>
                  {n.translations[0]?.title || n.slug}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {actionMsg && (
        <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium">
          {actionMsg}
        </div>
      )}

      {errorMsg && (
        <div className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {commentsLoading ? (
        <div className="card p-12 text-center">
          <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin inline-block" />
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={comment.userAvatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={comment.userName}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{comment.userName}</p>
                    <p className="text-xs text-gray-400">{comment.createdAt}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete Comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                {comment.content}
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-[#e91e8c]" />
                  {comment.likes} likes
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  {comment.replies ? comment.replies.length : 0} replies
                </span>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-6 pt-2 border-l-2 border-gray-100 dark:border-gray-800 space-y-2.5">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex items-start justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/20 p-2.5 rounded-xl">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <CornerDownRight className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                        <img
                          src={reply.userAvatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200'}
                          alt={reply.userName}
                          className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">
                            {reply.userName} <span className="text-[10px] text-gray-400 font-normal">({reply.createdAt})</span>
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{reply.content}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                        title="Delete Reply"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {comments.length === 0 && !commentsLoading && (
            <div className="card p-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No comments found for this novel.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

