import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User as UserIcon, CreditCard, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface UserProfileDropdownProps {
  user: User;
  onSignOut: () => void;
}

const getInitials = (user: User) => {
  const fullName = user.user_metadata?.full_name;
  if (fullName) {
    return fullName.charAt(0).toUpperCase();
  }
  return user.email?.charAt(0).toUpperCase() || 'U';
};

const getDisplayName = (user: User) => {
  return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
};

export function UserProfileDropdown({ user, onSignOut }: UserProfileDropdownProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto hover:bg-accent">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-emerald-600 text-white font-semibold text-sm">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-sm font-medium text-foreground">
            {getDisplayName(user)}
          </span>
          <ChevronDown className="hidden md:inline-block h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg">
        <DropdownMenuItem 
          onClick={() => navigate('/account')}
          className="cursor-pointer flex items-center gap-2 py-2"
        >
          <UserIcon className="h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/account?tab=plan')}
          className="cursor-pointer flex items-center gap-2 py-2"
        >
          <CreditCard className="h-4 w-4" />
          <span>Plan & Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/account?tab=settings')}
          className="cursor-pointer flex items-center gap-2 py-2"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onSignOut}
          className="cursor-pointer flex items-center gap-2 py-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
