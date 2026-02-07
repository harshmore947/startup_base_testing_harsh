import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import claudeLogo from "@/assets/claude-logo.png";
import cursorLogo from "@/assets/cursor-logo.png";
import lovableLogo from "@/assets/lovable-logo.png";
import chatgptLogo from "@/assets/chatgpt-logo.png";
import emergentLogo from "@/assets/emergent-logo.png";
import v0Logo from "@/assets/v0-logo.png";
import boltLogo from "@/assets/bolt-logo.png";
import geminiLogo from "@/assets/gemini-logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VideoTutorialModal } from "@/components/VideoTutorialModal";
import { PersistentVideoSection } from "@/components/PersistentVideoSection";
import { LegalSetupPage } from "./LegalSetupPage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { LockedPromptCard } from "@/components/LockedPromptCard";
import { StickyUpgradeBar } from "@/components/StickyUpgradeBar";
import { ArrowLeft, Crown, Palette, Globe, Users, Calendar, Mail, Target, Zap, Building2, Lightbulb, Copy, CheckCircle, ExternalLink, Sparkles, Play, Wrench, Scale, Video, Star, Bookmark, ChevronDown, ChevronUp, MoreVertical, Trophy, ArrowUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIdeaOfTheDay } from "@/hooks/useIdeaOfTheDay";

// Enhanced utility functions for better JSON parsing and display
const parseJsonContent = (content: any): any => {
  if (!content) return null;
  try {
    if (typeof content === 'string') {
      // Handle potential double JSON encoding
      let parsed = JSON.parse(content);
      // If it's still a string after parsing, try parsing again
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      return parsed;
    }
    return content;
  } catch (error) {
    console.error('Error parsing JSON content:', error, content);
    // Return the original content if parsing fails
    return typeof content === 'string' ? content : String(content);
  }
};

const extractPromptContent = (data: any, key?: string): string => {
  if (!data) return '';
  
  try {
    // If it's already a string, return it
    if (typeof data === 'string') {
      // Try to parse if it looks like JSON
      try {
        const parsed = JSON.parse(data);
        // If parsed successfully and has a nested key, extract it
        if (typeof parsed === 'object' && parsed !== null) {
          // Common nested keys to check
          const possibleKeys = [key, 'mvp_builder_prompt', 'user_persona_prompt', 'email_prompt', 'ad_creative_prompt', 'prompt', 'content'];
          for (const k of possibleKeys) {
            if (k && parsed[k] && typeof parsed[k] === 'string') {
              return parsed[k];
            }
          }
          // If no nested key found, return pretty JSON
          return JSON.stringify(parsed, null, 2);
        }
        return data;
      } catch {
        // Not JSON, return as-is
        return data;
      }
    }
    
    // If it's an object, try to extract nested content
    if (typeof data === 'object' && data !== null) {
      // Check common nested keys
      const possibleKeys = [key, 'mvp_builder_prompt', 'user_persona_prompt', 'email_prompt', 'ad_creative_prompt', 'prompt', 'content'];
      for (const k of possibleKeys) {
        if (k && data[k] && typeof data[k] === 'string') {
          return data[k];
        }
      }
      // If no nested key found, return pretty JSON
      return JSON.stringify(data, null, 2);
    }
    
    return String(data);
  } catch (error) {
    console.error('Error extracting prompt content:', error);
    return String(data);
  }
};

