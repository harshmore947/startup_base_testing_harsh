import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Menu, ArrowLeft } from 'lucide-react';
import startupBaseLogo from '@/assets/startup-base-logo.png';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';

export function Header() {
  const { user, signOut, isPremium } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hasAccess } = useEarlyAccess();
  
  // Check if we're on About or Contact page
  const isPublicPage = location.pathname === '/about' || location.pathname === '/contact';

  // Get user role from secure user_roles table
  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const isAdmin = userRole?.role === 'admin';

  // If on public page without early access, show minimal header
  if (isPublicPage && !hasAccess) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                to="/waitlist" 
                className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <Link to="/waitlist" className="flex items-center gap-2 sm:gap-3">
                <img src={startupBaseLogo} alt="Startup Base" className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20" />
                <span className="text-base sm:text-lg font-bold text-gray-900">Startup Base</span>
              </Link>
            </div>
            
            <nav className="flex items-center gap-6">
              <Link 
                to="/about" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  const navLinks = [
    { label: 'About', path: '/about' },
    { label: 'Idea of the Day', path: '/' },
    { label: 'Idea Database', path: '/archive' },
    { label: 'Research Your Idea', path: '/research-my-idea' },
    { label: 'Pricing', path: '/pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16">
        <div className="flex items-center justify-between h-full">
          {/* LEFT SECTION - Brand */}
          <Link to={hasAccess ? "/" : "/waitlist"} className="flex items-center gap-2 sm:gap-3">
            <img src={startupBaseLogo} alt="Startup Base" className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20" />
            <span className="text-base sm:text-lg font-bold text-gray-900">Startup Base</span>
          </Link>

          {/* CENTER SECTION - Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors py-1 relative ${
                  location.pathname === link.path
                    ? 'text-blue-600 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT SECTION - Actions */}
          <div className="flex items-center gap-4">
            {/* Admin Dashboard Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:block text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Admin Dashboard
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-white">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-base font-medium transition-colors py-3 px-4 rounded-lg ${
                        location.pathname === link.path
                          ? 'text-blue-600 font-semibold bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-200" />
                      <Link
                        to="/admin"
                        className="text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    </>
                  )}

                  <div className="pt-6 border-t border-gray-200 flex flex-col gap-3">
                    {!user ? (
                      <>
                        <Button
                          asChild
                          className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800"
                        >
                          <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          asChild
                          className="w-full h-12"
                        >
                          <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>
                            Log In
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        {!isPremium && (
                          <Button
                            asChild
                            className="w-full bg-gray-900 text-white hover:bg-gray-800"
                          >
                            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>
                              Get Pro Membership
                            </Link>
                          </Button>
                        )}
                        <Button
                          asChild
                          variant="outline"
                          className="w-full"
                        >
                          <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                            My Account
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          Sign Out
                        </Button>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Account Button (Desktop) */}
            {!user ? (
              <>
                <Button
                  asChild
                  className="hidden md:inline-flex bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <Link to="/auth?mode=signup">Sign Up</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="hidden md:inline-flex px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <Link to="/auth?mode=login">Log In</Link>
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                {!isPremium && (
                  <Button
                    asChild
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <Link to="/pricing">Get Pro</Link>
                  </Button>
                )}
                <UserProfileDropdown user={user} onSignOut={signOut} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
