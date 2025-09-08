import { useState, useEffect } from "react";
import { Search, Plus, Shield, CheckCircle, XCircle, AlertTriangle, Clock, Play, User, Bell, TrendingUp, FileText, Home, Camera, Video, Link, Hash, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Claim, ClaimCategory, BlogPost, TrendingTopic } from "@/types";
import { storageUtils } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { authStorage } from "@/utils/auth";
import CategoryFilter from "./CategoryFilter";
import NotificationCenter from "./NotificationCenter";
import TrendingSection from "./TrendingSection";
import BlogSection from "./BlogSection";
import UserProfile from "./UserProfile";
import QuizSection from "./QuizSection";
import LeaderboardSection from "./LeaderboardSection";
import SocialShare from "./SocialShare";
import BookmarkSection from "./BookmarkSection";
import BlogPublisher from "./BlogPublisher";

const TruthGuardApp = () => {
  const [currentView, setCurrentView] = useState<"home" | "submit" | "claims" | "detail" | "trending" | "blog" | "profile" | "quiz" | "leaderboard" | "bookmarks" | "publish">("home");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [claimText, setClaimText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState<ClaimCategory>("other");
  const [tags, setTags] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ClaimCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const currentUser = authStorage.getUser();
  
  useEffect(() => {
    const allClaims = storageUtils.getClaims();
    setClaims(allClaims);
    setFilteredClaims(allClaims);
  }, []);

  useEffect(() => {
    let filtered = claims;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      filtered = storageUtils.searchClaims(searchQuery);
      if (selectedCategory !== "all") {
        filtered = filtered.filter(c => c.category === selectedCategory);
      }
    }
    
    setFilteredClaims(filtered);
  }, [claims, selectedCategory, searchQuery]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "true": return <CheckCircle className="w-5 h-5 text-truth-green" />;
      case "false": return <XCircle className="w-5 h-5 text-false-red" />;
      case "misleading": return <AlertTriangle className="w-5 h-5 text-misleading-yellow" />;
      case "satire": return <Play className="w-5 h-5 text-purple-500" />;
      case "needs-context": return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-pending-orange" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "true": return <Badge className="bg-truth-green hover:bg-truth-green/90">True</Badge>;
      case "false": return <Badge className="bg-false-red hover:bg-false-red/90">False</Badge>;
      case "misleading": return <Badge className="bg-misleading-yellow hover:bg-misleading-yellow/90 text-black">Misleading</Badge>;
      case "satire": return <Badge className="bg-purple-500 hover:bg-purple-600">Satire</Badge>;
      case "needs-context": return <Badge className="bg-blue-500 hover:bg-blue-600">Needs Context</Badge>;
      default: return <Badge className="bg-pending-orange hover:bg-pending-orange/90">Under Review</Badge>;
    }
  };

  const categories: ClaimCategory[] = ["elections", "governance", "health", "security", "economy", "education", "environment", "social", "technology", "other"];

  if (currentView === "home") {
    return (
      <div className="flex flex-col h-full bg-gradient-hero">
        {/* Header */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between text-white mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">HAKIKISHA</h1>
                <p className="text-xs text-white/90">Misinformation Fighter</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser && <NotificationCenter userId={currentUser.id} />}
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("profile")} className="text-white">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-1 bg-white rounded-t-3xl px-6 py-6">
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            <Button 
              size="sm" 
              variant={currentView === "home" ? "default" : "outline"}
              className="whitespace-nowrap"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentView("trending")}
              className="whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Trending
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentView("blog")}
              className="whitespace-nowrap"
            >
              <FileText className="w-4 h-4 mr-1" />
              Education
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentView("quiz")}
              className="whitespace-nowrap"
            >
              <Star className="w-4 h-4 mr-1" />
              Quiz
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCurrentView("leaderboard")}
              className="whitespace-nowrap"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Leaderboard
            </Button>
            {currentUser?.role === "admin" && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setCurrentView("publish")}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-1" />
                Publish
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => setCurrentView("submit")}
              className="w-full h-14 bg-gradient-primary hover:opacity-90 text-white font-semibold rounded-xl shadow-truth"
            >
              <Plus className="w-5 h-5 mr-2" />
              Submit Claim for Verification
            </Button>
            
            <Button 
              onClick={() => setCurrentView("claims")}
              variant="outline"
              className="w-full h-14 border-2 border-primary/20 hover:bg-primary/5 font-semibold rounded-xl"
            >
              <Search className="w-5 h-5 mr-2" />
              View Verified Claims
            </Button>
          </div>

          {/* Recent Activity */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4">Recent Verifications</h3>
            <div className="space-y-3">
              {claims.slice(0, 3).map((claim) => (
                <Card key={claim.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  setSelectedClaim(claim);
                  setCurrentView("detail");
                }}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(claim.status)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 line-clamp-2">{claim.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        {getStatusBadge(claim.status)}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="outline" className="text-xs">{claim.category}</Badge>
                          {claim.views && <span>{claim.views} views</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "submit") {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("home")}>
              ←
            </Button>
            <h2 className="font-semibold text-lg ml-2">Submit Claim</h2>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Claim or Statement</label>
              <Textarea
                placeholder="Enter the claim you want fact-checked..."
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                className="min-h-32 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={category} onValueChange={(value) => setCategory(value as ClaimCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elections">Elections</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (Optional)</label>
              <Input 
                placeholder="election, voting, security (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Source URL (Optional)
                </label>
                <Input 
                  placeholder="https://example.com/article" 
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Image URL (Optional)
                </label>
                <Input 
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video URL (Optional)
                </label>
                <Input 
                  placeholder="https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold rounded-xl shadow-truth"
              disabled={!claimText.trim() || !currentUser}
              onClick={() => {
                if (!currentUser) return;
                
                const newClaim = storageUtils.addClaim({ 
                  content: claimText,
                  sourceUrl: sourceUrl || undefined,
                  imageUrl: imageUrl || undefined,
                  videoUrl: videoUrl || undefined,
                  category,
                  submittedBy: currentUser.id,
                  tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
                });
                
                const updatedClaims = storageUtils.getClaims();
                setClaims(updatedClaims);
                setFilteredClaims(updatedClaims);
                
                // Clear form
                setClaimText("");
                setSourceUrl("");
                setImageUrl("");
                setVideoUrl("");
                setCategory("other");
                setTags("");
                
                // Trigger AI analysis simulation
                storageUtils.simulateAIAnalysis(newClaim.id);
                
                toast({
                  title: "Claim Submitted",
                  description: "Your claim has been submitted for AI analysis and fact-checking review."
                });
                setCurrentView("claims");
              }}
            >
              Submit for Verification
            </Button>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your claim will be reviewed by our fact-checking team and verified using multiple sources. You'll receive a notification when the verification is complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "claims") {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("home")}>
              ←
            </Button>
            <h2 className="font-semibold text-lg ml-2">Claims Database</h2>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="px-6 py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search claims..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Claims List */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-4 pb-6">
            {filteredClaims.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No claims found</p>
              </div>
            ) : (
              filteredClaims.map((claim) => (
                <Card key={claim.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  // Increment view count
                  const updated = storageUtils.updateClaim(claim.id, { views: (claim.views || 0) + 1 });
                  if (updated) {
                    setClaims(storageUtils.getClaims());
                  }
                  setSelectedClaim(claim);
                  setCurrentView("detail");
                }}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(claim.status)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{claim.content}</p>
                      <div className="flex items-center justify-between mb-2">
                        {getStatusBadge(claim.status)}
                        <span className="text-xs text-gray-500">{claim.submittedAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{claim.category}</Badge>
                        {claim.trending && <Badge className="bg-gradient-primary text-xs">Trending</Badge>}
                        {claim.views && <span className="text-xs text-gray-500">{claim.views} views</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "detail" && selectedClaim) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("claims")}>
              ←
            </Button>
            <h2 className="font-semibold text-lg ml-2">Claim Details</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Status */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  {getStatusIcon(selectedClaim.status)}
                </div>
              </div>
              {getStatusBadge(selectedClaim.status)}
            </div>

            {/* Claim */}
            <div>
              <h3 className="font-semibold mb-3">Claim</h3>
              <Card className="p-4 bg-gray-50">
                <p className="text-gray-700">{selectedClaim.content}</p>
              </Card>
            </div>

            {/* Verdict */}
            {selectedClaim.verdict && (
              <div>
                <h3 className="font-semibold mb-3">Verdict</h3>
                <Card className="p-4 border-l-4 border-l-primary">
                  <p className="text-gray-700 mb-2">{selectedClaim.verdict}</p>
                  {selectedClaim.explanation && (
                    <p className="text-sm text-gray-600">{selectedClaim.explanation}</p>
                  )}
                </Card>
              </div>
            )}

            {/* Supporting Sources */}
            {selectedClaim.references && selectedClaim.references.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Supporting Sources</h3>
                <Card className="p-4">
                  <ul className="space-y-2">
                    {selectedClaim.references.map((ref, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{ref}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}

            {/* Sources */}
            {selectedClaim.sources && selectedClaim.sources.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Sources</h3>
                <div className="space-y-2">
                  {selectedClaim.sources.map((source, index) => (
                    <Card key={index} className="p-3 bg-gray-50">
                      <p className="text-sm text-gray-700">{source}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedClaim.tags && selectedClaim.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedClaim.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Meta info */}
            <div>
              <h3 className="font-semibold mb-3">Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted:</span>
                  <span>{selectedClaim.submittedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <Badge variant="outline" className="text-xs">{selectedClaim.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority:</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      selectedClaim.priority === 'urgent' ? 'border-red-500 text-red-500' :
                      selectedClaim.priority === 'high' ? 'border-orange-500 text-orange-500' :
                      selectedClaim.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                      'border-gray-500 text-gray-500'
                    }`}
                  >
                    {selectedClaim.priority}
                  </Badge>
                </div>
                {selectedClaim.views && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Views:</span>
                    <span>{selectedClaim.views}</span>
                  </div>
                )}
                {selectedClaim.verifiedBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verified by:</span>
                    <span className="text-xs">{selectedClaim.verifiedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Trending View
  if (currentView === "trending") {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("home")}>
              ←
            </Button>
            <h2 className="font-semibold text-lg ml-2">Trending Content</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <TrendingSection 
            onTopicClick={(topic) => {
              setSelectedCategory(topic.category);
              setCurrentView("claims");
            }}
          />
        </div>
      </div>
    );
  }

  // Blog/Education View
  if (currentView === "blog") {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("home")}>
              ←
            </Button>
            <h2 className="font-semibold text-lg ml-2">Educational Content</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <BlogSection 
            onPostClick={(post) => {
              setSelectedBlogPost(post);
            }}
          />
        </div>
      </div>
    );
  }

  // Profile View  
  if (currentView === "profile") {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("home")}>
              ←
            </Button>
            <h2 className="font-semibold text-lg ml-2">Profile</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6">
          {currentUser ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {currentUser.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-lg">{currentUser.name}</h3>
                <p className="text-gray-500">{currentUser.email}</p>
                <Badge className="mt-2">{currentUser.role}</Badge>
              </div>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Your Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Claims Submitted:</span>
                    <span>{claims.filter(c => c.submittedBy === currentUser.id).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Notifications:</span>
                    <span>{storageUtils.getNotifications(currentUser.id).filter(n => !n.read).length} unread</span>
                  </div>
                </div>
              </Card>

              <Button 
                onClick={() => {
                  authStorage.logout();
                  window.location.reload();
                }}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>
            </div>
          ) : (
            <p className="text-center text-gray-500">Please log in to view your profile.</p>
          )}
        </div>
      </div>
    );
  }

  // Quiz View
  if (currentView === "quiz") {
    return <QuizSection onNavigate={(view) => setCurrentView(view as any)} />;
  }

  // Leaderboard View
  if (currentView === "leaderboard") {
    return <LeaderboardSection onNavigate={(view) => setCurrentView(view as any)} />;
  }

  // Bookmarks View
  if (currentView === "bookmarks") {
    return (
      <BookmarkSection 
        onNavigate={(view) => setCurrentView(view as any)}
        onClaimClick={(claim) => {
          setSelectedClaim(claim);
          setCurrentView("detail");
        }}
        onBlogClick={(post) => {
          setSelectedBlogPost(post);
          setCurrentView("blog");
        }}
      />
    );
  }

  // Blog Publisher View
  if (currentView === "publish") {
    return <BlogPublisher onNavigate={(view) => setCurrentView(view as any)} />;
  }

  return null;
};

export default TruthGuardApp;