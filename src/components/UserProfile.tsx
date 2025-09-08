import { useState } from "react";
import { User, Trophy, Star, LogOut, Award, TrendingUp, FileText, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authStorage } from "@/utils/auth";
import { storageUtils } from "@/utils/storage";

interface UserProfileProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const UserProfile = ({ onLogout, onNavigate }: UserProfileProps) => {
  const user = authStorage.getUser();
  const userProfile = storageUtils.getUserProfile(user?.id || "");
  const userClaims = storageUtils.getClaims().filter(c => c.submittedBy === user?.id);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'truth seeker': return 'bg-truth-green';
      case 'fact finder': return 'bg-blue-500';
      case 'myth buster': return 'bg-purple-500';
      case 'rookie': return 'bg-pending-orange';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-primary px-6 py-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate("home")} className="text-white">
            ←
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-white/90 text-sm">{user?.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold">{userProfile?.points || 0} Points</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <h3 className="font-semibold mb-4">Your Statistics</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{userClaims.length}</p>
            <p className="text-sm text-gray-600">Claims Submitted</p>
          </Card>
          
          <Card className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-truth-green" />
            <p className="text-2xl font-bold">{userClaims.filter(c => c.status !== 'pending').length}</p>
            <p className="text-sm text-gray-600">Verified Claims</p>
          </Card>
        </div>

        {/* Badges */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Your Badges</h3>
          <div className="flex flex-wrap gap-2">
            {userProfile?.badges?.length ? userProfile.badges.map((badge, index) => (
              <Badge key={index} className={`${getBadgeColor(badge)} text-white`}>
                <Award className="w-3 h-3 mr-1" />
                {badge}
              </Badge>
            )) : (
              <p className="text-gray-500 text-sm">No badges earned yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate("quiz")}
          >
            <Star className="w-4 h-4 mr-2" />
            Take Quiz & Earn Points
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate("leaderboard")}
          >
            <Trophy className="w-4 h-4 mr-2" />
            View Leaderboard
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate("claims")}
          >
            <FileText className="w-4 h-4 mr-2" />
            My Claims
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate("bookmarks")}
          >
            <BookmarkCheck className="w-4 h-4 mr-2" />
            My Bookmarks
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Recent Claims</h3>
          <div className="space-y-2">
            {userClaims.slice(0, 3).map((claim) => (
              <Card key={claim.id} className="p-3">
                <p className="text-sm line-clamp-2 mb-2">{claim.content}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">{claim.status}</Badge>
                  <span className="text-xs text-gray-500">{claim.submittedAt}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;