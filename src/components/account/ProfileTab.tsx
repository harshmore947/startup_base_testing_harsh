import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

const getInitials = (user: any) => {
  const fullName = user?.user_metadata?.full_name;
  if (fullName) {
    return fullName.charAt(0).toUpperCase();
  }
  return user?.email?.charAt(0).toUpperCase() || 'U';
};

export function ProfileTab() {
  const { user } = useAuth();

  if (!user) return null;

  const fullName = user.user_metadata?.full_name || 'User';
  const email = user.email || '';
  const memberSince = user.created_at 
    ? format(new Date(user.created_at), 'MMMM yyyy')
    : 'Unknown';

  return (
    <Card className="p-8 bg-card shadow-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="bg-emerald-600 text-white font-bold text-3xl">
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
        </div>
      </div>
    </Card>
  );
}
