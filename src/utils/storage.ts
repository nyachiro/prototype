import { Claim, Notification, BlogPost, TrendingTopic, ClaimCategory, UserProfile, Quiz } from "@/types";
import { findSimilarClaims, updateClaimWithDuplicates } from './claimSimilarity';

export const storageUtils = {
  getClaims: (): Claim[] => {
    const claims = localStorage.getItem('truthguard_claims');
    return claims ? JSON.parse(claims) : [];
  },
  
  setClaims: (claims: Claim[]) => {
    localStorage.setItem('truthguard_claims', JSON.stringify(claims));
  },
  
  addClaim: (claim: Omit<Claim, 'id' | 'submittedAt' | 'status' | 'priority' | 'views' | 'likes' | 'shares' | 'approved' | 'bookmarkedBy' | 'aiAnalyzed' | 'aiPendingApproval' | 'publishedToFeed' | 'duplicateOf' | 'duplicateCount'>) => {
    const claims = storageUtils.getClaims();
    
    // Check for similar claims
    const similarClaims = findSimilarClaims(claim.content, claims);
    
    if (similarClaims.length > 0) {
      // If similar claims exist, increment count on the original
      const originalClaim = similarClaims[0];
      const updatedClaims = claims.map(c => 
        c.id === originalClaim.id 
          ? { ...c, duplicateCount: (c.duplicateCount || 1) + 1 }
          : c
      );
      storageUtils.setClaims(updatedClaims);
      
      // Still add notification for user
      storageUtils.addNotification({
        userId: claim.submittedBy,
        claimId: originalClaim.id,
        type: 'claim_approved',
        title: 'Similar Claim Found',
        message: 'Your claim was similar to an existing one. You\'ll be notified when it\'s reviewed.',
        read: false
      });
      return originalClaim;
    }
    
    const newClaim: Claim = {
      ...claim,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      priority: 'medium',
      views: 0,
      likes: 0,
      shares: 0,
      approved: false,
      bookmarkedBy: [],
      aiAnalyzed: false,
      aiPendingApproval: false,
      publishedToFeed: false,
      duplicateCount: 1
    };
    
    claims.unshift(newClaim);
    storageUtils.setClaims(claims);
    
    // Send notification to user when claim is submitted
    storageUtils.addNotification({
      userId: claim.submittedBy,
      claimId: newClaim.id,
      type: 'claim_approved',
      title: 'Claim Submitted',
      message: 'Your claim has been submitted for review',
      read: false
    });
    
    return newClaim;
  },
  
  updateClaim: (id: string, updates: Partial<Claim>) => {
    const claims = storageUtils.getClaims();
    const updatedClaims = updateClaimWithDuplicates(id, claims, updates);
    storageUtils.setClaims(updatedClaims);
    
    const primaryClaim = claims.find(c => c.id === id);
    
    // Send notification when verdict is published  
    if (updates.verdict && updates.status !== 'pending' && primaryClaim?.status === 'pending') {
      const similarClaims = findSimilarClaims(primaryClaim?.content || '', claims);
      
      // Notify all users who submitted similar claims
      [primaryClaim, ...similarClaims].forEach(claim => {
        if (claim) {
          storageUtils.addNotification({
            userId: claim.submittedBy,
            claimId: claim.id,
            type: 'verdict_published',
            title: 'Verdict Published',
            message: `A claim similar to yours has been fact-checked: ${updates.status}`,
            read: false
          });
        }
      });
    }
    
    return updatedClaims.find(c => c.id === id) || null;
  },
  
  deleteClaim: (id: string) => {
    const claims = storageUtils.getClaims();
    const filtered = claims.filter(c => c.id !== id);
    storageUtils.setClaims(filtered);
  },

  // Notifications
  getNotifications: (userId: string): Notification[] => {
    const notifications = localStorage.getItem('truthguard_notifications');
    const allNotifications = notifications ? JSON.parse(notifications) : [];
    return allNotifications.filter((n: Notification) => n.userId === userId);
  },

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const notifications = localStorage.getItem('truthguard_notifications');
    const allNotifications = notifications ? JSON.parse(notifications) : [];
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    allNotifications.unshift(newNotification);
    localStorage.setItem('truthguard_notifications', JSON.stringify(allNotifications));
  },

  markNotificationRead: (id: string) => {
    const notifications = localStorage.getItem('truthguard_notifications');
    const allNotifications = notifications ? JSON.parse(notifications) : [];
    const updated = allNotifications.map((n: Notification) => 
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('truthguard_notifications', JSON.stringify(updated));
  },

  // Blog Posts
  getBlogPosts: (): BlogPost[] => {
    const posts = localStorage.getItem('truthguard_blog_posts');
    return posts ? JSON.parse(posts) : [];
  },

  setBlogPosts: (posts: BlogPost[]) => {
    localStorage.setItem('truthguard_blog_posts', JSON.stringify(posts));
  },

  // Trending Topics
  getTrendingTopics: (): TrendingTopic[] => {
    const topics = localStorage.getItem('truthguard_trending');
    return topics ? JSON.parse(topics) : [];
  },

  setTrendingTopics: (topics: TrendingTopic[]) => {
    localStorage.setItem('truthguard_trending', JSON.stringify(topics));
  },

  // Category filtering
  getClaimsByCategory: (category: ClaimCategory): Claim[] => {
    const claims = storageUtils.getClaims();
    return claims.filter(c => c.category === category);
  },

  // Search functionality
  searchClaims: (query: string): Claim[] => {
    const claims = storageUtils.getClaims();
    const lowercaseQuery = query.toLowerCase();
    return claims.filter(c => 
      c.content.toLowerCase().includes(lowercaseQuery) ||
      c.verdict?.toLowerCase().includes(lowercaseQuery) ||
      c.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  },

  // User Profile Management
  getUserProfile: (userId: string): UserProfile | null => {
    const profiles = localStorage.getItem('truthguard_user_profiles');
    const allProfiles = profiles ? JSON.parse(profiles) : [];
    return allProfiles.find((p: UserProfile) => p.id === userId) || null;
  },

  getAllUserProfiles: (): UserProfile[] => {
    const profiles = localStorage.getItem('truthguard_user_profiles');
    return profiles ? JSON.parse(profiles) : [];
  },

  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => {
    const profiles = localStorage.getItem('truthguard_user_profiles');
    const allProfiles = profiles ? JSON.parse(profiles) : [];
    const index = allProfiles.findIndex((p: UserProfile) => p.id === userId);
    
    if (index !== -1) {
      allProfiles[index] = { ...allProfiles[index], ...updates };
    } else {
      // Create new profile if it doesn't exist
      const newProfile: UserProfile = {
        id: userId,
        name: 'User',
        email: '',
        role: 'user',
        points: 0,
        badges: ['Rookie'],
        claimsSubmitted: 0,
        claimsVerified: 0,
        joinedAt: new Date().toISOString(),
        ...updates
      };
      allProfiles.push(newProfile);
    }
    
    localStorage.setItem('truthguard_user_profiles', JSON.stringify(allProfiles));
  },

  // Quiz Management
  getQuizzes: (): Quiz[] => {
    const quizzes = localStorage.getItem('truthguard_quizzes');
    return quizzes ? JSON.parse(quizzes) : [];
  },

  markQuizCompleted: (quizId: string, userId: string) => {
    const quizzes = storageUtils.getQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz && !quiz.completedBy.includes(userId)) {
      quiz.completedBy.push(userId);
      localStorage.setItem('truthguard_quizzes', JSON.stringify(quizzes));
    }
  },

  // AI Analysis & Approval
  getAIPendingClaims: (): Claim[] => {
    const claims = storageUtils.getClaims();
    return claims.filter(c => c.aiPendingApproval && !c.approved);
  },

  approveAIAnalysis: (claimId: string, adminId: string) => {
    const claims = storageUtils.getClaims();
    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      claim.approved = true;
      claim.publishedToFeed = true;
      claim.aiPendingApproval = false;
      claim.verifiedBy = adminId;
      storageUtils.setClaims(claims);
      
      // Notify admins that this claim is no longer pending
      storageUtils.addNotification({
        userId: claim.submittedBy,
        claimId: claimId,
        type: 'verdict_published',
        title: 'AI Analysis Approved',
        message: 'Your claim has been verified and published',
        read: false
      });
    }
  },

  simulateAIAnalysis: (claimId: string) => {
    // Simulate AI analysis with a delay
    setTimeout(() => {
      const claims = storageUtils.getClaims();
      const claim = claims.find(c => c.id === claimId);
      if (claim && !claim.aiAnalyzed) {
        // Mock AI analysis results
        const aiResults = {
          aiAnalyzed: true,
          aiPendingApproval: true,
          verdict: "AI Analysis: This claim requires fact-checking review",
          explanation: "AI has analyzed this claim and flagged it for expert review based on content patterns and source credibility.",
          status: 'pending' as const
        };
        
        storageUtils.updateClaim(claimId, aiResults);
        
        // Notify all admins
        const adminProfiles = storageUtils.getAllUserProfiles().filter(p => p.role === 'admin');
        adminProfiles.forEach(admin => {
          storageUtils.addNotification({
            userId: admin.id,
            claimId: claimId,
            type: 'claim_approved',
            title: 'AI Analysis Complete',
            message: 'A claim requires admin approval after AI analysis',
            read: false
          });
        });
      }
    }, 3000); // 3 second delay to simulate AI processing
  },

  // Multi-language support placeholders
  getLanguage: (): string => {
    return localStorage.getItem('truthguard_language') || 'en';
  },

  setLanguage: (lang: string) => {
    localStorage.setItem('truthguard_language', lang);
  }
};

