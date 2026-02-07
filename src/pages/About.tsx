import { Rocket, TrendingUp, Database, Zap, Users, Clock, Shield, Lightbulb, Mail, Phone, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEarlyAccess } from "@/hooks/useEarlyAccess";

export default function About() {
  const { hasAccess } = useEarlyAccess();
  
  const features = [
    {
      icon: TrendingUp,
      title: "Market Trends",
      description: "Current and emerging trends driving the opportunity"
    },
    {
      icon: Shield,
      title: "Feasibility Analysis",
      description: "Realistic assessment of execution complexity"
    },
    {
      icon: Zap,
      title: "Opportunity Assessment",
      description: "Market size, competition, and growth potential"
    },
    {
      icon: Users,
      title: "Community Insights",
      description: "Target audience needs and pain points"
    },
    {
      icon: Clock,
      title: "Timing Analysis",
      description: "Why now is the right time for this idea"
    },
    {
      icon: Database,
      title: "Data-Backed Research",
      description: "Real numbers, not just hunches"
    }
  ];

  const whyChooseUs = [
    {
      icon: Database,
      title: "Data-Driven",
      description: "Every idea is backed by thorough market research and real-world data, not just intuition."
    },
    {
      icon: Zap,
      title: "Actionable",
      description: "We don't just give you ideas—we give you the tools to build them immediately."
    },
    {
      icon: Users,
      title: "Accessible",
      description: "Whether you're a first-time founder or a serial entrepreneur, our platform makes starting easier."
    },
    {
      icon: Clock,
      title: "Time-Saving",
      description: "Skip months of market research. We've done the heavy lifting so you can focus on execution."
    },
    {
      icon: Lightbulb,
      title: "AI-Enhanced",
      description: "Leverage cutting-edge AI tools with pre-configured prompts that work."
    }
  ];

  const targetAudience = [
    "Aspiring Entrepreneurs: Ready to start but unsure what to build",
    "Side Hustlers: Looking for validated ideas that fit your schedule",
    "Solopreneurs: Need quick, actionable business concepts",
    "Innovation Teams: Seeking fresh perspectives and market opportunities",
    "Students & New Grads: Want to launch your first venture with confidence"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            About Startup Base
          </div>
          <h1 className="heading-1 mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Building Tomorrow's Ideas, Today
          </h1>
          <p className="body-text text-xl text-muted-foreground max-w-3xl mx-auto">
            At Startup Base, we believe every entrepreneur deserves access to validated, data-driven startup ideas. We're on a mission to democratize entrepreneurship by providing aspiring founders with the insights, tools, and resources they need to turn ideas into reality.
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 text-center mb-12">What We Do</h2>
          
          {/* Daily Idea Discovery */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="heading-3">Daily Idea Discovery</h3>
            </div>
            <p className="body-text text-muted-foreground mb-8">
              Every day, we deliver a fully researched startup idea directly to you. Each idea comes with comprehensive analysis including:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 hover-lift border-border/50 bg-card/50 backdrop-blur-sm">
                  <feature.icon className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* AI-Powered Building Tools */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="heading-3">AI-Powered Building Tools</h3>
            </div>
            <p className="body-text text-muted-foreground mb-6">
              Ideas are just the beginning. With Startup Base, you can:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Access ready-to-use AI prompts tailored to your idea</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Get direct links to the best AI tools for execution</span>
                  </li>
                </ul>
              </Card>
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Build MVPs, landing pages, and prototypes with one click</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">Move from concept to launch faster than ever before</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Comprehensive Idea Database */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h3 className="heading-3">Comprehensive Idea Database</h3>
            </div>
            <p className="body-text text-muted-foreground mb-6">
              Explore our extensive repository of validated startup ideas. Each idea in our database includes:
            </p>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Full research and analysis reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Build-it-yourself tools and resources</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Step-by-step implementation guides</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Market validation data</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Custom Research */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="w-8 h-8 text-primary" />
              <h3 className="heading-3">Custom Research</h3>
            </div>
            <p className="body-text text-muted-foreground">
              Have your own idea? We'll research it for you. Get the same depth of analysis we provide for our daily ideas, customized for your unique concept.
            </p>
          </Card>
        </div>
      </section>

      {/* Why Startup Base Section */}
      <section className="py-16 px-6 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 text-center mb-12">Why Startup Base?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
              <Card key={index} className="p-6 hover-lift border-border/50 bg-card backdrop-blur-sm">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-lg mb-3">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-2 mb-6">Our Vision</h2>
          <p className="body-text text-lg text-muted-foreground">
            We envision a world where anyone with drive and determination can become a successful entrepreneur—regardless of their background, network, or resources. By removing the barriers of market research, validation, and initial tooling, we're accelerating the journey from idea to execution.
          </p>
        </div>
      </section>

      {/* Who We're For Section */}
      <section className="py-16 px-6 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="heading-2 text-center mb-12">Who We're For</h2>
          <div className="space-y-4">
            {targetAudience.map((audience, index) => (
              <Card key={index} className="p-6 hover-lift border-border/50 bg-card backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-muted-foreground">{audience}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Difference Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="heading-2 text-center mb-12">The Startup Base Difference</h2>
          <p className="body-text text-muted-foreground text-center mb-8">
            Unlike typical idea lists or generic business resources, Startup Base provides:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Daily Fresh Ideas
              </h4>
              <p className="text-sm text-muted-foreground">New opportunities delivered every single day</p>
            </Card>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Deep Research
              </h4>
              <p className="text-sm text-muted-foreground">Not surface-level: we dig into the data</p>
            </Card>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Instant Action
              </h4>
              <p className="text-sm text-muted-foreground">From idea to building in minutes, not months</p>
            </Card>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Comprehensive Database
              </h4>
              <p className="text-sm text-muted-foreground">Access hundreds of validated ideas</p>
            </Card>
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm md:col-span-2">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Custom Research
              </h4>
              <p className="text-sm text-muted-foreground">Your idea, our expertise</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Information Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h3 className="heading-3">Contact Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-lg mb-4">StartupBase™ by Autozen AI</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium mb-1">Phone</p>
                      <a href="tel:+917738267668" className="text-sm text-primary hover:underline">
                        +91 7738267668
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium mb-1">Email</p>
                      <a href="mailto:admin@startupbase.co.in" className="text-sm text-primary hover:underline">
                        admin@startupbase.co.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-2 mb-6">Join the Movement</h2>
          <p className="body-text text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Thousands of entrepreneurs are already discovering, validating, and building their startups with Startup Base. Whether you're looking for your next big idea or ready to validate one you already have, we're here to accelerate your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link to={hasAccess ? "/" : "/waitlist"}>
                {hasAccess ? "Go to Dashboard" : "Join Our Waitlist"}
              </Link>
            </Button>
            {hasAccess && (
              <Button asChild variant="outline" size="lg" className="min-w-[200px]">
                <Link to="/">Explore Ideas</Link>
              </Button>
            )}
          </div>
          <p className="mt-12 text-2xl font-semibold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            Startup Base - Where Ideas Meet Action
          </p>
        </div>
      </section>
    </div>
  );
}
