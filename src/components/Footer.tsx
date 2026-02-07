import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Mail, Rocket, Phone, MessageCircle } from 'lucide-react';
export function Footer() {
  return <footer className="border-t border-secondary mt-auto bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Startup Base
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Building Tomorrow's Ideas, Today. Get fully researched startup ideas and build them with AI-powered tools.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://www.instagram.com/startupbasee/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:scale-110 transition-transform duration-200" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a href="https://www.linkedin.com/company/startup-basee/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#0077B5] hover:scale-110 transition-transform duration-200" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-white" />
              </a>
              <a href="https://whatsapp.com/channel/0029Vb7QNpWGU3BKBThZe21X" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#25D366] hover:scale-110 transition-transform duration-200" aria-label="WhatsApp Channel">
                <MessageCircle className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/archive" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Idea Archive
                </Link>
              </li>
              <li>
                <Link to="/research-my-idea" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Research My Idea
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Daily Idea
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+917738267668" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +91 7738267668
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:admin@startupbase.co.in" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  admin@startupbase.co.in
                </a>
              </div>
              <div className="flex items-start gap-2">
                
                
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StartupBase™ by Autozen AI.
            </p>

          </div>
        </div>
      </div>
    </footer>;
}