import { useEffect, useState } from "react";
import { FileText, User, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@/types";
import { storageUtils } from "@/utils/storage";

interface BlogSectionProps {
  onPostClick?: (post: BlogPost) => void;
}

const BlogSection = ({ onPostClick }: BlogSectionProps) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setBlogPosts(storageUtils.getBlogPosts());
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Educational Content</h3>
      </div>

      {blogPosts.map((post) => (
        <Card 
          key={post.id} 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onPostClick?.(post)}
        >
          {post.featured && (
            <Badge className="mb-3 bg-gradient-primary text-white">Featured</Badge>
          )}
          
          <h4 className="font-semibold text-sm mb-2 line-clamp-2">{post.title}</h4>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BlogSection;