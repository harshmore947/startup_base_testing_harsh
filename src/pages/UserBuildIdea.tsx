import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Building2, Palette, Users, Mail, Target, Zap, Lightbulb, Copy, CheckCircle, ExternalLink, Sparkles, Play } from 'lucide-react';
import { VideoTutorialModal } from '@/components/VideoTutorialModal';
import { PersistentVideoSection } from '@/components/PersistentVideoSection';
import { LegalSetupPage } from './LegalSetupPage';
import { useUserReport } from '@/hooks/useUserReport';
import { useNavigate, useParams } from 'react-router-dom';
import claudeLogo from "@/assets/claude-logo.png";
import cursorLogo from "@/assets/cursor-logo.png";
import lovableLogo from "@/assets/lovable-logo.png";
import chatgptLogo from "@/assets/chatgpt-logo.png";
import emergentLogo from "@/assets/emergent-logo.png";
import v0Logo from "@/assets/v0-logo.png";
import boltLogo from "@/assets/bolt-logo.png";
import geminiLogo from "@/assets/gemini-logo.png";

const renderAIToolRecommendations = (tools: Array<{name: string, url: string, logo: string, description: string}>) => {
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 w-full lg:max-w-sm">
      <CardContent className="p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
          Paste the prompt below on these AI platforms for best results:
        </p>
        <div className="space-y-2">
          {tools.map((tool) => (
            <div 
              key={tool.name}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-background/80 rounded-lg border border-border/30 cursor-pointer hover:bg-background transition-colors min-h-[44px]"
              onClick={() => window.open(tool.url, '_blank')}
            >
              <img src={tool.logo} alt={tool.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-xs sm:text-sm truncate">{tool.name}</div>
              </div>
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function UserBuildIdea() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('ai-tools');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'build' | 'legal'>('build');
  
  const { data: userReport, isLoading, error } = useUserReport(id);

  // Video tutorials configuration
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

  // Check localStorage on section change - MUST be before any conditional returns
  useEffect(() => {
    const tutorial = VIDEO_TUTORIALS[activeSection as keyof typeof VIDEO_TUTORIALS];
    if (!tutorial?.videoId) return;

    const hasSeenTutorial = localStorage.getItem(`hasSeenTutorial_${activeSection}`);
    if (!hasSeenTutorial) {
      setActiveVideoId(tutorial.videoId);
      setShowVideoModal(true);
    }
  }, [activeSection]);

  // Copy function
  const copyToClipboard = (content: string, section: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Handlers for video modal
  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem(`hasSeenTutorial_${activeSection}`, 'true');
    setShowVideoModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading build plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold mb-4">Error Loading Report</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'An unexpected error occurred while loading your build plan.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(`/user-report/${id}`)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Report
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!userReport) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Report Not Found</h1>
          <p className="text-muted-foreground mb-6">The report you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/user-report/${id}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Report
          </Button>
        </div>
      </div>
    );
  }

  const sidebarSections = [
    {
      id: 'ai-tools',
      label: 'Build with AI',
      icon: Zap,
      description: 'AI-powered builders'
    },
    {
      id: 'mvp',
      label: 'Landing Page Builder',
      icon: Building2,
      description: 'Development guide'
    },
    {
      id: 'personas',
      label: 'User Personas',
      icon: Users,
      description: 'Target audience profiles'
    },
    {
      id: 'email',
      label: 'Email System',
      icon: Mail,
      description: 'Email marketing funnel'
    },
    {
      id: 'ads',
      label: 'Ad Creatives',
      icon: Target,
      description: 'Advertising content'
    },
    {
      id: 'branding',
      label: 'Complete Branding',
      icon: Sparkles,
      description: 'Professional branding guide'
    }
  ];

  const aiTools = [
    {
      name: 'Bolt.new',
      url: 'https://bolt.new/',
      description: 'No-code web development',
      logo: boltLogo
    },
    {
      name: 'Lovable',
      url: 'https://lovable.dev/',
      description: 'No-code web development',
      logo: lovableLogo
    },
    {
      name: 'v0',
      url: 'https://v0.dev/',
      description: 'Frontend Expert',
      logo: v0Logo
    },
    {
      name: 'Emergent',
      url: 'https://emergent.ai/',
      description: 'Mobile and Web Apps Creator',
      logo: emergentLogo
    },
    {
      name: 'Claude',
      url: 'https://claude.ai/',
      description: 'AI assistant for branding, coding, prompt generation',
      logo: claudeLogo
    },
    {
      name: 'ChatGPT',
      url: 'https://chat.openai.com/',
      description: 'Conversational AI',
      logo: chatgptLogo
    },
    {
      name: 'Cursor',
      url: 'https://cursor.sh/',
      description: 'AI-powered code editor',
      logo: cursorLogo
    },
    {
      name: 'Gemini',
      url: 'https://gemini.google.com/',
      description: 'Google AI assistant',
      logo: geminiLogo
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'ai-tools':
        return (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ready to Build? Choose Your AI Tool</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Copy your prompt and paste it into any of these AI builders to bring your idea to life.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {aiTools.map((tool) => (
                <Card 
                  key={tool.name}
                  className="group cursor-pointer hover-lift transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
                  onClick={() => window.open(tool.url, '_blank')}
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center h-12 sm:h-16">
                      <img src={tool.logo} alt={tool.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-foreground">{tool.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{tool.description}</p>
                    <div className="flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="text-xs sm:text-sm">Open Tool</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-primary">Pro Tip</h3>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                      Start with the Landing Page Builder prompt from the sidebar, then use any of these AI tools to generate your initial codebase. 
                      Each tool has different strengths - try multiple ones to find your preferred workflow!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Complete Branding</h2>
                <p className="text-muted-foreground">Professional branding strategy and guidelines</p>
              </div>
              
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 max-w-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Paste the prompt below on this AI platform for best results:
                  </p>
                  <div 
                    className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border border-border/30 cursor-pointer hover:bg-background transition-colors"
                    onClick={() => window.open('https://claude.ai/', '_blank')}
                  >
                    <img src={claudeLogo} alt="Claude" className="w-8 h-8 rounded-lg" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Claude</div>
                      <div className="text-xs text-muted-foreground">AI assistant for branding</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coming Soon Video Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Play className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    🎥 Video Guide
                  </h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Video tutorial coming soon! Stay tuned for a comprehensive guide on building your complete branding strategy.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {userReport.brand_package_generator_prompt && (
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Branding Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="group p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="text-foreground leading-relaxed flex-1 whitespace-pre-wrap">{userReport.brand_package_generator_prompt}</div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(userReport.brand_package_generator_prompt || '', 'branding')}
                        >
                          {copiedSection === 'branding' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 'mvp':
        const mvpTutorial = VIDEO_TUTORIALS.mvp;
        const mvpTools = [
          { name: 'Lovable', url: 'https://lovable.dev/', logo: lovableLogo, description: 'React app builder' },
          { name: 'Bolt.new', url: 'https://bolt.new/', logo: boltLogo, description: 'Full-stack web development' },
          { name: 'v0', url: 'https://v0.dev/', logo: v0Logo, description: 'UI component generator' },
          { name: 'Emergent', url: 'https://emergent.ai/', logo: emergentLogo, description: 'Code generation platform' },
          { name: 'Cursor', url: 'https://cursor.sh/', logo: cursorLogo, description: 'AI code editor' }
        ];
        
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">MVP Development Guide</h2>
                <p className="text-muted-foreground">Complete development roadmap and instructions</p>
              </div>
              
              {renderAIToolRecommendations(mvpTools)}
            </div>

            {/* Persistent Video Section */}
            {mvpTutorial.videoId && (
              <PersistentVideoSection
                videoId={mvpTutorial.videoId}
                toolName="mvp"
              />
            )}

            {userReport.mvp_builder_prompt && (
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Development Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="group p-6 bg-gradient-to-r from-accent/15 to-accent/5 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <pre className="text-foreground leading-relaxed flex-1 whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">{userReport.mvp_builder_prompt}</pre>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(userReport.mvp_builder_prompt || '', 'mvp')}
                      >
                        {copiedSection === 'mvp' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'personas':
        if (!userReport.user_persona_generator_prompt) {
          return (
            <div className="text-center py-12">
              <p className="text-muted-foreground">User personas not available for this report.</p>
            </div>
          );
        }

        const personasTutorial = VIDEO_TUTORIALS.personas;
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">User Personas</h2>
                <p className="text-muted-foreground">Target audience profiles</p>
              </div>
              
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 max-w-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Paste the prompt below on this AI platform for best results:
                  </p>
                  <div 
                    className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border border-border/30 cursor-pointer hover:bg-background transition-colors"
                    onClick={() => window.open('https://claude.ai/', '_blank')}
                  >
                    <img src={claudeLogo} alt="Claude" className="w-8 h-8 rounded-lg" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Claude</div>
                      <div className="text-xs text-muted-foreground">AI assistant for personas</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Persistent Video Section */}
            {personasTutorial.videoId && (
              <PersistentVideoSection
                videoId={personasTutorial.videoId}
                toolName="personas"
              />
            )}

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Persona Generation Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="group p-6 bg-gradient-to-r from-secondary/60 to-secondary/30 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <pre className="text-foreground leading-relaxed flex-1 whitespace-pre-wrap text-sm">{userReport.user_persona_generator_prompt}</pre>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(userReport.user_persona_generator_prompt || '', 'personas')}
                    >
                      {copiedSection === 'personas' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'email':
        if (!userReport.email_funnel_generator_prompt) {
          return (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Email system not available for this report.</p>
            </div>
          );
        }

        const emailTutorial = VIDEO_TUTORIALS.email;
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Email Marketing System</h2>
                <p className="text-muted-foreground">Automated email funnel and sequences</p>
              </div>
              
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 max-w-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Paste the prompt below on this AI platform for best results:
                  </p>
                  <div 
                    className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border border-border/30 cursor-pointer hover:bg-background transition-colors"
                    onClick={() => window.open('https://claude.ai/', '_blank')}
                  >
                    <img src={claudeLogo} alt="Claude" className="w-8 h-8 rounded-lg" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Claude</div>
                      <div className="text-xs text-muted-foreground">AI for email marketing</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Persistent Video Section */}
            {emailTutorial.videoId && (
              <PersistentVideoSection
                videoId={emailTutorial.videoId}
                toolName="email"
              />
            )}

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Funnel Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="group p-6 bg-gradient-to-r from-primary/15 to-primary/5 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <pre className="text-foreground leading-relaxed flex-1 whitespace-pre-wrap text-sm">{userReport.email_funnel_generator_prompt}</pre>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(userReport.email_funnel_generator_prompt || '', 'email')}
                    >
                      {copiedSection === 'email' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'ads':
        if (!userReport.ad_creatives_generator_prompt) {
          return (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Ad creatives not available for this report.</p>
            </div>
          );
        }

        const adsTutorial = VIDEO_TUTORIALS.ads;
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Ad Creatives</h2>
                <p className="text-muted-foreground">Ready-to-use advertising content</p>
              </div>
              
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 max-w-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Paste the prompt below on this AI platform for best results:
                  </p>
                  <div 
                    className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border border-border/30 cursor-pointer hover:bg-background transition-colors"
                    onClick={() => window.open('https://claude.ai/', '_blank')}
                  >
                    <img src={claudeLogo} alt="Claude" className="w-8 h-8 rounded-lg" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Claude</div>
                      <div className="text-xs text-muted-foreground">AI for ad creation</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Persistent Video Section */}
            {adsTutorial.videoId && (
              <PersistentVideoSection
                videoId={adsTutorial.videoId}
                toolName="ads"
              />
            )}

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Ad Creative Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="group p-6 bg-gradient-to-r from-accent/15 to-accent/5 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <pre className="text-foreground leading-relaxed flex-1 whitespace-pre-wrap text-sm">{userReport.ad_creatives_generator_prompt}</pre>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(userReport.ad_creatives_generator_prompt || '', 'ads')}
                    >
                      {copiedSection === 'ads' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/user-report/${id}`)}
              className="flex items-center gap-2 h-9 sm:h-10"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back to Report</span>
            </Button>
            <div className="text-center">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Build This Idea</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Professional development tools</p>
            </div>
            <div className="w-9 sm:w-20"></div>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Title */}
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{userReport.idea_title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to bring this idea to life
          </p>
        </div>

        {/* Tab Navigation for Build and Legal sections */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'build' | 'legal')} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="legal">Legal & Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="mt-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Mobile Navigation - Tabs */}
              <div className="lg:hidden">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {sidebarSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;

                    return (
                      <Button
                        key={section.id}
                        variant={isActive ? "default" : "outline"}
                        className={`h-auto py-3 px-3 ${isActive ? '' : 'hover-lift'}`}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div className="text-left truncate text-xs font-medium">{section.label}</div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Left Sidebar - Desktop only */}
              <div className="hidden lg:block lg:w-80 flex-shrink-0">
                <Card className="p-4 sm:p-6 bg-primary/5 sticky top-24">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-primary">PROFESSIONAL TOOLS</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                    Click any tool to access optimized templates
                  </p>

                  <div className="space-y-2">
                    {sidebarSections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;

                      return (
                        <div
                          key={section.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all min-h-[44px] ${
                            isActive
                              ? 'bg-primary/10 border-primary/20 text-primary'
                              : 'bg-muted/30 border-transparent hover:bg-muted/50'
                          }`}
                          onClick={() => setActiveSection(section.id)}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{section.label}</div>
                            <div className="text-xs text-muted-foreground">{section.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {renderContent()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <LegalSetupPage ideaName={userReport.idea_title} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Video Tutorial Modal */}
      {activeVideoId && (
        <VideoTutorialModal
          isOpen={showVideoModal}
          onClose={handleCloseVideoModal}
          videoId={activeVideoId}
          toolName={activeSection}
          onDontShowAgain={handleDontShowAgain}
        />
      )}
    </div>
  );
}