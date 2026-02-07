import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useIdeaById } from '@/hooks/useIdeaById';
import {
  ArrowLeft,
  Zap,
  Sparkles,
  Building2,
  Users,
  Mail,
  Target,
  Copy,
  ExternalLink,
  ChevronRight,
  Play,
  Scale,
  Wrench
} from 'lucide-react';
import { VideoTutorialModal } from '@/components/VideoTutorialModal';
import { PersistentVideoSection } from '@/components/PersistentVideoSection';
import { LegalSetupPage } from './LegalSetupPage';
import boltLogo from '@/assets/bolt-logo.png';
import lovableLogo from '@/assets/lovable-logo.png';
import v0Logo from '@/assets/v0-logo.png';
import emergentLogo from '@/assets/emergent-logo.png';
import claudeLogo from '@/assets/claude-logo.png';
import chatgptLogo from '@/assets/chatgpt-logo.png';
import cursorLogo from '@/assets/cursor-logo.png';
import geminiLogo from '@/assets/gemini-logo.png';

// Helper function to safely parse JSON content
const parseJsonContent = (content: any): any => {
  if (!content) return null;
  
  try {
    // If it's already an object, return it
    if (typeof content === 'object' && content !== null) {
      return content;
    }
    
    // If it's a string, try to parse it
    if (typeof content === 'string') {
      // Handle potential double encoding
      let parsed = JSON.parse(content);
      
      // If the result is still a string, try parsing again
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          // If second parse fails, return the first parsed result
          return parsed;
        }
      }
      
      return parsed;
    }
    
    return content;
  } catch (error) {
    console.error('Error parsing JSON content:', error);
    return content; // Return original content if parsing fails
  }
};

