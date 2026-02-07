import { Link } from 'react-router-dom';

export function WaitlistHeader() {
  return (
    <header className="border-b border-secondary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Startup Base
            </div>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/about" 
              className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Contact
            </Link>
            <Link 
              to="/privacy" 
              className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
