import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InteractiveOpportunityAnalysisProps {
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

// Render field value (handles nested objects, arrays, strings)
function renderFieldValue(value: any): React.ReactNode {
  if (!value) return null;

  // Handle arrays
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside space-y-1 text-foreground">
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
      <div className="space-y-3 pl-4 border-l-2 border-emerald-200/50">
        {Object.entries(value).map(([key, val]) => (
          <div key={key}>
            <div className="flex items-start gap-2 mb-1">
              <Pencil size={14} className="text-emerald-600 mt-1 flex-shrink-0" />
              <span className="font-bold text-foreground text-[15px]">{cleanText(key)}:</span>
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
            <Pencil size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
            <h4 className="font-bold text-foreground text-lg">
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

export function InteractiveOpportunityAnalysis({ content, score }: InteractiveOpportunityAnalysisProps) {
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

      <Accordion type="multiple" className="space-y-4">
        {sections.map(([sectionTitle, sectionData], index) => (
          <AccordionItem
            key={index}
            value={`section-${index}`}
            className="border-2 border-border rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 bg-emerald-50 hover:bg-emerald-100 transition-colors [&[data-state=open]]:bg-emerald-100">
              <span className="text-lg font-bold text-emerald-900">
                {cleanText(sectionTitle)}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-6 bg-background">
              {renderSection(sectionData)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
