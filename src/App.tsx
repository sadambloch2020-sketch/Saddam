/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { StoriesTray } from './components/stories/StoriesTray';
import { StoryViewer } from './components/stories/StoryViewer';
import { ReelsFeed } from './components/reels/ReelsFeed';
import { LocationDiscovery } from './components/location/LocationDiscovery';
import { ChatHub } from './components/chat/ChatHub';
import { ProfileView } from './components/profile/ProfileView';
import { CameraStudio } from './components/camera/CameraStudio';

const AppContent: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pb-20 md:pb-8 max-w-6xl w-full mx-auto px-2 sm:px-4 pt-3">
        {activeTab === 'reels' && (
          <div className="flex-1 flex flex-col">
            <StoriesTray />
            <ReelsFeed />
          </div>
        )}

        {activeTab === 'nearby' && <LocationDiscovery />}

        {activeTab === 'chat' && <ChatHub />}

        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav />

      {/* Fullscreen Interactive Camera Recording Studio */}
      <CameraStudio />

      {/* Fullscreen Interactive Story Viewer */}
      <StoryViewer />

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-slate-700 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
