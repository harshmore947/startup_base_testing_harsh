import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Target, Palette, Globe, Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import claudeLogo from "@/assets/claude-logo.png";
import cursorLogo from "@/assets/cursor-logo.png";
import lovableLogo from "@/assets/lovable-logo.png";
import chatgptLogo from "@/assets/chatgpt-logo.png";
import v0Logo from "@/assets/v0-logo.png";
import boltLogo from "@/assets/bolt-logo.png";

interface BuildQuickLink {
  title: string;
  description: string;
  icon: React.ElementType;
  section: string;
}

interface BuildQuickLinksProps {
  buildPath?: string;
}

const buildLinks: BuildQuickLink[] = [
  {
    title: "Ad Creatives",
    description: "High-converting ad copy and creative concepts",
    icon: Target,
    section: "ads"
  },
  {
    title: "Brand Package",
    description: "Complete brand identity with logo, colors, and voice",
    icon: Palette,
    section: "branding"
  },
  {
    title: "Landing Page",
    description: "Copy + wireframe blocks",
    icon: Globe,
    section: "mvp"
  },
  {
    title: "More prompts...",
    description: "View all available prompts",
    icon: Sparkles,
    section: ""
  }
];

const aiTools = [
  { name: "Claude", logo: claudeLogo },
  { name: "v0", logo: v0Logo },
  { name: "Bolt", logo: boltLogo },
  { name: "ChatGPT", logo: chatgptLogo },
  { name: "Cursor", logo: cursorLogo },
  { name: "Lovable", logo: lovableLogo }
];

export const BuildQuickLinks = ({ buildPath = '/build-this-idea' }: BuildQuickLinksProps) => {
  const navigate = useNavigate();

  const handleLinkClick = (section: string) => {
    if (section) {
      navigate(`${buildPath}?section=${section}`);
    } else {
      navigate(buildPath);
    }
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">Start Building in 1-click</CardTitle>
            <CardDescription className="mt-1">
              Turn this idea into your business with pre-built prompts
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Quick Links */}
        <div className="space-y-2">
          {buildLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                onClick={() => handleLinkClick(link.section)}
                className="w-full group p-4 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/40 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm text-foreground">
                      {link.title}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {link.description}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* AI Tools Section */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Works with:</p>
          <div className="flex flex-wrap gap-2 items-center">
            {aiTools.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/30"
                title={tool.name}
              >
                <img 
                  src={tool.logo} 
                  alt={tool.name} 
                  className="w-4 h-4 rounded object-contain"
                />
                <span className="text-xs text-muted-foreground">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
