import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database, LineChart, Users, TrendingUp } from 'lucide-react';

export function HeroMetricsBackground() {
  const [animatedIdeas, setAnimatedIdeas] = useState(0);
  const [animatedUsers, setAnimatedUsers] = useState(0);

  // Fetch real metrics from Supabase
  const { data: metrics } = useQuery({
    queryKey: ['hero-metrics'],
    queryFn: async () => {
      // Get total ideas count
      const { count: ideasCount } = await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true });

      // Get total users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      return {
        totalIdeas: ideasCount || 365,
        totalUsers: usersCount || 1757,
        marketSize: '₹45 Cr+',
        researchHours: '12,450+'
      };
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Animate numbers on mount
  useEffect(() => {
    if (!metrics) return;

    const ideasTarget = metrics.totalIdeas;
    const usersTarget = metrics.totalUsers;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const ideasIncrement = ideasTarget / steps;
    const usersIncrement = usersTarget / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedIdeas(Math.min(Math.floor(ideasIncrement * currentStep), ideasTarget));
      setAnimatedUsers(Math.min(Math.floor(usersIncrement * currentStep), usersTarget));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [metrics]);

  if (!metrics) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
      {/* Decorative background blur blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-300 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300 rounded-full blur-3xl"></div>

      {/* Metrics Grid - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-8 max-w-7xl mx-auto">
        {/* Total Ideas */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Ideas Validated</span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-indigo-600">
            {animatedIdeas}+
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Founders Joined</span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-purple-600">
            {animatedUsers.toLocaleString()}+
          </div>
        </div>

        {/* Market Size */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Market Analyzed</span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-green-600">
            {metrics.marketSize}
          </div>
        </div>

        {/* Research Hours */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <LineChart className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Research Hours</span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-orange-600">
            {metrics.researchHours}
          </div>
        </div>
      </div>

      {/* Mobile-friendly compact metrics */}
      <div className="md:hidden flex flex-wrap justify-center gap-3 p-4 mt-12">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-indigo-200 shadow">
          <div className="text-xl font-bold text-indigo-600">{animatedIdeas}+</div>
          <div className="text-xs text-gray-600">Ideas</div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-purple-200 shadow">
          <div className="text-xl font-bold text-purple-600">{animatedUsers.toLocaleString()}+</div>
          <div className="text-xs text-gray-600">Founders</div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-200 shadow">
          <div className="text-xl font-bold text-green-600">{metrics.marketSize}</div>
          <div className="text-xs text-gray-600">Market</div>
        </div>
      </div>
    </div>
  );
}
