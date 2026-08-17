import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JourneyProvider, useJourney } from './context/JourneyContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Header } from './components/layout/Header';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { Toast } from './components/layout/Toast';
import { LoginModal } from './components/auth/LoginModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { EditProfileModal } from './components/auth/EditProfileModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { PlanJourney } from './components/journey/PlanJourney';
import { LiveJourney } from './components/journey/LiveJourney';
import { ShareModal } from './components/journey/ShareModal';
import { DelayModal } from './components/journey/DelayModal';
import { DestinationReachedModal } from './components/journey/DestinationReachedModal';
import { NapModeOverlay } from './components/nap/NapModeOverlay';
import { SafetyCircle } from './components/safety/SafetyCircle';
import { SOSModal } from './components/safety/SOSModal';
import { JourneyHistoryView } from './components/history/JourneyHistoryView';
import { FavouriteRoutesView } from './components/favourites/FavouriteRoutesView';
import { SettingsView } from './components/settings/SettingsView';
import { FavouriteRoute } from './types';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isOnboardingCompleted } = useAuth();
  const { 
    activeJourney, 
    activeToast, 
    showToast, 
    isArrivalModalOpen, 
    closeArrivalModal,
    startJourney,
    availableRoutes
  } = useJourney();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);

  // If not logged in, show Login
  if (!isAuthenticated || !user) {
    return <LoginModal />;
  }

  // If first-time onboarding not done, show Onboarding
  if (!isOnboardingCompleted) {
    return <OnboardingModal />;
  }

  const handleStartFavourite = (fav: FavouriteRoute) => {
    setCurrentTab('plan');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      
      {/* App Header */}
      <Header onOpenProfile={() => setIsEditProfileOpen(true)} />

      {/* Main Container Layout (Mobile + Desktop Sidebar) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Desktop Sidebar & Mobile Bottom Nav */}
        <BottomNav 
          currentTab={currentTab} 
          onSelectTab={(tab) => setCurrentTab(tab)} 
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 px-4 py-6 sm:px-6 md:pl-72 max-w-5xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <Dashboard 
              onNavigate={(tab) => setCurrentTab(tab)} 
              onOpenShare={() => setIsShareModalOpen(true)}
            />
          )}

          {currentTab === 'plan' && (
            <PlanJourney 
              onStartSuccess={() => setCurrentTab('live')} 
            />
          )}

          {currentTab === 'live' && (
            <LiveJourney 
              onOpenShare={() => setIsShareModalOpen(true)}
              onOpenDelayShare={() => setIsDelayModalOpen(true)}
            />
          )}

          {currentTab === 'history' && (
            <JourneyHistoryView />
          )}

          {currentTab === 'favourites' && (
            <FavouriteRoutesView 
              onStartRoute={handleStartFavourite}
              onNavigateToPlan={() => setCurrentTab('plan')}
            />
          )}

          {currentTab === 'safety' && (
            <SafetyCircle />
          )}

          {currentTab === 'settings' && (
            <SettingsView 
              onOpenEditProfile={() => setIsEditProfileOpen(true)} 
            />
          )}
        </main>

      </div>

      {/* Modals & Overlays */}
      {isEditProfileOpen && (
        <EditProfileModal onClose={() => setIsEditProfileOpen(false)} />
      )}

      {isShareModalOpen && (
        <ShareModal onClose={() => setIsShareModalOpen(false)} />
      )}

      {isDelayModalOpen && (
        <DelayModal onClose={() => setIsDelayModalOpen(false)} />
      )}

      {isArrivalModalOpen && (
        <DestinationReachedModal onClose={closeArrivalModal} />
      )}

      {/* Nap Mode Full-Screen Wake-up Alarm */}
      <NapModeOverlay />

      {/* SOS Emergency Modal */}
      <SOSModal />

      {/* Animated Floating Toast */}
      <Toast 
        toast={activeToast} 
        onDismiss={() => {}} 
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <JourneyProvider>
          <MainApp />
        </JourneyProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
