import { useState } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { COMMENTS } from '../data/users';
import { NOVELS } from '../data/novels';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

type CommentTab = 'novel' | 'chapter';

export default function CommentsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<CommentTab>('novel');
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  const selectedNovel = NOVELS[0];

  const toggleLike = (id: number) => {
    setLikedComments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Novel Info Bar */}
      <div className="sticky top-14 z-30 bg-gray-50 dark:bg-[#0f0f1a] border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <img src={selectedNovel.cover} alt={selectedNovel.title} className="w-10 h-14 object-cover rounded-lg" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedNovel.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Chapter 12</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-6 border-t border-gray-100 dark:border-gray-800">
          {(['novel', 'chapter'] as CommentTab[]).map(tabId => (
            <button key={tabId} onClick={() => setTab(tabId)}
              className={`py-2.5 text-sm font-semibold transition-colors relative capitalize ${tab === tabId ? 'text-[#e91e8c]' : 'text-gray-500 dark:text-gray-400'}`}>
              {tabId === 'novel' ? 'Novel Comments' : 'Chapter Comments'}
              {tab === tabId && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e91e8c] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Comment Input */}
        {user && (
          <div className="flex gap-3 mb-5">
            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
            <div className="flex-1 flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)}
                type="text" placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-[#1e1e32] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e91e8c] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
              <button onClick={() => setNewComment('')}
                className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-sm">
                <Send className="w-4 h-4" />
                Post
              </button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-5">
          {COMMENTS.map(comment => (
            <div key={comment.id}>
              <div className="flex gap-3">
                <img src={comment.userAvatar} alt={comment.userName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="flex-1">
                  <div className="bg-white dark:bg-[#1e1e32] rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{comment.userName}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 px-1">
                    <button onClick={() => toggleLike(comment.id)} className={`flex items-center gap-1 text-xs transition-colors ${likedComments.has(comment.id) ? 'text-[#e91e8c]' : 'text-gray-500 dark:text-gray-400 hover:text-[#e91e8c]'}`}>
                      <Heart className={`w-3.5 h-3.5 ${likedComments.has(comment.id) ? 'fill-[#e91e8c]' : ''}`} />
                      <span>{comment.likes + (likedComments.has(comment.id) ? 1 : 0)}</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-[#e91e8c] transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Reply
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex gap-2 mt-3 ml-2">
                      <img src={reply.userAvatar} alt={reply.userName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2.5 border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{reply.userName}</span>
                            <span className="text-[10px] text-gray-400">{reply.time}</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{reply.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <button className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 hover:text-[#e91e8c]">
                            <Heart className="w-3 h-3" />
                            {reply.likes}
                          </button>
                          <button className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-[#e91e8c]">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
