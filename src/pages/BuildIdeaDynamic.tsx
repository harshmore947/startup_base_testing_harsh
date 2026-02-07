import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useIdeaById } from "@/hooks/useIdeaById";
import { 
  ArrowLeft, 
  Crown, 
  Palette, 
  Globe, 
  Users, 
  Calendar, 
  Mail, 
  Target,
  Zap,
  Building2,
  Lightbulb,
  Copy,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Play
} from "lucide-react";

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

const renderInteractiveContent = (data: any, title: string) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="group p-3 sm:p-5 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover-lift"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {typeof item === 'object' ? (
                  <div className="space-y-2 sm:space-y-3">
                    {Object.entries(item).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-primary capitalize mb-1">{key.replace(/[_-]/g, ' ')}</span>
                        <span className="text-sm sm:text-base text-foreground leading-relaxed break-words">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-foreground leading-relaxed break-words">{String(item)}</p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 sm:h-6 sm:w-6 flex-shrink-0"
                onClick={() => navigator.clipboard.writeText(typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item))}
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (typeof data === 'object') {
    return (
      <div className="grid gap-3 sm:gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div 
            key={key}
            className="group p-3 sm:p-5 bg-gradient-to-r from-secondary/60 to-secondary/30 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover-lift"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-primary capitalize mb-2 sm:mb-3 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="break-words">{key.replace(/[_-]/g, ' ')}</span>
                </h4>
                {typeof value === 'object' ? (
                  <div className="space-y-2">
                    {Object.entries(value as any).map(([subKey, subValue]) => (
                      <div key={subKey} className="p-2 sm:p-3 bg-background/80 rounded-lg border border-border/30">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground break-words">{subKey}: </span>
                        <span className="text-xs sm:text-sm text-foreground break-words">{String(subValue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-foreground leading-relaxed break-words">{String(value)}</p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 sm:h-6 sm:w-6 flex-shrink-0"
                onClick={() => navigator.clipboard.writeText(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value))}
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className="group p-3 sm:p-5 bg-gradient-to-r from-accent/15 to-accent/5 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover-lift">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm sm:text-base text-foreground leading-relaxed flex-1 break-words whitespace-pre-wrap">{String(data)}</p>
          <Button 
            variant="ghost" 
            size="sm"
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 sm:h-6 sm:w-6 flex-shrink-0"
            onClick={() => navigator.clipboard.writeText(String(data))}
          >
            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    );
  }
};

// AI Tool Section Component
const AiToolSection = ({ title, tools }: { title: string; tools: Array<{ name: string; logo: string; url: string }> }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
    <div className="text-sm font-medium text-muted-foreground">
      {title}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {tools.map((tool, index) => (
        <a
          key={index}
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors group"
        >
          <img src={tool.logo} alt={tool.name} className="w-4 h-4" />
          <span className="text-sm font-medium group-hover:text-primary transition-colors">{tool.name}</span>
          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  </div>
);

export default function BuildIdeaDynamic() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Fetch the specific idea
  const { data: idea, isLoading } = useIdeaById(id);

  // Copy function
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

  if (!idea) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Idea Not Found</h1>
          <p className="text-muted-foreground mb-6">The idea you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/archive')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ideas
          </Button>
        </div>
      </div>
    );
  }

  const executionPlan = parseJsonContent(idea.execution_plan);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/idea-report/${id}`)}
              className="flex items-center gap-2 h-9 sm:h-10"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Idea</span>
            </Button>
            <div className="text-center">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Build This Idea</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Complete execution roadmap</p>
            </div>
            <div className="w-9 sm:w-20"></div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title */}
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{idea.title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to bring this idea to life
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {/* Execution Plan Section */}
          {executionPlan && (
            <section>
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 sm:gap-3">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Execution Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderInteractiveContent(executionPlan, "Execution Plan")}
                </CardContent>
              </Card>
            </section>
          )}

          {/* Revenue Model Section */}
          {idea.revenue_model && (
            <section>
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 sm:gap-3">
                    <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Revenue Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderInteractiveContent(idea.revenue_model, "Revenue Model")}
                </CardContent>
              </Card>
            </section>
          )}

          {/* User Personas Section */}
          {idea.user_personas && (
            <section>
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 sm:gap-3">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    User Personas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderInteractiveContent(idea.user_personas, "User Personas")}
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}