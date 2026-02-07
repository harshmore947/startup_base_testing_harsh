import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface FormattedDescriptionProps {
  description: string;
  truncate?: boolean;
  maxSections?: number;
}

// Clean and format description by splitting on actual section headers
export function formatDescription(description: string): Array<{content: string, type: string}> {
  if (!description) return [];
  
  // Split by actual section patterns found in the database
  const sections = description
    .split(/(?=(?:\*\*)?(Pain Point:|The platform:|The Product:|Pricing & Go-To-Market:|The Vision:))/i)
    .map(section => section.trim())
    .filter(section => section.length > 0);
  
  // Clean up asterisks and section headers, then map to types
  return sections.map((content, index) => {
    const lowerContent = content.toLowerCase();
    
    // Determine section type based on HEADER TEXT (before cleaning)
    let type = 'default';
    if (lowerContent.startsWith('pain point:') || (index === 0 && lowerContent.includes('pain point:'))) {
      type = 'pain-point';
    } else if (lowerContent.startsWith('the platform:') || lowerContent.startsWith('the product:')) {
      type = 'platform';
    } else if (lowerContent.startsWith('pricing') || lowerContent.startsWith('go-to-market')) {
      type = 'pricing-gtm';
    } else if (lowerContent.startsWith('the vision:')) {
      type = 'vision';
    }
    
    // Remove asterisks and clean up content
    let cleanContent = content
      .replace(/\*+/g, '') // Remove all asterisks
      .replace(/^(Pain Point:|The platform:|The Product:|Pricing & Go-To-Market:|Go-To-Market:|The Vision:)/i, '') // Remove all possible section headers
      .trim();
    
    return {
      content: cleanContent,
      type: type
    };
  }).filter(section => section.content.length > 0);
}

// Section type is now determined by order, not content detection

// Get section styling based on type
function getSectionStyling(type: string) {
  switch (type) {
    case 'pain-point':
      return {
        borderColor: 'border-l-red-500',
        bgColor: 'bg-red-50/50',
        textColor: 'text-red-900',
        badgeColor: 'bg-red-100 text-red-700',
        label: 'Pain Point'
      };
    case 'platform':
      return {
        borderColor: 'border-l-blue-500',
        bgColor: 'bg-blue-50/50',
        textColor: 'text-blue-900',
        badgeColor: 'bg-blue-100 text-blue-700',
        label: 'The Platform/Product'
      };
    case 'pricing-gtm':
      return {
        borderColor: 'border-l-green-500',
        bgColor: 'bg-green-50/50',
        textColor: 'text-green-900',
        badgeColor: 'bg-green-100 text-green-700',
        label: 'Pricing & Go-To-Market'
      };
    case 'vision':
      return {
        borderColor: 'border-l-purple-500',
        bgColor: 'bg-purple-50/50',
        textColor: 'text-purple-900',
        badgeColor: 'bg-purple-100 text-purple-700',
        label: 'The Vision'
      };
    default:
      return {
        borderColor: 'border-l-primary/20',
        bgColor: 'bg-muted/30',
        textColor: 'text-foreground',
        badgeColor: 'bg-muted text-muted-foreground',
        label: 'Overview'
      };
  }
}

export function FormattedDescription({ 
  description, 
  truncate = false, 
  maxSections = 2 
}: FormattedDescriptionProps) {
  if (!description) return null;
  
  const sections = formatDescription(description);
  
  // For truncated version (Archive page)
  if (truncate) {
    const displaySections = sections.slice(0, maxSections);
    return (
      <div className="space-y-3">
        {displaySections.map((section, index) => {
          const styling = getSectionStyling(section.type);
          return (
            <div key={index} className={`p-3 rounded-lg border-l-4 ${styling.borderColor} ${styling.bgColor}`}>
              <p className={`text-sm leading-relaxed text-justify ${styling.textColor}`}>
                {section.content.substring(0, 120)}...
              </p>
            </div>
          );
        })}
        {sections.length > maxSections && (
          <p className="text-xs text-muted-foreground italic text-center">
            +{sections.length - maxSections} more sections...
          </p>
        )}
      </div>
    );
  }
  
  // For full version (Index and IdeaReport pages)
  if (sections.length <= 1) {
    const styling = getSectionStyling(sections[0]?.type || 'default');
    return (
      <div className={`p-4 rounded-lg border-l-4 ${styling.borderColor} ${styling.bgColor}`}>
        <p className={`text-lg leading-relaxed text-justify ${styling.textColor}`}>
          {sections[0]?.content || description.replace(/\*+/g, '')}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const styling = getSectionStyling(section.type);
        return (
          <div key={index}>
            <Card className={`border-l-4 ${styling.borderColor} ${styling.bgColor} border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-4 pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${styling.badgeColor}`}>
                    {styling.label}
                  </span>
                </div>
                <p className={`text-base leading-relaxed text-justify ${styling.textColor}`}>
                  {section.content}
                </p>
              </CardContent>
            </Card>
            {index < sections.length - 1 && (
              <Separator className="my-3" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Clean asterisks for plain text usage
export function formatDescriptionText(description: string): string {
  if (!description) return '';
  
  // Remove asterisks, section headers, and normalize whitespace
  return description
    .replace(/\*+/g, '') // Remove asterisks
    .replace(/(?:Pain Point:|The platform:|Pricing & Go-To-Market:|The Vision:)/gi, '') // Remove section headers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}