// Initialize with mock data if empty
const initializeClaims = () => {
  const claims = storageUtils.getClaims();
  if (claims.length === 0) {
    const mockClaims: Claim[] = [
      {
        id: "1",
        content: "The government has allocated 50 billion shillings for infrastructure development in 2024",
        status: "true",
        submittedAt: "2024-01-15",
        verdict: "Verified: This allocation was confirmed in the 2024 budget documents",
        category: "governance",
        submittedBy: "user1",
        verifiedBy: "admin@crecokenya.org",
        priority: "high",
        views: 245,
        trending: true,
        sources: ["Ministry of Finance Budget 2024", "National Treasury Reports"],
        tags: ["budget", "infrastructure", "2024"]
      },
      {
        id: "2", 
        content: "Kenya's GDP grew by 15% last quarter",
        status: "false",
        submittedAt: "2024-01-14",
        verdict: "False: Official KNBS data shows GDP growth was 5.2% for the quarter",
        category: "economy",
        submittedBy: "user2",
        verifiedBy: "admin@crecokenya.org",
        priority: "high",
        views: 189,
        trending: true,
        sources: ["KNBS Economic Survey 2024"],
        tags: ["gdp", "economy", "statistics"]
      },
      {
        id: "3",
        content: "New tax policies will affect small businesses starting next month",
        status: "needs-context",
        submittedAt: "2024-01-13",
        verdict: "Needs Context: While new tax policies are being implemented, the timeline and specific impacts vary by business type and size.",
        category: "governance",
        submittedBy: "user3",
        priority: "medium",
        views: 87,
        tags: ["tax", "business", "policy"]
      },
      {
        id: "4",
        content: "Social media posts claiming free government laptops for students are circulating",
        status: "satire",
        submittedAt: "2024-01-12",
        verdict: "Satire: This originated from a satirical social media account and has no basis in official government policy.",
        category: "education",
        submittedBy: "user4",
        priority: "low",
        views: 156,
        tags: ["education", "laptops", "hoax"]
      }
    ];
    
    storageUtils.setClaims(mockClaims);
  }

  // Initialize blog posts
  const blogPosts = storageUtils.getBlogPosts();
  if (blogPosts.length === 0) {
    const mockPosts: BlogPost[] = [
      {
        id: "1",
        title: "How to Identify Misinformation During Election Season",
        content: "With elections approaching, it's crucial to verify information before sharing...",
        excerpt: "Learn practical tips to spot and verify election-related claims before sharing them.",
        author: "CRECO Research Team",
        authorId: "admin1",
        publishedAt: "2024-01-15",
        category: "elections",
        tags: ["elections", "misinformation", "verification"],
        featured: true,
        status: "published",
        likes: 12,
        shares: 8,
        comments: [],
        viewCount: 156
      },
      {
        id: "2",
        title: "Understanding Government Budget Claims",
        content: "Government budget allocations are often misrepresented in social media...",
        excerpt: "A guide to understanding and verifying government budget and spending claims.",
        author: "Fact-Check Team",
        authorId: "admin2",
        publishedAt: "2024-01-14",
        category: "governance",
        tags: ["budget", "government", "verification"],
        featured: false,
        status: "published",
        likes: 8,
        shares: 5,
        comments: [],
        viewCount: 98
      }
    ];
    storageUtils.setBlogPosts(mockPosts);
  }

  // Initialize trending topics
  const trending = storageUtils.getTrendingTopics();
  if (trending.length === 0) {
    const mockTrending: TrendingTopic[] = [
      {
        id: "1",
        title: "Government Budget 2024",
        claimCount: 12,
        lastUpdated: "2024-01-15",
        category: "governance"
      },
      {
        id: "2",
        title: "Election Security Measures",
        claimCount: 8,
        lastUpdated: "2024-01-14",
        category: "elections"
      },
      {
        id: "3",
        title: "Healthcare Policy Updates",
        claimCount: 5,
        lastUpdated: "2024-01-13",
        category: "health"
      }
    ];
    storageUtils.setTrendingTopics(mockTrending);
  }

  // Initialize quizzes
  const quizzes = storageUtils.getQuizzes();
  if (quizzes.length === 0) {
    const mockQuizzes: Quiz[] = [
      {
        id: "1",
        title: "Election Facts vs Fiction",
        category: "elections",
        points: 50,
        completedBy: [],
        questions: [
          {
            id: "1",
            question: "What is the most reliable way to verify election results?",
            options: [
              "Social media posts",
              "Official electoral commission announcements",
              "Rumors from friends",
              "Unverified news sources"
            ],
            correctAnswer: 1,
            explanation: "Official electoral commission announcements are the most reliable source for election results as they are the authoritative body responsible for conducting elections."
          },
          {
            id: "2",
            question: "Which of these is a common sign of misinformation?",
            options: [
              "Multiple credible sources",
              "Emotional language and urgency",
              "Detailed fact-checking",
              "Official government statements"
            ],
            correctAnswer: 1,
            explanation: "Misinformation often uses emotional language and creates a sense of urgency to make people share content without verifying its accuracy."
          }
        ]
      },
      {
        id: "2",
        title: "Health Misinformation Detection",
        category: "health",
        points: 40,
        completedBy: [],
        questions: [
          {
            id: "1",
            question: "What should you do before sharing health information online?",
            options: [
              "Share immediately to help others",
              "Verify with medical professionals or reputable sources",
              "Add your own opinion",
              "Forward to family groups"
            ],
            correctAnswer: 1,
            explanation: "Health information should always be verified with medical professionals or reputable health organizations before sharing to prevent harm."
          }
        ]
      }
    ];
    localStorage.setItem('truthguard_quizzes', JSON.stringify(mockQuizzes));
  }
};

initializeClaims();