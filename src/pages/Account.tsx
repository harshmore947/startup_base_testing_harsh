import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, CreditCard, Settings, Bell } from 'lucide-react';
import { ProfileTab } from '@/components/account/ProfileTab';
import { PlanTab } from '@/components/account/PlanTab';
import { SettingsTab } from '@/components/account/SettingsTab';
import { NotificationsTab } from '@/components/account/NotificationsTab';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'plan' | 'notifications' | 'settings';

const tabs = [
  { id: 'profile' as TabType, label: 'Profile', icon: User },
  { id: 'plan' as TabType, label: 'Plan Details', icon: CreditCard },
  { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  { id: 'settings' as TabType, label: 'Settings', icon: Settings },
];

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('profile');
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'plan':
        return <PlanTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Account Settings</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:flex-col lg:w-64 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left',
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Mobile Tabs */}
          <div className="lg:hidden flex overflow-x-auto border-b border-border bg-background">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <main className="flex-1">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
