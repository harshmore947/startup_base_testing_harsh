import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Building2, Palette, Users, Mail, Target, Zap, Lightbulb, Copy, CheckCircle, ExternalLink, Sparkles, User, Crown, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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

export default function AdminViewUserBuild() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('ai-tools');
  
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['admin-user-build-view', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: report } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!report) return null;

      const { data: user } = await supabase
        .from('users')
        .select('email, subscription_status, created_at')
        .eq('id', report.user_id)
        .single();

      return { ...report, user };
    },
    enabled: !!id,
  });

  const copyToClipboard = (content: string, section: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
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

  if (!reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Report Not Found</h1>
          <Button asChild>
            <Link to="/admin/user-reports">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const sidebarSections = [
    { id: 'ai-tools', label: 'Build with AI', icon: Zap, description: 'AI-powered builders' },
    { id: 'branding', label: 'Complete Branding', icon: Sparkles, description: 'Professional branding guide' },
    { id: 'mvp', label: 'Landing Page Builder', icon: Building2, description: 'Development guide' },
    { id: 'personas', label: 'User Personas', icon: Users, description: 'Target audience profiles' },
    { id: 'email', label: 'Email System', icon: Mail, description: 'Email marketing funnel' },
    { id: 'ads', label: 'Ad Creatives', icon: Target, description: 'Advertising content' }
  ];

  const aiTools = [
    { name: 'Bolt.new', url: 'https://bolt.new/', description: 'No-code web development', logo: boltLogo },
    { name: 'Lovable', url: 'https://lovable.dev/', description: 'No-code web development', logo: lovableLogo },
    { name: 'v0', url: 'https://v0.dev/', description: 'Frontend Expert', logo: v0Logo },
    { name: 'Emergent', url: 'https://emergent.ai/', description: 'Mobile and Web Apps Creator', logo: emergentLogo },
    { name: 'Claude', url: 'https://claude.ai/', description: 'AI assistant for branding, coding, prompt generation', logo: claudeLogo },
    { name: 'ChatGPT', url: 'https://chat.openai.com/', description: 'Conversational AI', logo: chatgptLogo },
    { name: 'Cursor', url: 'https://cursor.sh/', description: 'AI-powered code editor', logo: cursorLogo },
    { name: 'Gemini', url: 'https://gemini.google.com/', description: 'Google AI assistant', logo: geminiLogo }
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
          </div>
        );

      case 'branding':
        return reportData.brand_package_generator_prompt ? (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Complete Branding</h2>
                <p className="text-muted-foreground">Professional branding strategy and guidelines</p>
              </div>
            </div>
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Branding Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="group p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="text-foreground leading-relaxed flex-1 whitespace-pre-wrap">{reportData.brand_package_generator_prompt}</div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(reportData.brand_package_generator_prompt || '', 'branding')}
                    >
                      {copiedSection === 'branding' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : <div className="text-center py-12"><p className="text-muted-foreground">Branding not available for this report.</p></div>;

      case 'mvp':
        return reportData.mvp_builder_prompt ? (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">MVP Development Guide</h2>
                <p className="text-muted-foreground">Complete development roadmap and instructions</p>
              </div>
            </div>
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Development Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="group p-6 bg-gradient-to-r from-accent/15 to-accent/5 rounded-xl border border-border/50">
                  <div className="flex items-start justify-between">
                    <pre className="text-foreground leading-relaxed flex-1 whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">{reportData.mvp_builder_prompt}</pre>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(reportData.mvp_builder_prompt || '', 'mvp')}
                    >
                      {copiedSection === 'mvp' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : <div className="text-center py-12"><p className="text-muted-foreground">MVP not available for this report.</p></div>;

      default:
        return <div className="text-center py-12"><p className="text-muted-foreground">Section not available.</p></div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              asChild
            >
              <Link to="/admin/user-reports">
                <ChevronLeft size={16} />
                Back to Reports
              </Link>
            </Button>
            <div className="text-center">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Admin View - Build Plan</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Professional development tools</p>
            </div>
            <Button 
              asChild
              variant="outline"
            >
              <Link to={`/admin/user-report/${id}`}>
                View Report
              </Link>
            </Button>
          </div>

          {/* User Info */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">User Email</p>
                    <p className="font-medium">{reportData.user?.email || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Subscription</p>
                    <Badge variant={reportData.user?.subscription_status === 'premium' ? 'default' : 'secondary'}>
                      {reportData.user?.subscription_status || 'free'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium">{format(new Date(reportData.created_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{reportData.idea_title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to bring this idea to life
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <Card className="p-4 sm:p-6 bg-primary/5 lg:sticky lg:top-24">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-primary">PROFESSIONAL TOOLS</h3>
              <div className="space-y-2">
                {sidebarSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <div
                      key={section.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
      </div>
    </div>
  );
}
