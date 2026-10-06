import React from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StoriesTray: React.FC = () => {
  const { currentUser, stories, openCamera, openStoryViewer } = useApp();

  const myStoryGroup = stories.find((g) => g.userId === currentUser.id);
  const otherStories = stories.filter((g) => g.userId !== currentUser.id);

  return (
    <div className="w-full max-w-md mx-auto py-2.5 px-3 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 mb-3">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
        {/* User's Own Story Button (+ to record or view if present) */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <button
              onClick={() => {
                if (myStoryGroup && myStoryGroup.stories.length > 0) {
                  openStoryViewer(myStoryGroup);
                } else {
                  openCamera('story');
                }
              }}
              className="relative p-0.5 rounded-full block group"
              title={myStoryGroup && myStoryGroup.stories.length > 0 ? 'View your story' : 'Add to story'}
            >
              <div
                className={`p-0.5 rounded-full ${
                  myStoryGroup && myStoryGroup.stories.length > 0
                    ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500'
                    : 'bg-slate-700'
                }`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-950 group-hover:opacity-90 transition-opacity"
                />
              </div>
            </button>

            {/* Plus badge shortcut directly to Camera */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openCamera('story');
              }}
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center border-2 border-slate-950 shadow-md"
              title="Record new story"
              aria-label="Add Story"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
          <span className="text-[11px] font-medium text-slate-300 mt-1 max-w-[64px] truncate text-center">
            Your Story
          </span>
        </div>

        {/* Other Creators' Stories */}
        {otherStories.map((group) => (
          <button
            key={group.userId}
            onClick={() => openStoryViewer(group)}
            className="flex flex-col items-center shrink-0 group focus:outline-none"
          >
            <div
              className={`p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                group.hasUnseen
                  ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 shadow-sm'
                  : 'bg-slate-700'
              }`}
            >
              <div className="p-0.5 bg-slate-950 rounded-full">
                <img
                  src={group.userAvatar}
                  alt={group.username}
                  referrerPolicy="no-referrer"
                  className="w-13 h-13 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-300 mt-1 max-w-[64px] truncate text-center group-hover:text-amber-400 transition-colors">
              @{group.username}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
