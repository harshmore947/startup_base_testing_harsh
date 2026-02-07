import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalysisContentProps {
  content: any;
  score?: number;
}

// Clean text by removing markdown formatting and em dashes
function cleanText(text: string): string {
  return text
    .replace(/##\s*/g, '') // Remove ## headers
    .replace(/—/g, '-')    // Replace em dashes with regular dashes
    .replace(/–/g, '-')    // Replace en dashes with regular dashes
    .trim();
}

// Parse and format analysis content
function parseAndFormatContent(content: any): string | React.ReactNode {
  if (!content) return 'No analysis available';
  
  let parsed = content;
  
  // Parse if string
  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content);
    } catch {
      // If it's not JSON, treat as plain text and clean it
      return cleanText(content);
    }
  }
  
  // If it's an object, format it nicely
  if (typeof parsed === 'object' && parsed !== null) {
    return formatObjectContent(parsed);
  }
  
  return cleanText(String(parsed));
}

// Format object content into readable sections
function formatObjectContent(obj: any): React.ReactNode {
  if (Array.isArray(obj)) {
    return (
      <div className="space-y-4">
        {obj.map((item, index) => (
          <div key={index} className="border-l-4 border-primary/20 pl-4">
          <div className="text-[15px] leading-relaxed text-justify text-foreground">
              {typeof item === 'object' ? formatObjectContent(item) : cleanText(String(item))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Handle object with key-value pairs
  return (
    <div className="space-y-6">
      {Object.entries(obj).map(([key, value], index) => {
        // Skip empty or null values
        if (!value) return null;
        
        const formattedKey = key
          .replace(/[_-]/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        
        return (
          <div key={index} className="space-y-3">
            <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">
              {cleanText(formattedKey)}
            </h3>
            <div className="text-[15px] leading-relaxed text-foreground pl-4 text-justify">
              {typeof value === 'object' && value !== null ? 
                formatObjectContent(value) : 
                <p className="whitespace-pre-wrap">{cleanText(String(value))}</p>
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AnalysisContent({ content, score }: AnalysisContentProps) {
  const formattedContent = parseAndFormatContent(content);
  
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
      
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none">
            {typeof formattedContent === 'string' ? (
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground text-justify">
                {formattedContent}
              </div>
            ) : (
              formattedContent
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}