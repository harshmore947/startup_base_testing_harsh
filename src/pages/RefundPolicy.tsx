import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import {
  XCircle,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  HelpCircle,
  Mail,
  Phone,
  Building,
  FileText,
  Shield
} from 'lucide-react';

export default function RefundPolicy() {
  const { hasAccess } = useEarlyAccess();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />

        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-6">
            <XCircle className="h-4 w-4" />
            Refund & Cancellation Policy
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Refund & Cancellation Policy
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
            At StartupBase™ by Autozen AI, we maintain a strict no-refund policy for all premium subscription purchases. Please read this policy carefully before making a purchase.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-12">

          {/* No Refund Policy - Primary Card */}
          <Card className="border-destructive/40 bg-gradient-to-br from-destructive/5 to-destructive/10 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-4">No Refund Policy</CardTitle>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground leading-relaxed mb-4 font-medium">
                      All premium subscription purchases are <span className="text-destructive font-bold">final and non-refundable</span>. Once you complete payment and gain access to premium features, no refunds will be issued under any circumstances, except as outlined in the "Exceptions" section below.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      By purchasing a premium subscription, you acknowledge and accept this no-refund policy.
                    </p>
                  </CardContent>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Understanding Before Purchase */}
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Before You Purchase</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Please ensure you understand the following before purchasing:</p>
              <div className="space-y-3">
                {[
                  'Review all premium features and benefits on our Pricing page',
                  'Understand that the Premium Annual Plan costs ₹2,999/year',
                  'Premium access is valid for exactly 1 year (365 days) from purchase date',
                  'No refunds will be issued if you change your mind or stop using the service',
                  'Make sure you have created an account and tested the free features first',
                  'Verify that you are purchasing the correct subscription plan',
                  'Ensure your payment information is correct to avoid failed transactions'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Premium Subscription Details */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Premium Subscription Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">What You Get</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-lg bg-secondary/10">
                    <p className="font-semibold mb-1">Premium Annual Plan</p>
                    <p className="text-2xl font-bold text-primary mb-2">₹2,999/year</p>
                    <p className="text-sm text-muted-foreground">One-time payment for 365 days of access</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      'Full Archive Access to all startup ideas',
                      'Build This Idea Tools',
                      'All Detailed Reports & Research',
                      'AI-powered Building Assistant'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
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
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Access Duration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Immediate Activation</p>
                      <p className="text-sm text-muted-foreground">Premium features unlock instantly after successful payment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">1 Year Access</p>
                      <p className="text-sm text-muted-foreground">Full premium access for 365 days from purchase date</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Access Until Expiry</p>
                      <p className="text-sm text-muted-foreground">You can use all features until your subscription end date</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">No Prorated Refunds</p>
                      <p className="text-sm text-muted-foreground">Unused time cannot be refunded if you stop using the service</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cancellation Policy */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <XCircle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Cancellation Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You may cancel your subscription at any time, but please note:
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    How to Cancel
                  </h4>
                  <p className="text-sm text-muted-foreground ml-7">
                    Contact us at admin@startupbase.co.in or call +91 7738267668 to cancel your subscription.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Access Until End Date
                  </h4>
                  <p className="text-sm text-muted-foreground ml-7">
                    If you cancel, you will retain access to premium features until your subscription end date. Your access will not be terminated early.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    No Refunds Upon Cancellation
                  </h4>
                  <p className="text-sm text-muted-foreground ml-7">
                    Cancelling your subscription does not entitle you to a refund for any unused portion of your subscription period. The full ₹2,999 payment is non-refundable.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    No Auto-Renewal
                  </h4>
                  <p className="text-sm text-muted-foreground ml-7">
                    Our subscriptions do not auto-renew. After your 1-year subscription expires, you will need to manually purchase a new subscription if you wish to continue using premium features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exceptions */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Exceptions to No-Refund Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Refunds may be considered only in the following exceptional circumstances:
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-background border border-primary/20">
                  <h4 className="font-semibold mb-2">1. Fraudulent Charges</h4>
                  <p className="text-sm text-muted-foreground">
                    If you did not authorize the payment and can provide proof that the charge was fraudulent, we will investigate and issue a refund if the claim is verified.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-primary/20">
                  <h4 className="font-semibold mb-2">2. Duplicate Charges</h4>
                  <p className="text-sm text-muted-foreground">
                    If you were accidentally charged twice for the same subscription, we will refund the duplicate charge immediately after verification.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-primary/20">
                  <h4 className="font-semibold mb-2">3. Technical Failure on Our End</h4>
                  <p className="text-sm text-muted-foreground">
                    If payment was successful but premium features were not activated due to a technical error on our platform, and we are unable to resolve the issue within 7 business days, you may request a refund.
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-secondary/10">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Important:</span> Refund requests must be submitted within 7 days of the original transaction with supporting documentation. All refund decisions are at our sole discretion.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Issues */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Payment Problems</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">If you experience payment issues:</p>
                <div className="space-y-2">
                  {[
                    'Failed payment: No charge, try again',
                    'Pending payment: Wait 24 hours for processing',
                    'Money debited but no access: Contact us immediately',
                    'Payment gateway errors: Contact CCAvenue support'
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
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Refund Process</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">If eligible for a refund:</p>
                <div className="space-y-2">
                  {[
                    'Contact us with transaction details',
                    'Provide supporting documentation',
                    'Allow 5-7 business days for review',
                    'Approved refunds processed within 7-10 business days',
                    'Refunds issued to original payment method'
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

          {/* Contact for Support */}
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
                For payment issues, refund requests, or questions about this policy:
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
              <div className="mt-6 p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Support Hours:</span> We aim to respond to all inquiries within 24-48 hours during business days.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Changes to This Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to modify this Refund & Cancellation Policy at any time. Changes will be effective immediately upon posting on this page. We will update the "Last Updated" date accordingly. Your continued use of our services after any changes constitutes acceptance of the new policy.
              </p>
            </CardContent>
          </Card>

          {/* Final Notice */}
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Important Notice</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                By purchasing a premium subscription, you explicitly acknowledge and agree to this no-refund policy. Please ensure you fully understand the terms before completing your purchase.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Questions Before Purchasing?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact our support team if you have any questions about our premium features or this refund policy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Contact Support
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" className="text-lg px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
