import { useState } from "react";
import { Plus, Save, Eye, Send, Scale, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlogPost, ClaimCategory } from "@/types";
import { storageUtils } from "@/utils/storage";
import { authStorage } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";

interface AdminArticlePublisherProps {
  onNavigate: (view: string) => void;
}

const AdminArticlePublisher = ({ onNavigate }: AdminArticlePublisherProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "governance" as ClaimCategory,
    tags: "",
    imageUrl: "",
    featured: false,
    urgent: false,
    politicalContext: "",
    sourceReferences: ""
  });
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  
  const { toast } = useToast();
  const currentUser = authStorage.getUser();

  // Kenyan politics focused suggestions
  const kenyanTopics = [
    "2027 Presidential Elections",
    "County Governance", 
    "BBI Constitutional Review",
    "Judiciary Independence",
    "Anti-Corruption Measures",
    "Parliamentary Procedures",
    "Electoral Reforms",
    "Devolution Implementation",
    "Political Party Funding",
    "Youth Political Participation"
  ];

  const handlePublishArticle = () => {
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
      status: "published", // Admin articles go live immediately
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
      featured: false,
      urgent: false,
      politicalContext: "",
      sourceReferences: ""
    });

    toast({
      title: "Article Published",
      description: "Your governance article has been published to all users successfully"
    });

    setIsCreateOpen(false);
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
      status: "published",
      likes: 0,
      shares: 0,
      comments: [],
      viewCount: 0
    };

    setPreviewPost(previewData);
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("admin")}>
              ←
            </Button>
            <div className="ml-2">
              <h2 className="font-semibold text-lg">Kenya Governance Publisher</h2>
              <p className="text-sm text-muted-foreground">Create articles for 2027 election period</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Scale className="w-8 h-8 text-truth-green mx-auto mb-2" />
            <h4 className="font-medium">Governance Focus</h4>
            <p className="text-sm text-muted-foreground">Transparency & accountability</p>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-pending-orange mx-auto mb-2" />
            <h4 className="font-medium">2027 Elections</h4>
            <p className="text-sm text-muted-foreground">Preparation & education</p>
          </Card>
          <Card className="p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-medium">Citizen Engagement</h4>
            <p className="text-sm text-muted-foreground">Inform & empower voters</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Suggested Topics for Kenya 2027</h3>
          <div className="grid grid-cols-2 gap-2">
            {kenyanTopics.map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto p-2"
                onClick={() => setForm({ ...form, title: topic })}
              >
                {topic}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Create Governance Article
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Article Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Understanding Kenya's Electoral Process for 2027"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="elections">2027 Elections</SelectItem>
                    <SelectItem value="governance">Kenyan Governance</SelectItem>
                    <SelectItem value="politics">Political Analysis</SelectItem>
                    <SelectItem value="justice">Justice & Courts</SelectItem>
                    <SelectItem value="parliament">Parliament & Laws</SelectItem>
                    <SelectItem value="security">National Security</SelectItem>
                    <SelectItem value="economy">Economic Policy</SelectItem>
                    <SelectItem value="corruption">Anti-Corruption</SelectItem>
                    <SelectItem value="constitution">Constitutional Matters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Featured Article
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="urgent"
                    checked={form.urgent}
                    onCheckedChange={(checked) => setForm({ ...form, urgent: checked })}
                  />
                  <label htmlFor="urgent" className="text-sm font-medium">
                    Urgent/Breaking
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Article Summary</label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Brief summary highlighting key points for citizens..."
                className="min-h-16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Article Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your comprehensive analysis of Kenyan governance, politics, or electoral matters here..."
                className="min-h-48"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Political Context (Optional)</label>
              <Textarea
                value={form.politicalContext}
                onChange={(e) => setForm({ ...form, politicalContext: e.target.value })}
                placeholder="Additional context about the political implications or background..."
                className="min-h-16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="kenya-2027, governance, elections, transparency, fact-check"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Source References</label>
              <Textarea
                value={form.sourceReferences}
                onChange={(e) => setForm({ ...form, sourceReferences: e.target.value })}
                placeholder="List credible sources, official documents, or references used..."
                className="min-h-16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Featured Image URL (Optional)</label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/kenya-governance-image.jpg"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={handlePreview}
                disabled={!form.title.trim() || !form.content.trim()}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button 
                onClick={handlePublishArticle}
                disabled={!form.title.trim() || !form.content.trim()}
                className="bg-gradient-primary flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish to All Users
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Article Preview</DialogTitle>
          </DialogHeader>
          
          {previewPost && (
            <div className="space-y-4">
              {previewPost.featured && (
                <Badge className="bg-gradient-primary text-white">Featured Article</Badge>
              )}
              
              <h1 className="text-xl font-bold">{previewPost.title}</h1>
              
              <div className="text-sm text-muted-foreground">
                By {previewPost.author} • {new Date(previewPost.publishedAt).toLocaleDateString()}
                <Badge variant="outline" className="ml-2">Kenya Governance</Badge>
              </div>
              
              {previewPost.imageUrl && (
                <img 
                  src={previewPost.imageUrl} 
                  alt={previewPost.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="prose prose-sm max-w-none">
                <div className="text-foreground whitespace-pre-wrap">
                  {previewPost.content}
                </div>
                
                {form.politicalContext && (
                  <div className="mt-4 p-3 bg-muted/50 rounded">
                    <h4 className="font-medium mb-2">Political Context:</h4>
                    <p className="text-sm">{form.politicalContext}</p>
                  </div>
                )}
                
                {form.sourceReferences && (
                  <div className="mt-4 p-3 bg-muted/50 rounded">
                    <h4 className="font-medium mb-2">Sources & References:</h4>
                    <p className="text-sm whitespace-pre-wrap">{form.sourceReferences}</p>
                  </div>
                )}
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

export default AdminArticlePublisher;