
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AppHeader from "./AppHeader";
import FeedTab from "./FeedTab";
import Explore from "./Explore";
import ChatTab from "./ChatTab";
import Profile from "./Profile";
import Comments from "./Comments";
import Share from "./Share";
import ProfileEditModal from "./ProfileEditModal";

const AppLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  
  const [activeTab, setActiveTab] = useState("feed");
  const [currentView, setCurrentView] = useState("main");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showComments, setShowComments] = useState<string | null>(null);
  const [showShare, setShowShare] = useState<string | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const openProfile = (username: string) => {
    setSelectedUserId(username);
    setCurrentView("profile");
  };

  const handleShowComments = (postId: string) => {
    setShowComments(postId);
  };

  const handleShowShare = (postId: string) => {
    setShowShare(postId);
  };

  if (currentView === "profile") {
    return (
      <Profile 
        userId={selectedUserId} 
        onBack={() => setCurrentView("main")} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <AppHeader 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onShowProfileEdit={() => setShowProfileEdit(true)}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "feed" && (
          <FeedTab 
            profile={profile}
            onOpenProfile={openProfile}
            onShowComments={handleShowComments}
            onShowShare={handleShowShare}
          />
        )}

        {activeTab === "explore" && <Explore />}

        {activeTab === "chat" && <ChatTab />}
      </div>

      {/* Modals */}
      {showComments && (
        <Comments 
          postId={showComments} 
          onClose={() => setShowComments(null)} 
        />
      )}
      
      {showShare && (
        <Share 
          postId={showShare} 
          onClose={() => setShowShare(null)} 
        />
      )}

      {showProfileEdit && (
        <ProfileEditModal
          isOpen={showProfileEdit}
          onClose={() => setShowProfileEdit(false)}
          profile={profile}
        />
      )}
    </div>
  );
};

export default AppLayout;
