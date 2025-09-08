import { useState } from "react";
import { Plus, Save, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlogPost, ClaimCategory } from "@/types";
import { storageUtils } from "@/utils/storage";
import { authStorage } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";

interface BlogPublisherProps {
  onNavigate: (view: string) => void;
}

const BlogPublisher = ({ onNavigate }: BlogPublisherProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "governance" as ClaimCategory,
    tags: "",
    imageUrl: "",
    featured: false
  });
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  
  const { toast } = useToast();
  const currentUser = authStorage.getUser();

  const handleSaveDraft = () => {
    if (!currentUser || !form.title.trim() || !form.content.trim()) return;

    const blogPost: BlogPost = {
      id: Date.now().toString(),
      title: form.title,
      content: form.content,
      excerpt: form.excerpt || form.content.slice(0, 150) + "...",
      author: currentUser.name,
      authorId: currentUser.id,
      publishedAt: new Date().toISOString(),
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl: form.imageUrl || undefined,
      featured: form.featured,
      status: "draft",
      likes: 0,
      shares: 0,
      comments: [],
      viewCount: 0
    };

    // In a real app, this would save to drafts
    toast({
      title: "Draft Saved",
      description: "Your blog post has been saved as a draft"
    });
  };

  const handlePreview = () => {
    if (!currentUser || !form.title.trim() || !form.content.trim()) return;

    const previewData: BlogPost = {
      id: "preview",
      title: form.title,
      content: form.content,
      excerpt: form.excerpt || form.content.slice(0, 150) + "...",
      author: currentUser.name,
      authorId: currentUser.id,
      publishedAt: new Date().toISOString(),
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl: form.imageUrl || undefined,
      featured: form.featured,
      status: "draft",
      likes: 0,
      shares: 0,
      comments: [],
      viewCount: 0
    };

    setPreviewPost(previewData);
    setIsPreviewOpen(true);
  };

  const handlePublish = () => {
    if (!currentUser || !form.title.trim() || !form.content.trim()) return;

    const blogPost: BlogPost = {
      id: Date.now().toString(),
      title: form.title,
      content: form.content,
      excerpt: form.excerpt || form.content.slice(0, 150) + "...",
      author: currentUser.name,
      authorId: currentUser.id,
      publishedAt: new Date().toISOString(),
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl: form.imageUrl || undefined,
      featured: form.featured,
      status: currentUser.role === "admin" ? "published" : "pending_approval",
      likes: 0,
      shares: 0,
      comments: [],
      viewCount: 0
    };

    // Save to storage
    const currentPosts = storageUtils.getBlogPosts();
    currentPosts.unshift(blogPost);
    storageUtils.setBlogPosts(currentPosts);

    // Clear form
    setForm({
      title: "",
      content: "",
      excerpt: "",
      category: "governance",
      tags: "",
      imageUrl: "",
      featured: false
    });

    toast({
      title: currentUser.role === "admin" ? "Post Published" : "Post Submitted",
      description: currentUser.role === "admin" 
        ? "Your blog post has been published successfully"
        : "Your blog post has been submitted for admin approval"
    });

    setIsCreateOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("home")}>
              ←
            </Button>
            <h2 className="font-semibold text-lg ml-2">Content Publishing</h2>
          </div>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Create Educational Content</h3>
          <p className="text-gray-500 mb-4">
            Share insights, fact-checks, and educational articles with the community
          </p>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-primary"
          >
            Start Writing
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Blog Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter blog post title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select 
                value={form.category} 
                onValueChange={(value) => setForm({ ...form, category: value as ClaimCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <label className="block text-sm font-medium mb-2">Excerpt (Optional)</label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Brief description of the article..."
                className="min-h-16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your article content here..."
                className="min-h-48"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="fact-check, elections, governance (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Featured Image URL (Optional)</label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={!form.title.trim() || !form.content.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handlePreview}
                disabled={!form.title.trim() || !form.content.trim()}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button 
                onClick={handlePublish}
                disabled={!form.title.trim() || !form.content.trim()}
                className="bg-gradient-primary flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {currentUser?.role === "admin" ? "Publish" : "Submit for Approval"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          
          {previewPost && (
            <div className="space-y-4">
              {previewPost.featured && (
                <Badge className="bg-gradient-primary text-white">Featured</Badge>
              )}
              
              <h1 className="text-xl font-bold">{previewPost.title}</h1>
              
              <div className="text-sm text-gray-500">
                By {previewPost.author} • {new Date(previewPost.publishedAt).toLocaleDateString()}
              </div>
              
              {previewPost.imageUrl && (
                <img 
                  src={previewPost.imageUrl} 
                  alt={previewPost.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="text-gray-700 whitespace-pre-wrap">
                {previewPost.content}
              </div>
              
              <div className="flex gap-1 flex-wrap">
                {previewPost.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogPublisher;