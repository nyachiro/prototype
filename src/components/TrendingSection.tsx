import { useEffect, useState } from "react";
import { TrendingUp, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingTopic, Claim } from "@/types";
import { storageUtils } from "@/utils/storage";

interface TrendingSectionProps {
  onTopicClick?: (topic: TrendingTopic) => void;
}

const TrendingSection = ({ onTopicClick }: TrendingSectionProps) => {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingClaims, setTrendingClaims] = useState<Claim[]>([]);

  useEffect(() => {
    setTrendingTopics(storageUtils.getTrendingTopics());
    const claims = storageUtils.getClaims();
    setTrendingClaims(claims.filter(c => c.trending).slice(0, 3));
  }, []);

  return (
    <div className="space-y-4">
      {/* Trending Topics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Trending Topics</h3>
        </div>
        <div className="space-y-2">
          {trendingTopics.slice(0, 3).map((topic) => (
            <Card 
              key={topic.id} 
              className="p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onTopicClick?.(topic)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{topic.title}</p>
                  <p className="text-xs text-gray-500">
                    {topic.claimCount} claims • {topic.category}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Trending
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Claims */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Most Viewed</h3>
        </div>
        <div className="space-y-2">
          {trendingClaims.map((claim) => (
            <Card key={claim.id} className="p-3">
              <p className="text-sm text-gray-700 line-clamp-2 mb-2">{claim.content}</p>
              <div className="flex items-center justify-between">
                <Badge 
                  className={
                    claim.status === "true" ? "bg-truth-green" :
                    claim.status === "false" ? "bg-false-red" :
                    claim.status === "misleading" ? "bg-misleading-yellow text-black" :
                    claim.status === "satire" ? "bg-purple-500" :
                    claim.status === "needs-context" ? "bg-blue-500" :
                    "bg-pending-orange"
                  }
                >
                  {claim.status === "true" ? "True" :
                   claim.status === "false" ? "False" :
                   claim.status === "misleading" ? "Misleading" :
                   claim.status === "satire" ? "Satire" :
                   claim.status === "needs-context" ? "Needs Context" :
                   "Pending"}
                </Badge>
                <span className="text-xs text-gray-500">{claim.views} views</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;