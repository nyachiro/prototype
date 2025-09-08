import { useState, useEffect } from "react";
import { Bookmark, CheckCircle, XCircle, AlertTriangle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Claim, BlogPost } from "@/types";
import { storageUtils } from "@/utils/storage";
import { authStorage } from "@/utils/auth";

interface BookmarkSectionProps {
  onNavigate: (view: string) => void;
  onClaimClick?: (claim: Claim) => void;
  onBlogClick?: (post: BlogPost) => void;
}

const BookmarkSection = ({ onNavigate, onClaimClick, onBlogClick }: BookmarkSectionProps) => {
  const [bookmarkedClaims, setBookmarkedClaims] = useState<Claim[]>([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState<BlogPost[]>([]);
  
  const currentUser = authStorage.getUser();

  useEffect(() => {
    if (!currentUser) return;
    
    // Get bookmarked claims
    const allClaims = storageUtils.getClaims();
    const userBookmarkedClaims = allClaims.filter(claim => 
      claim.bookmarkedBy?.includes(currentUser.id)
    );
    setBookmarkedClaims(userBookmarkedClaims);

    // For now, we'll use a simple approach for bookmarked blogs
    // In a real app, you'd have a similar bookmarking system for blogs
    setBookmarkedBlogs([]);
  }, [currentUser]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "true": return <CheckCircle className="w-5 h-5 text-truth-green" />;
      case "false": return <XCircle className="w-5 h-5 text-false-red" />;
      case "misleading": return <AlertTriangle className="w-5 h-5 text-misleading-yellow" />;
      default: return <Clock className="w-5 h-5 text-pending-orange" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "true": return <Badge className="bg-truth-green hover:bg-truth-green/90">True</Badge>;
      case "false": return <Badge className="bg-false-red hover:bg-false-red/90">False</Badge>;
      case "misleading": return <Badge className="bg-misleading-yellow hover:bg-misleading-yellow/90 text-black">Misleading</Badge>;
      default: return <Badge className="bg-pending-orange hover:bg-pending-orange/90">Under Review</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => onNavigate("home")}>
            ←
          </Button>
          <h2 className="font-semibold text-lg ml-2 flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Bookmarks
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="claims" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-6 mb-4">
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="blogs">Articles</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TabsContent value="claims" className="mt-0">
              {bookmarkedClaims.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No bookmarked claims</p>
                  <p className="text-sm text-gray-400">Save interesting claims to view them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarkedClaims.map((claim) => (
                    <Card 
                      key={claim.id} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onClaimClick?.(claim)}
                    >
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
                            {claim.views && <span className="text-xs text-gray-500">{claim.views} views</span>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="blogs" className="mt-0">
              {bookmarkedBlogs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No bookmarked articles</p>
                  <p className="text-sm text-gray-400">Save interesting articles to view them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarkedBlogs.map((post) => (
                    <Card 
                      key={post.id} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onBlogClick?.(post)}
                    >
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">{post.title}</h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{post.author}</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default BookmarkSection;