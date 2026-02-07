import { Mail, Phone, Globe, MessageSquare, Users, FileText, Wrench, Lightbulb, Newspaper, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEarlyAccess } from "@/hooks/useEarlyAccess";

export default function Contact() {
  const { hasAccess } = useEarlyAccess();
  
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "admin@startupbase.co.in",
      subtext: "We typically respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+91 7738267668",
      subtext: "Monday to Friday, 10 AM to 6 PM IST"
    },
    {
      icon: Globe,
      title: "Website",
      content: "startupbase.co.in",
      subtext: "Based in India, Serving Entrepreneurs Worldwide"
    }
  ];

  const helpCategories = [
    {
      icon: MessageSquare,
      title: "General Inquiries",
      description: "Questions about StartupBase, our services, or how to get started? Drop us an email at admin@startupbase.co.in and we'll get back to you promptly."
    },
    {
      icon: Users,
      title: "Early Access",
      description: "Already have an early access code? Enter it on our homepage to unlock the full platform. Need a code? Reach out and tell us why you'd be a great beta tester."
    },
    {
      icon: Users,
      title: "Partnership Opportunities",
      description: "Interested in collaborating with Startup Base? We're always open to partnerships that benefit the entrepreneurial community."
    },
    {
      icon: Newspaper,
      title: "Media & Press",
      description: "For press inquiries, interviews, or media kits, please contact us at admin@startupbase.co.in with \"MEDIA\" in the subject line."
    },
    {
      icon: MessageSquare,
      title: "Feedback & Suggestions",
      description: "Your input helps us improve. Share your thoughts, ideas, or feedback about our platform. We are always listening."
    },
    {
      icon: Wrench,
      title: "Technical Support",
      description: "Experiencing issues with the website or have questions about using our features? We're here to help troubleshoot."
    },
    {
      icon: Lightbulb,
      title: "Custom Research Requests",
      description: "Want us to research your specific startup idea? Get in touch to learn more about our custom research services."
    }
  ];

  const faqs = [
    {
      question: "When will Startup Base launch?",
      answer: "We're in beta and launching soon! Join our waitlist to be notified the moment we go live."
    },
    {
      question: "How much does it cost?",
      answer: "Our daily idea is completely free. Access to the full database, build tools, and custom research requires a paid subscription. Pricing details will be announced at launch."
    },
    {
      question: "Can I contribute ideas?",
      answer: "We love community input! While we do not accept direct idea submissions, we welcome suggestions for industries or problems to research."
    },
    {
      question: "Do you offer refunds?",
      answer: "All premium subscriptions are non-refundable. Refunds may only be considered in exceptional circumstances such as fraudulent charges, duplicate payments, or technical failures on our end. Please read our Refund Policy for complete details."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We take privacy seriously and use industry-standard security measures. Read our Privacy Policy for details."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Mail className="w-4 h-4" />
            Contact Us
          </div>
          <h1 className="heading-1 mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="body-text text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions, feedback, or just want to say hello? We'd love to hear from you. Whether you're curious about our platform, need support, or have a suggestion, our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 text-center mb-12">Contact Information</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="p-8 text-center hover-lift border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                <p className="text-foreground font-medium mb-2">{info.content}</p>
                <p className="text-sm text-muted-foreground">{info.subtext}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Can We Help You With Section */}
      <section className="py-16 px-6 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 text-center mb-4">What Can We Help You With?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose a category below to learn more about how we can assist you
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="p-6 hover-lift border-border/50 bg-card backdrop-blur-sm">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-lg mb-3">{category.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Find quick answers to common questions</p>
          </div>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                  <AccordionTrigger className="px-6 hover:no-underline hover:text-primary">
                    <span className="text-left font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>

      {/* Stay Connected / CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-2 mb-6">Stay Connected</h2>
          <p className="body-text text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            {hasAccess 
              ? "Explore our platform and discover validated startup ideas backed by data and research."
              : "Join our waitlist to stay updated on our launch, receive exclusive early access opportunities, and get notified when new features go live."
            }
          </p>
          <Button asChild size="lg" className="min-w-[200px]">
            <Link to={hasAccess ? "/" : "/waitlist"}>
              {hasAccess ? "Go to Dashboard" : "Join Our Waitlist"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer Message */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground italic mb-4">
            We are excited to hear from you and help you on your entrepreneurial journey!
          </p>
          <p className="font-semibold text-lg text-foreground">
            StartupBase™ by Autozen AI
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            admin@startupbase.co.in | +91 7738267668
          </p>
        </div>
      </section>
    </div>
  );
}
