import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import AccessCodeModal from '@/components/AccessCodeModal';
import { WaitlistHeader } from '@/components/WaitlistHeader';

const waitlistSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .toLowerCase()
    .trim(),
  phone_number: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number too long')
    .regex(/^[+\d\s()-]+$/, 'Invalid phone number format')
    .trim()
});

const WaitlistPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    try {
      waitlistSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([formData]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "You're already on the list!",
            description: "We'll notify you when we launch.",
          });
          setIsSuccess(true);
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "Success!",
          description: "You've been added to the waitlist.",
        });
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <WaitlistHeader />
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center fade-in-up">
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-border">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
              <p className="text-lg text-muted-foreground">
                You're on the list. We'll notify you when we launch.
              </p>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <WaitlistHeader />
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="max-w-4xl w-full fade-in-up">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
              Startup Base
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-4 sm:mb-6 px-4">
              Building Tomorrow's Ideas, Today
            </p>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto px-4">
              Get a fully researched startup idea every day. Discover trends, feasibility, and opportunities - then build it with AI-powered tools.
            </p>
          </div>

          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl border border-border max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Join the Waitlist</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={`h-11 ${errors.name ? 'border-destructive' : ''}`}
                  required
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`h-11 ${errors.email ? 'border-destructive' : ''}`}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+91 99999 99999"
                  className={`h-11 ${errors.phone_number ? 'border-destructive' : ''}`}
                  required
                />
                {errors.phone_number && (
                  <p className="text-sm text-destructive mt-1">{errors.phone_number}</p>
                )}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAccessModal(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Have an early access code?
              </button>
            </div>
          </div>
        </div>
      </div>

      <AccessCodeModal 
        isOpen={showAccessModal} 
        onClose={() => setShowAccessModal(false)} 
      />
    </>
  );
};

export default WaitlistPage;
