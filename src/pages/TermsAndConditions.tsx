import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import {
  FileText,
  User,
  CreditCard,
  Shield,
  AlertTriangle,
  CheckCircle,
  Ban,
  Scale,
  XCircle,
  Mail,
  Phone,
  Building
} from 'lucide-react';

export default function TermsAndConditions() {
  const { hasAccess } = useEarlyAccess();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />

        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <FileText className="h-4 w-4" />
            Terms & Conditions
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Effective Date:</span>
              <span>27th November 2025</span>
            </div>
            <div className="hidden sm:block">•</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Last Updated:</span>
              <span>27th November 2025</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to StartupBase™ by Autozen AI. By accessing or using startupbase.co.in (the "Website"), you agree to be bound by these Terms and Conditions. Please read them carefully.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-12">

          {/* Acceptance of Terms */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-4">Acceptance of Terms</CardTitle>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      By accessing or using our Website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      If you do not agree to these terms, please do not use our Website.
                    </p>
                  </CardContent>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* User Accounts */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">User Accounts & Responsibilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">When you create an account with us, you agree to:</p>
              <div className="space-y-3">
                {[
                  'Provide accurate, current, and complete information',
                  'Maintain the security of your account credentials',
                  'Notify us immediately of any unauthorized use of your account',
                  'Be responsible for all activities that occur under your account',
                  'Not share your account with others or allow others to access it',
                  'Ensure you are at least 18 years old or have parental consent'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Premium Subscription */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Premium Subscription Terms</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Subscription Plan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-lg bg-secondary/10">
                    <p className="font-semibold mb-1">Premium Annual Plan</p>
                    <p className="text-2xl font-bold text-primary mb-2">₹2,999/year</p>
                    <p className="text-sm text-muted-foreground">Access to premium features for 1 year from date of purchase</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">Full Archive Access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">Build This Idea Tools</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">All Detailed Reports</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">AI-powered Building Assistant</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Subscription Access</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Immediate Access</p>
                      <p className="text-sm text-muted-foreground">Premium features activated upon successful payment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">1 Year Duration</p>
                      <p className="text-sm text-muted-foreground">Access valid for 365 days from purchase date</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Non-Renewable</p>
                      <p className="text-sm text-muted-foreground">Subscription must be manually renewed after expiry</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">No Refunds</p>
                      <p className="text-sm text-muted-foreground">All premium purchases are non-refundable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment Terms */}
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Payment Terms</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">All payments are processed through CCAvenue, a secure payment gateway:</p>
              <div className="space-y-3">
                {[
                  'All prices are in Indian Rupees (INR) and include applicable taxes',
                  'Payment must be completed in full before accessing premium features',
                  'We accept credit cards, debit cards, net banking, UPI, and wallets',
                  'Payment information is processed securely by CCAvenue - we do not store card details',
                  'Promotional discounts may be available and are subject to terms and expiration',
                  'All sales are final - no refunds will be issued (see Refund Policy)',
                  'Failed or declined transactions will not grant access to premium features'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Intellectual Property Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                All content, features, and functionality on this Website are owned by StartupBase™ by Autozen AI and are protected by intellectual property laws.
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/10">
                  <h4 className="font-semibold mb-2">What You Can Do</h4>
                  <p className="text-sm text-muted-foreground">Use the Website for personal, non-commercial purposes in accordance with these terms</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10">
                  <h4 className="font-semibold mb-2">What You Cannot Do</h4>
                  <div className="space-y-2 mt-2">
                    {[
                      'Reproduce, distribute, or create derivative works without permission',
                      'Use automated systems (bots, scrapers) to access the Website',
                      'Remove or modify copyright notices or trademarks',
                      'Reverse engineer or attempt to extract source code'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Ban className="h-4 w-4 text-destructive shrink-0 mt-1" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User-Generated Content */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">User-Generated Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you submit, post, or share any content on our Website (such as feedback, ideas, or research), you grant us:
              </p>
              <div className="space-y-3">
                {[
                  'A non-exclusive, worldwide, royalty-free license to use, modify, and display your content',
                  'The right to use your feedback to improve our services',
                  'No obligation to compensate you for submitted content'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-4">
                You represent that you have the right to share any content you submit and that it does not violate any third-party rights.
              </p>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Prohibited Uses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">You agree not to use the Website to:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Violate any laws or regulations',
                  'Infringe on intellectual property rights',
                  'Transmit harmful code (viruses, malware)',
                  'Harass, abuse, or harm others',
                  'Impersonate any person or entity',
                  'Collect user data without consent',
                  'Interfere with Website functionality',
                  'Engage in fraudulent activities',
                  'Share or resell premium content',
                  'Use for competitive purposes'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Ban className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Limitation of Liability</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The Website and all content are provided "as is" without warranties of any kind. To the fullest extent permitted by law:
              </p>
              <div className="space-y-3">
                {[
                  'We make no guarantees about the accuracy, completeness, or reliability of startup ideas or research',
                  'We are not liable for any business decisions made based on information from the Website',
                  'We are not responsible for any direct, indirect, incidental, or consequential damages',
                  'Our total liability shall not exceed the amount you paid for premium services (if any)',
                  'We do not warrant uninterrupted or error-free service',
                  'Business ideas are for educational and inspirational purposes only'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <XCircle className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Termination by Us</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">We reserve the right to:</p>
                <div className="space-y-2">
                  {[
                    'Suspend or terminate your account at any time',
                    'Remove content that violates these terms',
                    'Block access for prohibited activities',
                    'Modify or discontinue services without notice'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Termination by You</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">You may terminate your account by:</p>
                <div className="space-y-2">
                  {[
                    'Contacting us at admin@startupbase.co.in',
                    'Requesting account deletion',
                    'Ceasing to use the Website'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3 font-medium">
                  Note: Termination does not entitle you to a refund for any premium subscriptions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Governing Law */}
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Governing Law</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                These Terms and Conditions are governed by the laws of India. Any disputes arising from these terms or your use of the Website shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
              <div className="p-4 rounded-lg bg-primary/5 mt-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Dispute Resolution:</span> We encourage you to contact us first to resolve any issues before pursuing legal action.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Changes to These Terms</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                We reserve the right to modify these Terms and Conditions at any time. When we do:
              </p>
              <div className="space-y-3">
                {[
                  'We will update the "Last Updated" date at the top of this page',
                  'We will notify users of material changes via email or Website notice',
                  'Continued use of the Website after changes constitutes acceptance of the new terms',
                  'If you do not agree to the updated terms, you must stop using the Website'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Contact Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-3 text-lg">StartupBase™ by Autozen AI</p>
                  <div className="space-y-3">
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgment */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Acknowledgment</h3>
              <p className="text-muted-foreground">
                By using StartupBase™, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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
            Join StartupBase today and discover curated startup ideas with powerful research tools.
          </p>
          <Link to={hasAccess ? "/" : "/pricing"}>
            <Button size="lg" className="text-lg px-8">
              {hasAccess ? "Go to Dashboard" : "View Pricing"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
