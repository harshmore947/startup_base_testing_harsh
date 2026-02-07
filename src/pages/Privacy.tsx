import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import {
  Shield,
  User,
  Database,
  Lock,
  Users,
  CheckCircle,
  Cookie,
  ExternalLink,
  Clock,
  Globe,
  Bell,
  Mail,
  Phone,
  Scale,
  FileText
} from 'lucide-react';

export default function Privacy() {
  const { hasAccess } = useEarlyAccess();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Privacy Policy
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Effective Date:</span>
              <span>5th October 2025</span>
            </div>
            <div className="hidden sm:block">•</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Last Updated:</span>
              <span>27th November 2025</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            StartupBase™ by Autozen AI ("we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit startupbase.co.in (the "Website").
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          {/* Introduction */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-4">Introduction</CardTitle>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground leading-relaxed">
                      By using our Website, you agree to the collection and use of information in accordance with this policy. We are committed to protecting your personal information and your right to privacy.
                    </p>
                  </CardContent>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Information We Collect */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Information We Collect</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Information You Provide</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">To personalize your experience</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">To communicate updates and provide access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">For important notifications and verification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Automatically Collected</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Usage Data</p>
                      <p className="text-sm text-muted-foreground">IP address, browser type, pages visited, time spent, referring URLs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Cookies</p>
                      <p className="text-sm text-muted-foreground">To enhance user experience and analyze traffic</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How We Use Your Information */}
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">How We Use Your Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">We use collected information to:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Maintain and provide waitlist services',
                  'Notify you about our launch and updates',
                  'Verify early access eligibility',
                  'Improve our Website and services',
                  'Respond to your inquiries and support requests',
                  'Send marketing communications (opt-out available)',
                  'Analyze usage patterns and optimize user experience'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Storage and Security */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Data Storage and Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Your data is stored securely on protected servers with industry-standard encryption',
                'We implement appropriate technical and organizational measures to protect against unauthorized access, alteration, or destruction',
                'Access to personal data is restricted to authorized personnel only',
                'We retain your information only as long as necessary to fulfill the purposes outlined in this policy'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Information Sharing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 font-medium">
                We do not sell, trade, or rent your personal information. We may share information only in the following circumstances:
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/10">
                  <h4 className="font-semibold mb-2">Service Providers</h4>
                  <p className="text-sm text-muted-foreground">With trusted third parties who assist in operating our Website (e.g., hosting and email service providers)</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10">
                  <h4 className="font-semibold mb-2">Legal Requirements</h4>
                  <p className="text-sm text-muted-foreground">When required by law or to protect our rights, safety, or property</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10">
                  <h4 className="font-semibold mb-2">Business Transfers</h4>
                  <p className="text-sm text-muted-foreground">In connection with a merger, acquisition, or sale of assets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Your Rights</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: CheckCircle, text: 'Access the personal information we hold about you' },
                { icon: CheckCircle, text: 'Request correction of inaccurate information' },
                { icon: CheckCircle, text: 'Request deletion of your information' },
                { icon: CheckCircle, text: 'Opt out of marketing communications' },
                { icon: CheckCircle, text: 'Withdraw consent at any time' }
              ].map((right, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <right.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{right.text}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-muted-foreground">
              To exercise these rights, contact us at <a href="mailto:admin@startupbase.co.in" className="text-primary hover:underline font-medium">admin@startupbase.co.in</a>
            </p>
          </div>

          {/* Cookies */}
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Cookies</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">We use cookies to:</p>
              <div className="space-y-3">
                {[
                  'Remember your preferences and session',
                  'Analyze Website traffic',
                  'Improve user experience'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-4">
                You can disable cookies in your browser settings, but this may limit functionality.
              </p>
            </CardContent>
          </Card>

          {/* Additional Sections Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Third-Party Links */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ExternalLink className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Third-Party Links</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our Website may contain links to third-party sites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
                </p>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Data Retention</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <span className="text-sm text-muted-foreground">Waitlist data is retained until service launch or until you request deletion</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <span className="text-sm text-muted-foreground">Early access session data is retained during your active use</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <span className="text-sm text-muted-foreground">We may retain certain information for legal compliance or legitimate business purposes</span>
                </div>
              </CardContent>
            </Card>

            {/* International Users */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">International Users</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in India or other countries where our service providers operate. By using our Website, you consent to such transfers.
                </p>
              </CardContent>
            </Card>

            {/* Changes to This Policy */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Changes to This Policy</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">We may update this Privacy Policy from time to time. We will notify you of material changes by:</p>
                <div className="space-y-2">
                  {[
                    'Posting the new policy on this page',
                    'Updating the "Last Updated" date',
                    'Sending an email notification (for significant changes)'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Contact Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                If you have questions about this Privacy Policy or our data practices, contact us at:
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-3 text-lg">StartupBase™ by Autozen AI</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <a href="tel:+917738267668" className="text-primary hover:underline font-medium">
                    +91 7738267668
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href="mailto:admin@startupbase.co.in" className="text-primary hover:underline font-medium">
                    admin@startupbase.co.in
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <a href="https://startupbase.co.in" className="text-primary hover:underline font-medium">
                    startupbase.co.in
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Compliance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This policy complies with applicable Indian data protection laws including the <span className="font-medium">Information Technology Act, 2000</span> and the <span className="font-medium">Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</span>.
              </p>
            </CardContent>
          </Card>

          {/* Acknowledgment */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Acknowledgment</h3>
              <p className="text-muted-foreground">
                By using StartupBase™, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our waitlist today and be among the first to experience StartupBase when we launch.
          </p>
          <Link to={hasAccess ? "/waitlist" : "/waitlist"}>
            <Button size="lg" className="text-lg px-8">
              {hasAccess ? "Go to Dashboard" : "Join Waitlist"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