// Helper function to render interactive content
const renderInteractiveContent = (data: any, title: string) => {
  if (!data) return null;

  const parsedData = parseJsonContent(data);
  
  // Helper function to copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (Array.isArray(parsedData)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg text-foreground">{title}</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(parsedData, null, 2))}
            className="hover:bg-muted"
          >
            <Copy size={14} className="mr-2" />
            Copy All
          </Button>
        </div>
        {parsedData.map((item, index) => (
          <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-foreground mb-2">
                  {item.title || item.name || item.headline || `Item ${index + 1}`}
                </h5>
                <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                  {item.description || item.content || item.summary || JSON.stringify(item)}
                </p>
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    <ExternalLink size={14} />
                    View Source
                  </a>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(item, null, 2))}
                className="ml-2 hover:bg-muted"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (typeof parsedData === 'object' && parsedData !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg text-foreground">{title}</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(parsedData, null, 2))}
            className="hover:bg-muted"
          >
            <Copy size={14} className="mr-2" />
            Copy
          </Button>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-mono">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // For string content
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg text-foreground">{title}</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(parsedData?.toString() || '')}
          className="hover:bg-muted"
        >
          <Copy size={14} className="mr-2" />
          Copy
        </Button>
      </div>
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {parsedData?.toString() || 'No content available'}
        </p>
      </div>
    </div>
  );
};

// AI Tool Section Component
const AiToolSection = ({ tools }: { tools: Array<{name: string, url: string, icon: string, description: string}> }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl">Recommended AI Tools</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
            <img src={tool.icon} alt={tool.name} className="w-8 h-8 rounded" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{tool.name}</h4>
                <Badge variant="outline" className="text-xs">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <ExternalLink size={10} />
                    Open
                  </a>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const BuildIdeaDynamic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'build' | 'legal'>('build');
  const [activeSection, setActiveSection] = useState('ai-tools');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Fetch the specific idea with all columns
  const { data: idea, isLoading } = useIdeaById(id);

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

  // Check localStorage on section change - MUST be before early returns
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Professional Tools</h2>
          <p className="text-muted-foreground">Preparing your build environment...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">No Build Package Available</h1>
          <p className="text-muted-foreground mb-6">Idea not found.</p>
          <Button onClick={() => navigate('/archive')} className="hover-lift">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ideas
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
      description: 'Full-stack web development',
      icon: boltLogo
    },
    {
      name: 'Lovable',
      url: 'https://lovable.dev/',
      description: 'React app builder',
      icon: lovableLogo
    },
    {
      name: 'v0',
      url: 'https://v0.app/',
      description: 'UI component generator',
      icon: v0Logo
    },
    {
      name: 'Emergent',
      url: 'https://app.emergent.sh/',
      description: 'Code generation platform',
      icon: emergentLogo
    },
    {
      name: 'Claude',
      url: 'https://claude.ai/',
      description: 'AI assistant for coding',
      icon: claudeLogo
    },
    {
      name: 'ChatGPT',
      url: 'https://chatgpt.com/',
      description: 'Conversational AI',
      icon: chatgptLogo
    },
    {
      name: 'Cursor',
      url: 'https://cursor.sh/',
      description: 'AI code editor',
      icon: cursorLogo
    },
    {
      name: 'Gemini',
      url: 'https://gemini.google.com/',
      description: 'Google AI assistant',
      icon: geminiLogo
    }
  ];

  const renderAIToolRecommendations = (tools: Array<{name: string, url: string, icon: string, description: string}>) => (
    <AiToolSection tools={tools} />
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'ai-tools':
        return renderAIToolRecommendations(aiTools);

      case 'branding':
        return (
          <div className="space-y-6">
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
            
            {renderAIToolRecommendations([
              aiTools.find(t => t.name === 'Lovable')!,
              aiTools.find(t => t.name === 'Bolt.new')!,
              aiTools.find(t => t.name === 'v0')!,
              aiTools.find(t => t.name === 'Emergent')!,
              aiTools.find(t => t.name === 'Cursor')!
            ])}
            {(idea as any).branding && renderInteractiveContent((idea as any).branding, "Professional Branding Strategy")}
          </div>
        );

      case 'mvp':
        const mvpTutorial = VIDEO_TUTORIALS.mvp;
        return (
          <div className="space-y-6">
            {renderAIToolRecommendations([
              aiTools.find(t => t.name === 'Lovable')!,
              aiTools.find(t => t.name === 'Bolt.new')!,
              aiTools.find(t => t.name === 'v0')!,
              aiTools.find(t => t.name === 'Emergent')!,
              aiTools.find(t => t.name === 'Cursor')!
            ])}
            
            {/* Persistent Video Section */}
            {mvpTutorial.videoId && (
              <PersistentVideoSection
                videoId={mvpTutorial.videoId}
                toolName="mvp"
              />
            )}
            
            {(idea as any).MVP_Building_Prompt && renderInteractiveContent((idea as any).MVP_Building_Prompt, "MVP Development Guide")}
          </div>
        );

      case 'personas':
        const personasTutorial = VIDEO_TUTORIALS.personas;
        return (
          <div className="space-y-6">
            {renderAIToolRecommendations([
              aiTools.find(t => t.name === 'ChatGPT')!,
              aiTools.find(t => t.name === 'Gemini')!,
              aiTools.find(t => t.name === 'Claude')!
            ])}
            
            {/* Persistent Video Section */}
            {personasTutorial.videoId && (
              <PersistentVideoSection
                videoId={personasTutorial.videoId}
                toolName="personas"
              />
            )}
            
            {(idea as any).user_personas && renderInteractiveContent((idea as any).user_personas, "Target User Personas")}
          </div>
        );

      case 'email':
        const emailTutorial = VIDEO_TUTORIALS.email;
        return (
          <div className="space-y-6">
            {renderAIToolRecommendations([
              aiTools.find(t => t.name === 'Claude')!,
              aiTools.find(t => t.name === 'ChatGPT')!,
              aiTools.find(t => t.name === 'Gemini')!
            ])}
            
            {/* Persistent Video Section */}
            {emailTutorial.videoId && (
              <PersistentVideoSection
                videoId={emailTutorial.videoId}
                toolName="email"
              />
            )}
            
            {(idea as any).email_funnel_system && renderInteractiveContent((idea as any).email_funnel_system, "Email Marketing System")}
          </div>
        );

      case 'ads':
        const adsTutorial = VIDEO_TUTORIALS.ads;
        return (
          <div className="space-y-6">
            {renderAIToolRecommendations([
              aiTools.find(t => t.name === 'Gemini')!,
              aiTools.find(t => t.name === 'Claude')!,
              aiTools.find(t => t.name === 'ChatGPT')!
            ])}
            
            {/* Persistent Video Section */}
            {adsTutorial.videoId && (
              <PersistentVideoSection
                videoId={adsTutorial.videoId}
                toolName="ads"
              />
            )}
            
            {(idea as any).ad_creatives && renderInteractiveContent((idea as any).ad_creatives, "Ad Creative Templates")}
          </div>
        );

      default:
        return renderAIToolRecommendations(aiTools);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/idea-report/${idea.id}`)}
              className="flex items-center gap-2 h-9 sm:h-10"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Idea Report</span>
            </Button>
            <div className="text-center">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold">Build This Idea</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Professional Tools & Templates</p>
            </div>
            <div className="w-9 sm:w-0"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            {idea.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional Tools & AI Templates
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'build' | 'legal')} className="w-full">
          <TabsList className="mb-6 h-auto p-1 bg-muted/50">
            <TabsTrigger value="build" className="flex items-center gap-2 px-6 py-3">
              <Wrench className="h-4 w-4" />
              <span className="font-semibold">🛠️ Build Tools</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2 px-6 py-3">
              <Scale className="h-4 w-4" />
              <span className="font-semibold">⚖️ Legal & Setup</span>
            </TabsTrigger>
          </TabsList>

          {/* Build Tools Tab Content */}
          <TabsContent value="build" className="mt-0">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Mobile Navigation - Tabs */}
          <div className="lg:hidden">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-2">Professional Tools</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Click any tool to access optimized templates</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sidebarSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-start gap-2 p-3 rounded-lg border transition-colors text-left min-h-[44px] ${
                    activeSection === section.id
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'hover:bg-muted/50 border-border/50 text-muted-foreground'
                  }`}
                >
                  <section.icon size={18} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-xs truncate">{section.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar - Desktop only */}
          <div className="hidden lg:block lg:w-72 xl:w-80 space-y-2">
            <div className="mb-6">
              <h3 className="text-base lg:text-lg font-semibold mb-2">Professional Tools</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Click any tool to access optimized templates</p>
            </div>
            {sidebarSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                  activeSection === section.id
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'hover:bg-muted/50 border-border/50 text-muted-foreground'
                }`}
              >
                <section.icon size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">{section.label}</div>
                  <div className="text-xs opacity-80">{section.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 lg:col-span-3">
            {renderContent()}
          </div>
            </div>
          </TabsContent>

          {/* Legal & Setup Tab Content */}
          <TabsContent value="legal" className="mt-0">
            <LegalSetupPage
              ideaName={idea?.title || 'this idea'}
              ideaType={(idea as any)?.category}
              recommendedStructure={(idea as any)?.biz_structure}
              structureReasons={
                (idea as any)?.structure_reason
                  ? (typeof (idea as any).structure_reason === 'string'
                      ? (idea as any).structure_reason.split('\n').filter((r: string) => r.trim())
                      : Array.isArray((idea as any).structure_reason)
                        ? (idea as any).structure_reason
                        : [])
                  : undefined
              }
            />
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
};

export default BuildIdeaDynamic;