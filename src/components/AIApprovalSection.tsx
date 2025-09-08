import { useState, useEffect } from "react";
import { Bot, CheckCircle, XCircle, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Claim } from "@/types";
import { storageUtils } from "@/utils/storage";
import { authStorage } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";

const AIApprovalSection = () => {
  const [aiPendingClaims, setAiPendingClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const currentUser = authStorage.getUser();

  useEffect(() => {
    const refreshPendingClaims = () => {
      setAiPendingClaims(storageUtils.getAIPendingClaims());
    };
    
    refreshPendingClaims();
    
    // Refresh every 5 seconds to catch new AI analyses
    const interval = setInterval(refreshPendingClaims, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (claimId: string) => {
    if (!currentUser) return;
    
    storageUtils.approveAIAnalysis(claimId, currentUser.id);
    setAiPendingClaims(storageUtils.getAIPendingClaims());
    setIsViewDialogOpen(false);
    
    toast({
      title: "AI Analysis Approved",
      description: "The claim has been approved and published to the feed"
    });
  };

  const handleReject = (claimId: string) => {
    // In a real app, you'd have a reject flow
    // For now, we'll just remove from AI pending
    const updated = storageUtils.updateClaim(claimId, {
      aiPendingApproval: false,
      status: 'pending'
    });
    
    if (updated) {
      setAiPendingClaims(storageUtils.getAIPendingClaims());
      setIsViewDialogOpen(false);
      
      toast({
        title: "AI Analysis Rejected",
        description: "The claim has been sent back for manual review"
      });
    }
  };

  const openViewDialog = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bot className="w-8 h-8 text-blue-500" />
        <div>
          <h3 className="font-semibold text-lg">AI Analysis Approval</h3>
          <p className="text-sm text-gray-500">
            Review and approve claims analyzed by AI before publishing
          </p>
        </div>
      </div>

      {/* Pending Claims */}
      <div className="space-y-3">
        {aiPendingClaims.length === 0 ? (
          <Card className="p-6 text-center">
            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-medium text-gray-600 mb-2">No AI analyses pending approval</h4>
            <p className="text-sm text-gray-500">
              Claims analyzed by AI will appear here for your review
            </p>
          </Card>
        ) : (
          aiPendingClaims.map((claim) => (
            <Card key={claim.id} className="p-4 border-l-4 border-l-blue-500">
              <div className="flex items-start gap-3">
                <Bot className="w-6 h-6 text-blue-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">AI Analyzed</Badge>
                    <Badge variant="outline" className="text-xs">{claim.category}</Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {claim.content}
                  </p>
                  
                  {claim.verdict && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-medium text-blue-800 mb-1">AI Verdict:</p>
                      <p className="text-sm text-blue-700">{claim.verdict}</p>
                    </div>
                  )}
                  
                  {claim.explanation && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-medium text-gray-800 mb-1">AI Explanation:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{claim.explanation}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Submitted: {claim.submittedAt}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openViewDialog(claim)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(claim.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(claim.id)}
                        className="bg-truth-green hover:bg-truth-green/90"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" />
              AI Analysis Review
            </DialogTitle>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Original Claim</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm">{selectedClaim.content}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Badge variant="outline">{selectedClaim.category}</Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Submitted</label>
                  <span className="text-sm text-gray-600">{selectedClaim.submittedAt}</span>
                </div>
              </div>

              {selectedClaim.verdict && (
                <div>
                  <label className="block text-sm font-medium mb-2">AI Verdict</label>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">{selectedClaim.verdict}</p>
                  </div>
                </div>
              )}

              {selectedClaim.explanation && (
                <div>
                  <label className="block text-sm font-medium mb-2">AI Explanation</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedClaim.explanation}</p>
                  </div>
                </div>
              )}

              {selectedClaim.sourceUrl && (
                <div>
                  <label className="block text-sm font-medium mb-2">Source URL</label>
                  <a 
                    href={selectedClaim.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {selectedClaim.sourceUrl}
                  </a>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedClaim.id)}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject AI Analysis
                </Button>
                <Button
                  onClick={() => handleApprove(selectedClaim.id)}
                  className="flex-1 bg-truth-green hover:bg-truth-green/90"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Publish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIApprovalSection;