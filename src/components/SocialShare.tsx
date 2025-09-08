import { useState } from "react";
import { Share2, Copy, BookmarkPlus, BookmarkCheck, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { storageUtils } from "@/utils/storage";
import { authStorage } from "@/utils/auth";
import { Claim, BlogPost } from "@/types";

interface SocialShareProps {
  content: Claim | BlogPost;
  type: "claim" | "blog";
  onLike?: () => void;
  onShare?: () => void;
  onComment?: () => void;
}

const SocialShare = ({ content, type, onLike, onShare, onComment }: SocialShareProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const currentUser = authStorage.getUser();

  const shareUrl = `${window.location.origin}/${type}/${content.id}`;
  const shareText = type === "claim" 
    ? `Fact-check: ${(content as Claim).content.slice(0, 100)}...`
    : `Read: ${(content as BlogPost).title}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard"
    });
    setIsShareOpen(false);
  };

  const handleBookmark = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to bookmark content"
      });
      return;
    }

    if (type === "claim") {
      const claim = content as Claim;
      const bookmarkedBy = claim.bookmarkedBy || [];
      const isCurrentlyBookmarked = bookmarkedBy.includes(currentUser.id);
      
      if (isCurrentlyBookmarked) {
        const updated = bookmarkedBy.filter(id => id !== currentUser.id);
        storageUtils.updateClaim(claim.id, { bookmarkedBy: updated });
      } else {
        storageUtils.updateClaim(claim.id, { bookmarkedBy: [...bookmarkedBy, currentUser.id] });
      }
      setIsBookmarked(!isCurrentlyBookmarked);
    }

    toast({
      title: isBookmarked ? "Bookmark Removed" : "Bookmarked",
      description: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
    });
  };

  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      onShare?.();
    }
    setIsShareOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className="flex items-center gap-1"
        >
          <Heart className={`w-4 h-4 ${content.likes ? 'text-red-500 fill-red-500' : ''}`} />
          <span className="text-xs">{content.likes || 0}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsShareOpen(true)}
          className="flex items-center gap-1"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-xs">{content.shares || 0}</span>
        </Button>

        {type === "blog" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="flex items-center gap-1"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{(content as BlogPost).comments?.length || 0}</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className="flex items-center gap-1"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-primary" />
          ) : (
            <BookmarkPlus className="w-4 h-4" />
          )}
        </Button>
      </div>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Content</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Share Link</label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly />
                <Button onClick={handleCopyLink} size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Share on Social Media</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare("twitter")}
                  className="bg-blue-50 hover:bg-blue-100"
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare("facebook")}
                  className="bg-blue-50 hover:bg-blue-100"
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare("whatsapp")}
                  className="bg-green-50 hover:bg-green-100"
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialShare("telegram")}
                  className="bg-blue-50 hover:bg-blue-100"
                >
                  Telegram
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialShare;