import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/types";
import { storageUtils } from "@/utils/storage";
import { authStorage } from "@/utils/auth";

interface LeaderboardSectionProps {
  onNavigate: (view: string) => void;
}

const LeaderboardSection = ({ onNavigate }: LeaderboardSectionProps) => {
  const [weeklyLeaders, setWeeklyLeaders] = useState<UserProfile[]>([]);
  const [monthlyLeaders, setMonthlyLeaders] = useState<UserProfile[]>([]);
  const [allTimeLeaders, setAllTimeLeaders] = useState<UserProfile[]>([]);
  
  const currentUser = authStorage.getUser();

  useEffect(() => {
    const profiles = storageUtils.getAllUserProfiles();
    
    // Sort by points for all-time leaderboard
    const allTime = [...profiles].sort((a, b) => b.points - a.points);
    setAllTimeLeaders(allTime);
    
    // For demo purposes, we'll use the same data for weekly/monthly
    // In a real app, you'd filter by date ranges
    setWeeklyLeaders(allTime);
    setMonthlyLeaders(allTime);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3: return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const LeaderboardList = ({ leaders }: { leaders: UserProfile[] }) => (
    <div className="space-y-3">
      {leaders.map((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user.id === currentUser?.id;
        
        return (
          <Card 
            key={user.id} 
            className={`p-4 ${isCurrentUser ? 'border-primary bg-primary/5' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12">
                {getRankIcon(rank)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${isCurrentUser ? 'text-primary' : ''}`}>
                    {user.name}
                  </h3>
                  {isCurrentUser && <Badge variant="outline">You</Badge>}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>{user.points} points</span>
                  </div>
                  <span>{user.claimsSubmitted} claims</span>
                  <span>{user.badges.length} badges</span>
                </div>
              </div>
              
              <Badge className={getRankBadgeColor(rank)}>
                #{rank}
              </Badge>
            </div>
          </Card>
        );
      })}
      
      {leaders.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No rankings available yet</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => onNavigate("home")}>
            ←
          </Button>
          <h2 className="font-semibold text-lg ml-2">Leaderboard</h2>
        </div>
      </div>

      {/* Current User Stats */}
      {currentUser && (
        <div className="p-6 bg-gradient-primary text-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="font-semibold mb-1">{currentUser.name}</h3>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div>
                <span className="block text-2xl font-bold">
                  {storageUtils.getUserProfile(currentUser.id)?.points || 0}
                </span>
                <span className="text-white/90">Points</span>
              </div>
              <div>
                <span className="block text-2xl font-bold">
                  #{allTimeLeaders.findIndex(u => u.id === currentUser.id) + 1 || '-'}
                </span>
                <span className="text-white/90">Rank</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="weekly" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-6 mb-4">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TabsContent value="weekly" className="mt-0">
              <LeaderboardList leaders={weeklyLeaders.slice(0, 10)} />
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-0">
              <LeaderboardList leaders={monthlyLeaders.slice(0, 10)} />
            </TabsContent>
            
            <TabsContent value="alltime" className="mt-0">
              <LeaderboardList leaders={allTimeLeaders.slice(0, 10)} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default LeaderboardSection;