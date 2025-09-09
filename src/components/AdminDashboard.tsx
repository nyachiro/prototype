import { useState, useEffect } from "react";
import { Users, FileText, CheckCircle, XCircle, AlertTriangle, Clock, LogOut, Trash2, Edit3, Plus, Search, Star, Bot, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authStorage, User } from "@/utils/auth";
import { storageUtils } from "@/utils/storage";
import { Claim } from "@/types";
import { useToast } from "@/hooks/use-toast";
import AIApprovalSection from "./AIApprovalSection";
import AdminArticlePublisher from "./AdminArticlePublisher";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editForm, setEditForm] = useState({
    status: '',
    verdict: '',
    explanation: '',
    references: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    setClaims(storageUtils.getClaims());
  }, []);

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
      case "true": return <Badge className="bg-truth-green hover:bg-truth-green/90">Verified True</Badge>;
      case "false": return <Badge className="bg-false-red hover:bg-false-red/90">False</Badge>;
      case "misleading": return <Badge className="bg-misleading-yellow hover:bg-misleading-yellow/90 text-black">Misleading</Badge>;
      default: return <Badge className="bg-pending-orange hover:bg-pending-orange/90">Under Review</Badge>;
    }
  };

  const handleUpdateClaim = () => {
    if (selectedClaim) {
      const references = editForm.references.split('\n').filter(r => r.trim());
      const updated = storageUtils.updateClaim(selectedClaim.id, {
        status: editForm.status as Claim['status'],
        verdict: editForm.verdict,
        explanation: editForm.explanation,
        references: references.length > 0 ? references : undefined,
        verifiedBy: user.email,
        approved: editForm.status !== 'pending'
      });
      
      if (updated) {
        setClaims(storageUtils.getClaims());
        setIsEditDialogOpen(false);
        setSelectedClaim(null);
        
        toast({
          title: "Claim Updated",
          description: "The claim has been successfully fact-checked and updated."
        });
      }
    }
  };

  const handleDeleteClaim = (id: string) => {
    if (confirm('Are you sure you want to delete this claim?')) {
      storageUtils.deleteClaim(id);
      setClaims(storageUtils.getClaims());
    }
  };

  const openEditDialog = (claim: Claim) => {
    setSelectedClaim(claim);
    setEditForm({
      status: claim.status,
      verdict: claim.verdict || '',
      explanation: claim.explanation || '',
      references: claim.references?.join('\n') || ''
    });
    setIsEditDialogOpen(true);
  };

  const pendingCount = claims.filter(c => c.status === 'pending').length;
  const verifiedCount = claims.filter(c => c.status !== 'pending').length;
  const filteredClaims = searchQuery 
    ? claims.filter(c => c.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : claims;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-engaging px-6 py-4 shadow-elevated">
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-xl font-bold">Fact-Checker Dashboard</h1>
            <p className="text-white/90 text-sm">Welcome, {user.name}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claims">Claims Management</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="publish">Publish Articles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="flex-1 p-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-pending-orange" />
                  <div>
                    <p className="text-sm text-gray-500">Pending Review</p>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-truth-green" />
                  <div>
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-2xl font-bold">{verifiedCount}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total Claims</p>
                    <p className="text-2xl font-bold">{claims.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold mb-4">Recent Claims</h3>
              <div className="space-y-3">
                {claims.slice(0, 5).map((claim) => (
                  <Card key={claim.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(claim.status)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{claim.content}</p>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(claim.status)}
                          <span className="text-xs text-gray-500">{claim.submittedAt}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(claim)}
                      >
                        Review
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="claims" className="flex-1 p-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search claims..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Claims List */}
            <div className="space-y-3 max-h-96 overflow-hidden hover:overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {filteredClaims.map((claim) => (
                <Card key={claim.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(claim.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{claim.content}</p>
                       <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(claim.status)}
                          {claim.duplicateCount && claim.duplicateCount > 1 && (
                            <Badge variant="outline" className="text-xs">
                              {claim.duplicateCount} submissions
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{claim.submittedAt}</span>
                      </div>
                      {claim.verdict && (
                        <p className="text-xs text-gray-600 line-clamp-1">{claim.verdict}</p>
                      )}
                      {claim.explanation && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{claim.explanation}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(claim)}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClaim(claim.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content" className="flex-1 p-6">
            <AIApprovalSection />
          </TabsContent>

          <TabsContent value="publish" className="flex-1 p-6">
            <AdminArticlePublisher onNavigate={(view) => {}} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Claim Status</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Claim</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{selectedClaim?.content}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Under Review</SelectItem>
                  <SelectItem value="true">Verified True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                  <SelectItem value="misleading">Misleading</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Verdict Summary</label>
              <Textarea
                value={editForm.verdict}
                onChange={(e) => setEditForm({ ...editForm, verdict: e.target.value })}
                placeholder="Brief verdict summary..."
                className="min-h-16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Detailed Explanation</label>
              <Textarea
                value={editForm.explanation}
                onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                placeholder="Detailed explanation of the fact-check with context..."
                className="min-h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Supporting Sources/References</label>
              <Textarea
                value={editForm.references}
                onChange={(e) => setEditForm({ ...editForm, references: e.target.value })}
                placeholder="List supporting sources (one per line)..."
                className="min-h-20"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateClaim} className="flex-1">
                Update Claim
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;