import React, { useState, useEffect, useRef } from 'react';
import { Target, Users, Lightbulb, AlertTriangle, CheckCircle, TrendingUp, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface InteractiveOpportunityCardsProps {
  content: any;
  score?: number;
}

// Clean text by removing markdown symbols and formatting
function cleanText(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '') // Remove all # symbols (headers)
    .replace(/\*\*/g, '')      // Remove bold markdown
    .replace(/\*/g, '')        // Remove italic markdown
    .replace(/—/g, '-')        // Replace em dashes
    .replace(/–/g, '-')        // Replace en dashes
    .trim();
}

// Parse the opportunity analysis content
function parseOpportunityAnalysis(content: any): any {
  if (!content) return null;

  let parsed = content;
  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content);
    } catch {
      // If not JSON, create a simple structure
      return {
        'Market Overview': content
      };
    }
  }

  return parsed;
}

// Scroll animation hook
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Get icon for section based on index
const getSectionIcon = (index: number) => {
  const icons = [
    <Target className="h-6 w-6" />,
    <Users className="h-6 w-6" />,
    <Lightbulb className="h-6 w-6" />,
    <TrendingUp className="h-6 w-6" />,
    <AlertTriangle className="h-6 w-6" />,
    <CheckCircle className="h-6 w-6" />
  ];
  return icons[index % icons.length];
};

// Get gradient for section based on index
const getSectionGradient = (index: number) => {
  const gradients = [
    'bg-gradient-to-r from-purple-600 to-indigo-600',
    'bg-gradient-to-r from-blue-600 to-cyan-600',
    'bg-gradient-to-r from-emerald-600 to-teal-600',
    'bg-gradient-to-r from-orange-600 to-amber-600',
    'bg-gradient-to-r from-red-600 to-rose-600',
    'bg-gradient-to-r from-green-600 to-emerald-600'
  ];
  return gradients[index % gradients.length];
};

// Render field value (handles nested objects, arrays, strings)
function renderFieldValue(value: any): React.ReactNode {
  if (!value) return null;

  // Handle arrays
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside space-y-2 text-foreground">
        {value.map((item, idx) => (
          <li key={idx} className="leading-relaxed text-[15px] text-justify">
            {typeof item === 'object' ? renderFieldValue(item) : cleanText(String(item))}
          </li>
        ))}
      </ul>
    );
  }

  // Handle nested objects
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="space-y-3 pl-4 border-l-2 border-primary/20">
        {Object.entries(value).map(([key, val]) => (
          <div key={key}>
            <div className="flex items-start gap-2 mb-1">
              <Pencil size={14} className="text-primary mt-1 flex-shrink-0" />
              <span className="font-semibold text-foreground text-[15px]">{cleanText(key)}:</span>
            </div>
            <div className="pl-6">{renderFieldValue(val)}</div>
          </div>
        ))}
      </div>
    );
  }

  // Handle plain text
  return (
    <p className="text-foreground leading-relaxed whitespace-pre-wrap text-[15px] text-justify">
      {cleanText(String(value))}
    </p>
  );
}

// Render a section with its fields
function renderSection(sectionData: any): React.ReactNode {
  if (!sectionData || typeof sectionData !== 'object') {
    return (
      <p className="text-foreground leading-relaxed whitespace-pre-wrap text-[15px] text-justify">
        {cleanText(String(sectionData))}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(sectionData).map(([fieldKey, fieldValue]) => (
        <div key={fieldKey} className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Pencil size={16} className="text-primary mt-1 flex-shrink-0" />
            <h4 className="font-semibold text-foreground text-base">
              {cleanText(fieldKey)}
            </h4>
          </div>
          <div className="pl-6">
            {renderFieldValue(fieldValue)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Individual Card Component
interface OpportunityCardProps {
  sectionTitle: string;
  sectionData: any;
  index: number;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ sectionTitle, sectionData, index }) => {
  const { ref, isVisible } = useScrollAnimation();
  const gradient = getSectionGradient(index);
  const icon = getSectionIcon(index);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <Card className="border-2 border-border rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
        <div className={`${gradient} px-6 py-4 text-white flex items-center gap-3`}>
          <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                {index + 1}
              </Badge>
              <h2 className="text-2xl font-bold">{cleanText(sectionTitle)}</h2>
            </div>
          </div>
        </div>
        <CardContent className="px-6 py-6 bg-background">
          {renderSection(sectionData)}
        </CardContent>
      </Card>
    </div>
  );
};

export function InteractiveOpportunityCards({ content, score }: InteractiveOpportunityCardsProps) {
  const parsedData = parseOpportunityAnalysis(content);

  if (!parsedData) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No opportunity analysis data available
      </div>
    );
  }

  // Get all sections
  const sections = typeof parsedData === 'object' ? Object.entries(parsedData) : [];

  return (
    <div className="space-y-6">
      {score && (
        <div className="flex justify-end">
          <Badge 
            variant="secondary" 
            className={`text-lg px-4 py-2 ${
              score >= 9 ? 'bg-green-100 text-green-800 border-green-200' :
              score >= 7 ? 'bg-blue-100 text-blue-800 border-blue-200' :
              score >= 5 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
              'bg-red-100 text-red-800 border-red-200'
            }`}
          >
            Score: {score}/10
          </Badge>
        </div>
      )}

      <div className="space-y-6">
        {sections.map(([sectionTitle, sectionData], index) => (
          <OpportunityCard
            key={index}
            sectionTitle={sectionTitle}
            sectionData={sectionData}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
