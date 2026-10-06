import React, { useState } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReelItem } from '../../types';

interface CommentsModalProps {
  reel: ReelItem;
  onClose: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ reel, onClose }) => {
  const { addCommentToReel, currentUser } = useApp();
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentToReel(reel.id, commentText);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 text-white max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Chit-Chat & Comments</h3>
            <div className="text-[11px] text-slate-400">
              <span>{reel.comments.length} conversations</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>@{reel.username}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {reel.comments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <p>No comments yet on this Gapsap.</p>
              <p className="mt-1 text-slate-500">Be the first to share your thoughts!</p>
            </div>
          ) : (
            reel.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <img
                  src={c.userAvatar}
                  alt={c.username}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">@{c.username}</span>
                    <span className="text-[10px] text-slate-500">{c.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{c.text}</p>
                </div>
                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add to the conversation..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold flex items-center justify-center shrink-0 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
