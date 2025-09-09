import { useEffect, useState } from "react";
import { FileText, User, Calendar, TrendingUp, CheckCircle, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPost, Claim } from "@/types";
import { storageUtils } from "@/utils/storage";

interface BlogSectionProps {
  onPostClick?: (post: BlogPost) => void;
}

const BlogSection = ({ onPostClick }: BlogSectionProps) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [approvedClaims, setApprovedClaims] = useState<Claim[]>([]);

  useEffect(() => {
    // Get published blog posts
    const posts = storageUtils.getBlogPosts().filter(post => post.status === "published");
    
    // Get approved claims with verdicts to display as content
    const claims = storageUtils.getClaims().filter(claim => 
      claim.approved && 
      claim.verdict && 
      (claim.publishedToFeed || claim.trending)
    );
    
    setBlogPosts(posts);
    setApprovedClaims(claims);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "true": return <CheckCircle className="w-4 h-4 text-truth-green" />;
      case "false": return <Scale className="w-4 h-4 text-false-red" />;
      case "misleading": return <Scale className="w-4 h-4 text-misleading-yellow" />;
      case "needs-context": return <FileText className="w-4 h-4 text-pending-orange" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      "true": "bg-truth-green text-white",
      "false": "bg-false-red text-white", 
      "misleading": "bg-misleading-yellow text-black",
      "needs-context": "bg-pending-orange text-white",
      "satire": "bg-secondary text-white"
    };
    return colors[status as keyof typeof colors] || "bg-muted";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Verified Content & Governance Insights</h3>
        <Badge variant="outline" className="text-xs">Kenya 2027</Badge>
      </div>

      {/* Featured/Trending Claims */}
      {approvedClaims.map((claim) => (
        <Card 
          key={`claim-${claim.id}`} 
          className="p-4 border-l-4 border-l-primary hover:shadow-elevated transition-all"
        >
          <div className="flex items-start gap-3">
            {getStatusIcon(claim.status)}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusBadge(claim.status)}>
                  {claim.status.replace("-", " ").toUpperCase()}
                </Badge>
                {claim.trending && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {claim.category}
                </Badge>
              </div>
              
              <h4 className="font-medium text-sm leading-tight">{claim.content}</h4>
              
              {claim.explanation && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <strong>Fact-Check:</strong> {claim.explanation}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <span>Verified by {claim.verifiedBy || "HAKIKISHA Team"}</span>
                <span>{new Date(claim.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Blog Articles */}
      {blogPosts.map((post) => (
        <Card 
          key={`post-${post.id}`} 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onPostClick?.(post)}
        >
          {post.featured && (
            <Badge className="mb-3 bg-gradient-primary text-white">Featured Article</Badge>
          )}
          
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2 line-clamp-2">{post.title}</h4>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-1 mt-2 flex-wrap">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {blogPosts.length === 0 && approvedClaims.length === 0 && (
        <Card className="p-6 text-center">
          <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-medium mb-2">No Content Available</h4>
          <p className="text-sm text-muted-foreground">
            Verified claims and governance articles will appear here
          </p>
        </Card>
      )}
    </div>
  );
};

export default BlogSection;