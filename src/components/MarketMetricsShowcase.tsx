import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarketMetricsShowcaseProps {
  tamValue: string | null;
  tamSummary: string | null;
  revenuePotential: string | null;
  revenueSummary: string | null;
  ideaId?: string | number;
  reportType?: 'idea' | 'user-report';
}

interface ParsedMetric {
  display: string;
  numeric: number;
  numericUpper?: number;
  unit: string;
  isRange: boolean;
}

const parseMetricValue = (value: string | null): ParsedMetric => {
  if (!value) return { display: '--', numeric: 0, unit: '', isRange: false };
  
  const parts = value.split('|');
  
  // OLD FORMAT: [Text]|[Number]|[Unit] (3 parts)
  if (parts.length === 3) {
    return {
      display: parts[0] || '--',
      numeric: parseInt(parts[1]) || 0,
      unit: parts[2] || '',
      isRange: false
    };
  }
  
  // NEW FORMAT: [Text]|[Lower]|[Upper]|[Unit] (4 parts)
  if (parts.length === 4) {
    const lower = parseInt(parts[1]) || 0;
    const upper = parseInt(parts[2]) || 0;
    return {
      display: parts[0] || '--',
      numeric: lower,
      numericUpper: upper,
      unit: parts[3] || '',
      isRange: true
    };
  }
  
  // Fallback
  return { display: '--', numeric: 0, unit: '', isRange: false };
};

const useCountUpAnimation = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.7 }
    );

    if (ref.current) observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutCubic * target));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return { count, ref };
};

const useCountUpAnimationRange = (targetLower: number, targetUpper: number, duration: number = 2000) => {
  const [countLower, setCountLower] = useState(0);
  const [countUpper, setCountUpper] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.7 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      setCountLower(Math.floor(easeOutCubic * targetLower));
      setCountUpper(Math.floor(easeOutCubic * targetUpper));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, targetLower, targetUpper, duration]);

  return { countLower, countUpper, ref };
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  displayValue: string;
  animatedCount: number;
  animatedCountUpper?: number;
  isRange?: boolean;
  unit: string;
  gradient: string;
  onClick: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  displayValue,
  animatedCount,
  animatedCountUpper,
  isRange = false,
  unit,
  gradient,
  onClick,
  cardRef
}) => (
  <div
    ref={cardRef}
    onClick={onClick}
    className={`relative ${gradient} text-white rounded-xl p-8 shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer`}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    aria-label={`View ${label} details`}
  >
    <div className="flex items-start justify-between mb-6">
      <div className="text-4xl">{icon}</div>
      <Info className="w-5 h-5 text-white/80 hover:text-white transition-colors" aria-label="View detailed information" />
    </div>
    
    <div className="space-y-2">
      <div className="text-sm font-medium opacity-90">{label}</div>
      <div className="text-4xl md:text-5xl font-bold leading-tight animate-count-up">
        {isRange && animatedCountUpper !== undefined ? (
          <>
            {label.includes('Revenue') && <span className="mr-2">ARR</span>}
            {animatedCount > 0 ? animatedCount.toLocaleString('en-IN') : '--'}
            <span className="mx-1">-</span>
            {animatedCountUpper > 0 ? animatedCountUpper.toLocaleString('en-IN') : '--'}
          </>
        ) : (
          <>
            {label.includes('Revenue') && <span className="mr-2">ARR</span>}
            {animatedCount > 0 ? animatedCount.toLocaleString('en-IN') : '--'}
          </>
        )}
      </div>
      {unit && (
        <div className="text-lg opacity-90">
          {unit}{label.includes('Revenue') && ' by Year 3'}
        </div>
      )}
    </div>
    
    <Button 
      variant="ghost" 
      className="mt-6 text-white hover:bg-white/20 hover:text-white w-full"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      View Details →
    </Button>
  </div>
);

export const MarketMetricsShowcase: React.FC<MarketMetricsShowcaseProps> = ({
  tamValue,
  tamSummary,
  revenuePotential,
  revenueSummary,
  ideaId,
  reportType = 'idea'
}) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '', type: '' });

  const tam = parseMetricValue(tamValue);
  const revenue = parseMetricValue(revenuePotential);

  const tamCounter = useCountUpAnimation(tam.numeric);

  // Fix: Call hooks unconditionally to follow React Rules of Hooks
  const rangeCounter = useCountUpAnimationRange(revenue.numeric, revenue.numericUpper || 0);
  const singleCounter = useCountUpAnimation(revenue.numeric);

  // Then conditionally select which values to use
  const revenueCounter = revenue.isRange
    ? { countLower: rangeCounter.countLower, countUpper: rangeCounter.countUpper, ref: rangeCounter.ref }
    : { countLower: singleCounter.count, countUpper: undefined, ref: singleCounter.ref };

  const openModal = (title: string, description: string | null, type: 'tam' | 'revenue') => {
    setModalContent({ 
      title, 
      description: description || 'No detailed information available.',
      type
    });
    setModalOpen(true);
  };

  if (!tamValue && !revenuePotential) {
    return null;
  }

  const hasOnlyOneMetric = !tamValue || !revenuePotential;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className={`grid ${hasOnlyOneMetric ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
        {tamValue && (
          <MetricCard
            icon={<Target className="w-8 h-8" />}
            label="Total Addressable Market"
            displayValue={tam.display}
            animatedCount={tamCounter.count}
            isRange={false}
            unit={tam.unit}
            gradient="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800"
            onClick={() => openModal('Total Addressable Market', tamSummary, 'tam')}
            cardRef={tamCounter.ref}
          />
        )}

        {revenuePotential && (
          <MetricCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="Revenue Potential"
            displayValue={revenue.display}
            animatedCount={revenue.isRange ? revenueCounter.countLower : revenueCounter.countLower}
            animatedCountUpper={revenue.isRange ? revenueCounter.countUpper : undefined}
            isRange={revenue.isRange}
            unit={revenue.unit}
            gradient="bg-gradient-to-br from-orange-500 via-pink-600 to-rose-700"
            onClick={() => openModal('Revenue Potential', revenueSummary, 'revenue')}
            cardRef={revenueCounter.ref}
          />
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{modalContent.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground leading-relaxed text-justify whitespace-pre-wrap">
              {modalContent.description}
            </p>
            
            <div className="pt-4 border-t">
              {modalContent.type === 'tam' && (
                <Button 
                  onClick={() => {
                    setModalOpen(false);
                    const executionPath = ideaId 
                      ? `/${reportType === 'user-report' ? 'user-report' : 'idea-report'}/${ideaId}/execution-full-analysis`
                      : '/execution-full-analysis';
                    navigate(executionPath);
                  }}
                  className="w-full"
                >
                  Check out the Execution Plan →
                </Button>
              )}
              
              {modalContent.type === 'revenue' && (
                <Button 
                  onClick={() => {
                    setModalOpen(false);
                    const revenuePath = ideaId
                      ? `/${reportType === 'user-report' ? 'user-report' : 'idea-report'}/${ideaId}/revenue-full-analysis`
                      : '/revenue-full-analysis';
                    navigate(revenuePath);
                  }}
                  className="w-full"
                >
                  Check out the Revenue Plan →
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