const renderAIToolRecommendations = (tools: Array<{
  name: string;
  url: string;
  icon: string;
  description: string;
}>) => {
  return <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 w-full lg:max-w-sm">
      <CardContent className="p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
          Paste the prompt below on these AI platforms for best results:
        </p>
        <div className="space-y-2">
          {tools.map(tool => <div key={tool.name} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-background/80 rounded-lg border border-border/30 cursor-pointer hover:bg-background transition-colors min-h-[44px]" onClick={() => window.open(tool.url, '_blank')}>
              <img src={tool.icon} alt={tool.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-xs sm:text-sm truncate">{tool.name}</div>
              </div>
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            </div>)}
        </div>
      </CardContent>
    </Card>;
};
const BuildThisIdea = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'build' | 'legal'>('build');
  const [activeSection, setActiveSection] = useState('ai-tools');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const {
    toast
  } = useToast();

  // Track visited sections for progress
  const [visitedSections, setVisitedSections] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('visitedSections');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Track copied items for visual feedback
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});

  // Track bookmarked sections
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('bookmarkedSections');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Track achievements
  const [achievements, setAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('achievements');
    return saved ? JSON.parse(saved) : [];
  });

  // Track expanded cards
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Track hovered AI tool
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Track FAB visibility
  const [showFAB, setShowFAB] = useState(false);

  // Welcome modal
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('hasSeenWelcome');
  });

  // Auth and subscription checking
  const { user, loading: authLoading, isPremium } = useAuth();

  const isPreviewMode = !isPremium; // Show preview for both non-logged-in and free users
  const showSignupCTA = !user; // Show signup CTA for non-logged-in users

  // Define sidebar sections before useEffect hooks that reference it
  const sidebarSections = [{
    id: 'ai-tools',
    label: 'Build with AI',
    icon: Zap,
    description: 'Start here',
    hasVideo: false,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20'
  }, {
    id: 'mvp',
    label: 'Landing Page Builder',
    icon: Building2,
    description: 'Build your MVP fast',
    hasVideo: true,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20'
  }, {
    id: 'personas',
    label: 'User Personas',
    icon: Users,
    description: 'Know your audience',
    hasVideo: true,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20'
  }, {
    id: 'email',
    label: 'Email System',
    icon: Mail,
    description: 'Automated sequences',
    hasVideo: true,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950/20'
  }, {
    id: 'ads',
    label: 'Ad Creatives',
    icon: Target,
    description: 'High-converting ads',
    hasVideo: true,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20'
  }, {
    id: 'branding',
    label: 'Complete Branding',
    icon: Sparkles,
    description: 'Identity & guidelines',
    hasVideo: false,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20'
  }];
  useEffect(() => {
    localStorage.setItem('visitedSections', JSON.stringify(Array.from(visitedSections)));
  }, [visitedSections]);
  useEffect(() => {
    localStorage.setItem('bookmarkedSections', JSON.stringify(Array.from(bookmarkedSections)));
  }, [bookmarkedSections]);
  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);
  useEffect(() => {
    if (activeSection && !visitedSections.has(activeSection)) {
      setVisitedSections(prev => new Set([...prev, activeSection]));
    }
  }, [activeSection]);

  // FAB scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowFAB(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check achievements
  useEffect(() => {
    const checkAchievements = () => {
      const newAchievements: string[] = [];
      if (visitedSections.size >= 3 && !achievements.includes('explorer')) {
        newAchievements.push('explorer');
        toast({
          title: "🎉 Achievement Unlocked!",
          description: "Explorer: Visited 3 sections",
          duration: 4000
        });
      }
      if (visitedSections.size === sidebarSections.length && !achievements.includes('completionist')) {
        newAchievements.push('completionist');
        toast({
          title: "🏆 Achievement Unlocked!",
          description: "Completionist: Explored all sections!",
          duration: 4000
        });
      }
      if (bookmarkedSections.size >= 3 && !achievements.includes('collector')) {
        newAchievements.push('collector');
        toast({
          title: "⭐ Achievement Unlocked!",
          description: "Collector: Bookmarked 3+ sections",
          duration: 4000
        });
      }
      if (newAchievements.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements]);
      }
    };
    checkAchievements();
  }, [visitedSections.size, bookmarkedSections.size]);
  const handleCopy = async (content: string, itemId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedItems(prev => ({
      ...prev,
      [itemId]: true
    }));
    toast({
      title: "✓ Copied to clipboard!",
      description: "Ready to paste into your AI tool",
      duration: 2000,
      className: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
    });
    setTimeout(() => {
      setCopiedItems(prev => ({
        ...prev,
        [itemId]: false
      }));
    }, 2000);
  };
  const toggleBookmark = (sectionId: string) => {
    setBookmarkedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
        toast({
          title: "Bookmark removed"
        });
      } else {
        newSet.add(sectionId);
        toast({
          title: "✨ Bookmarked for later"
        });
      }
      return newSet;
    });
  };
  const handleWelcomeDismiss = (startTour: boolean) => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
    if (startTour) {
      setActiveSection('ai-tools');
      toast({
        title: "👋 Let's get started!",
        description: "First, let's explore the AI tools available to you.",
        duration: 5000
      });
    }
  };

  // Handle URL section and tab parameters
  useEffect(() => {
    const section = searchParams.get('section');
    const tab = searchParams.get('tab');
    if (section) {
      setActiveSection(section);
    }
    if (tab === 'legal') {
      setActiveTab('legal');
    }
  }, [searchParams]);

  // Video tutorial configuration
  const VIDEO_TUTORIALS = {
    branding: {
      videoId: null,
      title: 'Complete Branding Tutorial'
    },
    mvp: {
      videoId: 'Uoptd2bAuaI',
      title: 'Landing Page Builder Tutorial'
    },
    personas: {
      videoId: 'OypgF3eaBoc',
      title: 'User Personas Tutorial'
    },
    email: {
      videoId: 'WGna5tppp4s',
      title: 'Email System Tutorial'
    },
    ads: {
      videoId: 'JvR2mkDDMEs',
      title: 'Ad Creatives Tutorial'
    }
  };

  // Check localStorage on section change
  useEffect(() => {
    const tutorial = VIDEO_TUTORIALS[activeSection as keyof typeof VIDEO_TUTORIALS];
    if (!tutorial?.videoId) return;
    const hasSeenTutorial = localStorage.getItem(`hasSeenTutorial_${activeSection}`);
    if (!hasSeenTutorial) {
      setActiveVideoId(tutorial.videoId);
      setShowVideoModal(true);
    }
  }, [activeSection]);
  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
  };
  const handleDontShowAgain = () => {
    localStorage.setItem(`hasSeenTutorial_${activeSection}`, 'true');
    setShowVideoModal(false);
  };

  // Fetch the idea of the day with all new columns
  const {
    data: ideaOfTheDay,
    isLoading
  } = useIdeaOfTheDay();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Professional Tools</h2>
          <p className="text-muted-foreground">Preparing your build environment...</p>
        </div>
      </div>;
  }
  if (!ideaOfTheDay) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">No Build Package Available</h1>
          <p className="text-muted-foreground mb-6">No idea of the day found to build.</p>
          <Button onClick={() => navigate('/')} className="hover-lift">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>;
  }

  // sidebarSections moved earlier to fix initialization order

  const aiTools = [{
    name: 'Bolt.new',
    url: 'https://bolt.new/',
    description: 'No-code web development',
    icon: boltLogo,
    badges: ['Full-stack', 'Fast']
  }, {
    name: 'Lovable',
    url: 'https://lovable.dev/',
    description: 'React app builder',
    icon: lovableLogo,
    badges: ['React', 'Best for MVPs', '⭐ Recommended']
  }, {
    name: 'v0',
    url: 'https://v0.app/',
    description: 'Frontend Expert',
    icon: v0Logo,
    badges: ['Frontend', 'UI/UX']
  }, {
    name: 'Emergent',
    url: 'https://app.emergent.sh/',
    description: 'Mobile and Web Apps Creator',
    icon: emergentLogo,
    badges: ['Mobile', 'Web']
  }, {
    name: 'Claude',
    url: 'https://claude.ai/',
    description: 'AI assistant for branding, coding, prompt generation',
    icon: claudeLogo,
    badges: ['Branding', 'Coding', 'Content']
  }, {
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    description: 'Conversational AI',
    icon: chatgptLogo,
    badges: ['General', 'Popular']
  }, {
    name: 'Cursor',
    url: 'https://cursor.com/agents',
    description: 'AI-powered code editor',
    icon: cursorLogo,
    badges: ['Coding', 'IDE']
  }, {
    name: 'Gemini',
    url: 'https://gemini.google.com/app',
    description: 'Google AI assistant',
    icon: geminiLogo,
    badges: ['General', 'Research']
  }];
  const renderContent = () => {
    switch (activeSection) {
      case 'ai-tools':
        return <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ready to Build? Choose Your AI Tool</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Copy your prompt and paste it into any of these AI builders to bring your idea to life.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {aiTools.map(tool => <Card key={tool.name} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50" onMouseEnter={() => setHoveredTool(tool.name)} onMouseLeave={() => setHoveredTool(null)} onClick={() => window.open(tool.url, '_blank')}>
                  <CardContent className="p-6">
                    {/* Logo */}
                    <div className="mb-4 relative">
                      <img src={tool.icon} alt={tool.name} className="h-16 w-16 object-contain mx-auto transition-transform duration-300 group-hover:scale-110" />
                      {hoveredTool === tool.name && <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg animate-fade-in" />}
                    </div>

                    {/* Tool Name */}
                    <h3 className="text-lg font-bold text-center mb-2 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      {tool.description}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                      {tool.badges?.map(badge => <Badge key={badge} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>)}
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/80" variant={hoveredTool === tool.name ? "default" : "outline"}>
                      Launch Tool
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>

                    {/* Quick Actions Dropdown */}
                    {hoveredTool === tool.name && <div className="absolute top-2 right-2 animate-scale-in">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-background/80 backdrop-blur">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={e => {
                        e.stopPropagation();
                        toggleBookmark(tool.name);
                      }}>
                              <Bookmark className="mr-2 h-4 w-4" />
                              Bookmark Tool
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>}
                  </CardContent>
                </Card>)}
            </div>

            <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-primary">Pro Tip</h3>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">Start with the Landing Page Builder prompt from the sidebar, then use any of these AI tools to generate your initial codebase. Each tool has different strengths - try multiple ones to find your preferred workflow!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>;
      case 'branding':
        return <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Coming Soon Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    🎥 Video Guide
                  </h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Video tutorial coming soon! Stay tuned for a comprehensive guide on building your complete branding strategy.
                </p>
              </CardContent>
            </Card>

            <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Complete Branding</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Professional branding strategy and guidelines</p>
              </div>
              
              {/* AI Tool Recommendation */}
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 w-full lg:max-w-sm">
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    Paste the prompt below on this AI platform for best results:
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-background/80 rounded-lg border border-border/30 cursor-pointer hover:bg-background transition-colors min-h-[44px]" onClick={() => window.open('https://claude.ai/', '_blank')}>
                    <img src={claudeLogo} alt="Claude" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium text-foreground">Claude</div>
                      <div className="text-xs text-muted-foreground">AI assistant for branding</div>
                    </div>
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signup CTA Banner for non-logged-in users */}
            {showSignupCTA && (
              <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 shadow-xl mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left text-white">
                      <h3 className="text-xl font-bold mb-2">🚀 Want Access to Build Tools?</h3>
                      <p className="text-indigo-100">Create a free account to get started • Upgrade for full access to prompts</p>
                    </div>
                    <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg whitespace-nowrap">
                      <a href="/auth?mode=signup&redirect=/build-this-idea">Sign Up Free →</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 sm:gap-6">
              {(ideaOfTheDay as any)['branding'] && (
                isPreviewMode ? (
                  <LockedPromptCard
                    title="Branding Strategy"
                    icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
                    preview={(ideaOfTheDay as any)['branding']?.substring(0, 150) + '...'}
                    ctaText={showSignupCTA ? "Sign Up to Build" : "Upgrade to Premium - ₹999/year"}
                    ctaLink={showSignupCTA ? "/auth?mode=signup&redirect=/build-this-idea" : "/pricing"}
                  />
                ) : (
                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Branding Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="group p-3 sm:p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm sm:text-base text-foreground leading-relaxed flex-1 whitespace-pre-wrap break-words">{(ideaOfTheDay as any)['branding']}</div>
                          <Button variant="ghost" size="sm" className={`opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all h-8 w-8 sm:h-6 sm:w-6 flex-shrink-0 ${copiedItems['branding'] ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`} onClick={() => handleCopy((ideaOfTheDay as any)['branding'], 'branding')}>
                            {copiedItems['branding'] ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 animate-scale-in" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>;
      case 'mvp':
        const mvpTutorial = VIDEO_TUTORIALS.mvp;
        const mvpTools = [{
          name: 'Lovable',
          url: 'https://lovable.dev/',
          icon: lovableLogo,
          description: 'React app builder'
        }, {
          name: 'Bolt.new',
          url: 'https://bolt.new/',
          icon: boltLogo,
          description: 'Full-stack web development'
        }, {
          name: 'v0',
          url: 'https://v0.app/',
          icon: v0Logo,
          description: 'UI component generator'
        }, {
          name: 'Emergent',
          url: 'https://app.emergent.sh/',
          icon: emergentLogo,
          description: 'Code generation platform'
        }, {
          name: 'Cursor',
          url: 'https://cursor.com/agents',
          icon: cursorLogo,
          description: 'AI code editor'
        }];
        return <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Landing Page Builder Guide</h2>
                <p className="text-muted-foreground">Complete landing page development instructions</p>
              </div>
              
              {/* AI Tool Recommendations */}
              {renderAIToolRecommendations(mvpTools)}
            </div>

            {/* Signup CTA Banner for non-logged-in users */}
            {showSignupCTA && (
              <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 shadow-xl mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left text-white">
                      <h3 className="text-xl font-bold mb-2">🚀 Want Access to Build Tools?</h3>
                      <p className="text-indigo-100">Create a free account to get started • Upgrade for full access to prompts</p>
                    </div>
                    <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg whitespace-nowrap">
                      <a href="/auth?mode=signup&redirect=/build-this-idea">Sign Up Free →</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Persistent Video Section */}
            {mvpTutorial.videoId && <PersistentVideoSection videoId={mvpTutorial.videoId} toolName="mvp" />}

            {(ideaOfTheDay as any)['MVP_Building_Prompt'] && (
              isPreviewMode ? (
                <LockedPromptCard
                  title="Landing Page Instructions"
                  icon={<Building2 className="h-5 w-5 text-primary" />}
                  preview={extractPromptContent((ideaOfTheDay as any)['MVP_Building_Prompt'], 'mvp_builder_prompt')?.substring(0, 150) + '...'}
                  ctaText={showSignupCTA ? "Sign Up to Build" : "Upgrade to Premium - ₹999/year"}
                  ctaLink={showSignupCTA ? "/auth?mode=signup&redirect=/build-this-idea" : "/pricing"}
                />
              ) : (
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Landing Page Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="group bg-gradient-to-r from-accent/15 to-accent/5 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between gap-4 p-6">
                        <div className="flex-1 min-w-0 -my-2">
                          <pre className="text-foreground leading-relaxed whitespace-pre-wrap font-mono text-sm break-words max-h-96 overflow-y-auto p-4 bg-background/30 rounded-lg">{extractPromptContent((ideaOfTheDay as any)['MVP_Building_Prompt'], 'mvp_builder_prompt')}</pre>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={() => navigator.clipboard.writeText(extractPromptContent((ideaOfTheDay as any)['MVP_Building_Prompt'], 'mvp_builder_prompt'))}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>;
      case 'personas':
        const personasTutorial = VIDEO_TUTORIALS.personas;
        const personasTools = [{
          name: 'ChatGPT',
          url: 'https://chatgpt.com/',
          icon: chatgptLogo,
          description: 'Conversational AI'
        }, {
          name: 'Gemini',
          url: 'https://gemini.google.com/app',
          icon: geminiLogo,
          description: 'Google AI assistant'
        }, {
          name: 'Claude',
          url: 'https://claude.ai/',
          icon: claudeLogo,
          description: 'AI assistant'
        }];
        return <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">User Personas</h2>
                <p className="text-muted-foreground">Detailed profiles of your target audience</p>
              </div>
              
              {/* AI Tool Recommendations */}
              {renderAIToolRecommendations(personasTools)}
            </div>

            {/* Signup CTA Banner for non-logged-in users */}
            {showSignupCTA && (
              <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 shadow-xl mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left text-white">
                      <h3 className="text-xl font-bold mb-2">🚀 Want Access to Build Tools?</h3>
                      <p className="text-indigo-100">Create a free account to get started • Upgrade for full access to prompts</p>
                    </div>
                    <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg whitespace-nowrap">
                      <a href="/auth?mode=signup&redirect=/build-this-idea">Sign Up Free →</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Persistent Video Section */}
            {personasTutorial.videoId && <PersistentVideoSection videoId={personasTutorial.videoId} toolName="personas" />}

            {(ideaOfTheDay as any)['user_personas'] && (
              isPreviewMode ? (
                <LockedPromptCard
                  title="Target Audience Profiles"
                  icon={<Users className="h-5 w-5 text-primary" />}
                  preview={extractPromptContent((ideaOfTheDay as any)['user_personas'], 'user_persona_prompt')?.substring(0, 150) + '...'}
                  ctaText={showSignupCTA ? "Sign Up to Build" : "Upgrade to Premium - ₹999/year"}
                  ctaLink={showSignupCTA ? "/auth?mode=signup&redirect=/build-this-idea" : "/pricing"}
                />
              ) : (
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Target Audience Profiles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="group bg-gradient-to-r from-accent/15 to-accent/5 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between p-6">
                        <div className="flex-1 -my-2">
                          <pre className="text-foreground leading-relaxed whitespace-pre-wrap font-mono text-sm break-words max-h-96 overflow-y-auto p-4 bg-background/30 rounded-lg">
                            {extractPromptContent((ideaOfTheDay as any)['user_personas'], 'user_persona_prompt')}
                          </pre>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigator.clipboard.writeText(extractPromptContent((ideaOfTheDay as any)['user_personas'], 'user_persona_prompt'))}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>;
      case 'email':
        const emailTutorial = VIDEO_TUTORIALS.email;
        const emailTools = [{
          name: 'Claude',
          url: 'https://claude.ai/',
          icon: claudeLogo,
          description: 'AI assistant'
        }, {
          name: 'ChatGPT',
          url: 'https://chatgpt.com/',
          icon: chatgptLogo,
          description: 'Conversational AI'
        }, {
          name: 'Gemini',
          url: 'https://gemini.google.com/app',
          icon: geminiLogo,
          description: 'Google AI assistant'
        }];
        return <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Email Marketing System</h2>
                <p className="text-muted-foreground">Complete email funnel with sequences and automation</p>
              </div>
              
              {/* AI Tool Recommendations */}
              {renderAIToolRecommendations(emailTools)}
            </div>

            {/* Signup CTA Banner for non-logged-in users */}
            {showSignupCTA && (
              <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 shadow-xl mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left text-white">
                      <h3 className="text-xl font-bold mb-2">🚀 Want Access to Build Tools?</h3>
                      <p className="text-indigo-100">Create a free account to get started • Upgrade for full access to prompts</p>
                    </div>
                    <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg whitespace-nowrap">
                      <a href="/auth?mode=signup&redirect=/build-this-idea">Sign Up Free →</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Persistent Video Section */}
            {emailTutorial.videoId && <PersistentVideoSection videoId={emailTutorial.videoId} toolName="email" />}

            {(ideaOfTheDay as any)['email_funnel_system'] && (
              isPreviewMode ? (
                <LockedPromptCard
                  title="Email Funnel & Automation"
                  icon={<Mail className="h-5 w-5 text-primary" />}
                  preview={extractPromptContent((ideaOfTheDay as any)['email_funnel_system'], 'email_prompt')?.substring(0, 150) + '...'}
                  ctaText={showSignupCTA ? "Sign Up to Build" : "Upgrade to Premium - ₹999/year"}
                  ctaLink={showSignupCTA ? "/auth?mode=signup&redirect=/build-this-idea" : "/pricing"}
                />
              ) : (
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Email Funnel & Automation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="group bg-gradient-to-r from-accent/15 to-accent/5 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between p-6">
                        <div className="flex-1 -my-2">
                          <pre className="text-foreground leading-relaxed whitespace-pre-wrap font-mono text-sm break-words max-h-96 overflow-y-auto p-4 bg-background/30 rounded-lg">
                            {extractPromptContent((ideaOfTheDay as any)['email_funnel_system'], 'email_prompt')}
                          </pre>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigator.clipboard.writeText(extractPromptContent((ideaOfTheDay as any)['email_funnel_system'], 'email_prompt'))}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>;
      case 'ads':
        const adsTutorial = VIDEO_TUTORIALS.ads;
        const adTools = [{
          name: 'Gemini',
          url: 'https://gemini.google.com/app',
          icon: geminiLogo,
          description: 'Google AI assistant'
        }, {
          name: 'Claude',
          url: 'https://claude.ai/',
          icon: claudeLogo,
          description: 'AI assistant'
        }, {
          name: 'ChatGPT',
          url: 'https://chatgpt.com/',
          icon: chatgptLogo,
          description: 'Conversational AI'
        }];
        return <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Advertising Creatives</h2>
                <p className="text-muted-foreground">High-converting ad copy and creative concepts</p>
              </div>
              
              {/* AI Tool Recommendations */}
              {renderAIToolRecommendations(adTools)}
            </div>

            {/* Signup CTA Banner for non-logged-in users */}
            {showSignupCTA && (
              <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 shadow-xl mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left text-white">
                      <h3 className="text-xl font-bold mb-2">🚀 Want Access to Build Tools?</h3>
                      <p className="text-indigo-100">Create a free account to get started • Upgrade for full access to prompts</p>
                    </div>
                    <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg whitespace-nowrap">
                      <a href="/auth?mode=signup&redirect=/build-this-idea">Sign Up Free →</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Persistent Video Section */}
            {adsTutorial.videoId && <PersistentVideoSection videoId={adsTutorial.videoId} toolName="ads" />}

            {(ideaOfTheDay as any)['ad_creatives'] && (
              isPreviewMode ? (
                <LockedPromptCard
                  title="Ad Copy & Creative Concepts"
                  icon={<Target className="h-5 w-5 text-primary" />}
                  preview={extractPromptContent((ideaOfTheDay as any)['ad_creatives'], 'ad_creative_prompt')?.substring(0, 150) + '...'}
                  ctaText={showSignupCTA ? "Sign Up to Build" : "Upgrade to Premium - ₹999/year"}
                  ctaLink={showSignupCTA ? "/auth?mode=signup&redirect=/build-this-idea" : "/pricing"}
                />
              ) : (
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Ad Copy & Creative Concepts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="group bg-gradient-to-r from-accent/15 to-accent/5 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between p-6">
                        <div className="flex-1 -my-2">
                          <pre className="text-foreground leading-relaxed whitespace-pre-wrap font-mono text-sm break-words max-h-96 overflow-y-auto p-4 bg-background/30 rounded-lg">
                            {extractPromptContent((ideaOfTheDay as any)['ad_creatives'], 'ad_creative_prompt')}
                          </pre>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigator.clipboard.writeText(extractPromptContent((ideaOfTheDay as any)['ad_creatives'], 'ad_creative_prompt'))}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>;
      default:
        return <div className="text-center py-20 animate-fade-in">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Select a Build Tool</h3>
            <p className="text-muted-foreground">Choose a section from the sidebar to view professional templates</p>
          </div>;
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-background">
      {/* Video Tutorial Modal */}
      {activeVideoId && <VideoTutorialModal isOpen={showVideoModal} onClose={handleCloseVideoModal} videoId={activeVideoId} toolName={activeSection} onDontShowAgain={handleDontShowAgain} />}

      {/* Professional Header */}
      <div className="border-b border-border bg-gradient-to-r from-card to-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-8">
          {/* Row 1: Navigation */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Row 2: Main Branding */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              {/* Large prominent icon */}
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-md">
                <Crown className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Launch Your Startup</h1>
                <p className="text-base md:text-lg text-muted-foreground mt-1 leading-relaxed">
                  Everything you need from idea to incorporation
                </p>
              </div>
            </div>
            {/* Build Mode Badge */}
            <Badge variant="secondary" className="h-8 px-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Build Mode Active
            </Badge>
          </div>

          {/* Row 3: Current Idea Context */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Building:</span>
              <span className="font-semibold text-foreground">{ideaOfTheDay.title}</span>
              <Badge variant="outline" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'build' | 'legal')} className="w-full">
          <TabsList className="mb-6 h-auto p-1 bg-muted/50">
            <TabsTrigger value="build" className="flex flex-col items-start gap-1 px-6 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span className="font-semibold">🛠️ Build Tools</span>
              </div>
              <span className="text-xs text-muted-foreground">6 Tools · {sidebarSections.filter(s => s.hasVideo).length} Videos</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex flex-col items-start gap-1 px-6 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                <span className="font-semibold">⚖️ Legal & Setup</span>
              </div>
              <span className="text-xs text-muted-foreground">Free Consultation</span>
            </TabsTrigger>
          </TabsList>

          {/* Build Tools Tab Content */}
          <TabsContent value="build" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 sm:gap-8">
              {/* Enhanced Sidebar Navigation */}
              <aside className="space-y-3">
                {/* Progress Card */}
                <div className="mb-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-semibold">Your Progress</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {achievements.length} achievements
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Sections explored</span>
                      <span className="font-medium">{visitedSections.size}/{sidebarSections.length}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500" style={{
                      width: `${visitedSections.size / sidebarSections.length * 100}%`
                    }} />
                    </div>
                  </div>
                  
                  {visitedSections.size === sidebarSections.length && <div className="mt-3 p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800 text-center">
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        🎉 All sections completed!
                      </span>
                    </div>}
                </div>

                <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">Professional Tools</h3>
                {sidebarSections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const progress = visitedSections.has(section.id) ? 100 : 0;
                return <Button key={section.id} variant={isActive ? "default" : "ghost"} className={`w-full justify-start h-auto p-5 transition-all duration-200 ${isActive ? `${section.bgColor} border-l-4 border-l-primary shadow-md` : 'hover:bg-muted/50'}`} onClick={() => setActiveSection(section.id)}>
                      <div className="flex items-start gap-4 w-full">
                        <div className={`p-2.5 rounded-lg ${isActive ? 'bg-white dark:bg-gray-900 shadow-sm' : 'bg-muted'} flex-shrink-0`}>
                          <Icon className={`h-6 w-6 ${section.color}`} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-base ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                              {section.label}
                            </span>
                            {visitedSections.has(section.id) && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                            {bookmarkedSections.has(section.id) && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                          </div>
                          <div className="text-sm text-foreground/70 font-medium mb-2">{section.description}</div>
                          {section.hasVideo && <div className="flex items-center gap-1 mt-2">
                              <Badge variant="outline" className="h-6 px-2 text-xs bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                                <Video className="h-3 w-3 mr-1 text-blue-600" />
                                <span className="text-blue-700 dark:text-blue-300 font-medium">Tutorial</span>
                              </Badge>
                              {!localStorage.getItem(`hasSeenTutorial_${section.id}`) && <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>}
                            </div>}
                          {progress > 0 && <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500" style={{
                          width: `${progress}%`
                        }} />
                            </div>}
                        </div>
                      </div>
                    </Button>;
              })}
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                {renderContent()}
              </div>
            </div>
          </TabsContent>

          {/* Legal & Setup Tab Content */}
          <TabsContent value="legal" className="mt-0">
            <LegalSetupPage ideaName={ideaOfTheDay?.title || 'this idea'} ideaType={(ideaOfTheDay as any)?.category} recommendedStructure={(ideaOfTheDay as any)?.biz_structure} structureReasons={(ideaOfTheDay as any)?.structure_reason ? typeof (ideaOfTheDay as any).structure_reason === 'string' ? (ideaOfTheDay as any).structure_reason.split('\n').filter((r: string) => r.trim()) : Array.isArray((ideaOfTheDay as any).structure_reason) ? (ideaOfTheDay as any).structure_reason : [] : undefined} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Welcome Modal */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Welcome to Build Tools!
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Everything you need to build your startup, all in one place.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <span className="text-lg">1️⃣</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Choose a tool from sidebar</h4>
                <p className="text-sm text-muted-foreground">
                  Each section contains optimized prompts and resources
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <span className="text-lg">2️⃣</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Copy the prompts</h4>
                <p className="text-sm text-muted-foreground">
                  Click the copy button to grab AI-optimized prompts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <span className="text-lg">3️⃣</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Paste into AI tools</h4>
                <p className="text-sm text-muted-foreground">
                  Use with ChatGPT, Claude, Gemini, or our recommended tools
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <span className="text-lg">4️⃣</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Build your startup! 🚀</h4>
                <p className="text-sm text-muted-foreground">
                  Watch video tutorials for step-by-step guidance
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleWelcomeDismiss(false)} className="w-full sm:w-auto">
              Got it!
            </Button>
            <Button onClick={() => handleWelcomeDismiss(true)} className="w-full sm:w-auto">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button (Mobile) */}
      {showFAB && <div className="fixed bottom-6 right-6 z-50 md:hidden animate-scale-in">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Sparkles className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })}>
                <ArrowUp className="mr-2 h-4 w-4" />
                Back to Top
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSection('ai-tools')}>
                <Zap className="mr-2 h-4 w-4" />
                Quick: AI Tools
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({
            title: `You have ${bookmarkedSections.size} bookmarks`
          })}>
                <Bookmark className="mr-2 h-4 w-4" />
                View Bookmarks ({bookmarkedSections.size})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>}

      {/* Sticky Upgrade Bar for Preview Mode */}
      {isPreviewMode && <StickyUpgradeBar isSignup={showSignupCTA} />}
    </div>;
};
export default BuildThisIdea;