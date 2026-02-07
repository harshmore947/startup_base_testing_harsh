import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';
interface ExecutionPlanField {
  label: string;
  value: string | string[];
}
interface ExecutionPlanSubsection {
  title: string;
  fields: ExecutionPlanField[];
}
interface ExecutionPlanSection {
  title: string;
  fields: ExecutionPlanField[];
  subsections: ExecutionPlanSubsection[];
}
interface InteractiveExecutionPlanProps {
  executionPlan: any;
  showProgress?: boolean;
}

// Function to parse execution plan into clean sections
function parseExecutionPlan(executionPlan: any): ExecutionPlanSection[] {
  if (!executionPlan) return [];
  let parsed = executionPlan;
  if (typeof executionPlan === 'string') {
    try {
      parsed = JSON.parse(executionPlan);
    } catch {
      return [];
    }
  }
  const sections: ExecutionPlanSection[] = [];
  const formatKey = (key: string) => {
    return key.replace(/[_-]/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  };
  const processNestedValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === 'object' && item !== null) {
          return Object.entries(item)
            .map(([k, v]) => `${formatKey(k)}: ${processNestedValue(v)}`)
            .join(', ');
        }
        return String(item);
      }).join('; ');
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${formatKey(k)}: ${processNestedValue(v)}`)
        .join(', ');
    }
    return String(value);
  };

  const processValue = (value: any): string | string[] => {
    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === 'object' && item !== null) {
          // Handle objects in arrays
          return Object.entries(item)
            .map(([k, v]) => `${formatKey(k)}: ${processNestedValue(v)}`)
            .join(', ');
        }
        return String(item);
      });
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${formatKey(k)}: ${processNestedValue(v)}`)
        .join(' | ');
    }
    return String(value);
  };
  const processSection = (sectionData: any, sectionTitle: string) => {
    const fields: ExecutionPlanField[] = [];
    const subsections: ExecutionPlanSubsection[] = [];
    Object.entries(sectionData).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      // Check if this is a subsection (object with nested structure)
      if (typeof value === 'object' && !Array.isArray(value)) {
        const subsectionFields: ExecutionPlanField[] = [];
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue !== null && subValue !== undefined) {
            subsectionFields.push({
              label: formatKey(subKey),
              value: processValue(subValue)
            });
          }
        });
        if (subsectionFields.length > 0) {
          subsections.push({
            title: formatKey(key),
            fields: subsectionFields
          });
        }
      } else {
        // Direct field
        fields.push({
          label: formatKey(key),
          value: processValue(value)
        });
      }
    });
    sections.push({
      title: sectionTitle,
      fields,
      subsections
    });
  };
  if (typeof parsed === 'object' && parsed !== null) {
    const partKeys = Object.keys(parsed).filter(key => key.toLowerCase().includes('part')).sort();
    if (partKeys.length > 0) {
      partKeys.forEach(partKey => {
        const partTitle = formatKey(partKey);
        processSection(parsed[partKey], partTitle);
      });
    } else {
      Object.entries(parsed).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          const title = formatKey(key);
          processSection(value, title);
        }
      });
    }
  }
  return sections;
}
export function InteractiveExecutionPlan({
  executionPlan
}: InteractiveExecutionPlanProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const sections = parseExecutionPlan(executionPlan);
  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };
  if (sections.length === 0) {
    return <Card className="p-8">
        <p className="text-muted-foreground">No execution plan data available</p>
      </Card>;
  }
  return <div className="space-y-3">
      {sections.map((section, sectionIndex) => {
      const isExpanded = expandedSections.has(sectionIndex);
      return <Card key={sectionIndex} className="overflow-hidden border-2">
            <Collapsible open={isExpanded} onOpenChange={() => toggleSection(sectionIndex)}>
              <CollapsibleTrigger asChild>
                <div className="px-6 py-4 cursor-pointer transition-colors flex items-center justify-between group bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-950">
                    {section.title}
                  </h2>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <ChevronDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="bg-white dark:bg-background p-6 space-y-6">
                  {/* Direct fields */}
                  {section.fields.map((field, idx) => <div key={idx} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                          {field.label}
                        </div>
                        <Pencil className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      </div>
                      <div className="text-[15px] text-foreground leading-relaxed text-justify">
                        {Array.isArray(field.value) ? <ul className="list-disc list-inside space-y-1">
                            {field.value.map((item, i) => <li key={i}>{item}</li>)}
                          </ul> : field.value}
                      </div>
                    </div>)}

                  {/* Subsections */}
                  {section.subsections.map((subsection, subIdx) => <div key={subIdx} className="space-y-4 pt-6 border-t mt-6">
                      <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                        {subsection.title}
                      </h3>
                      {subsection.fields.map((field, fieldIdx) => <div key={fieldIdx} className="space-y-2 pl-4">
                          <div className="flex items-start justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                              {field.label}
                            </div>
                            
                          </div>
                          <div className="text-[15px] text-foreground leading-relaxed text-justify">
                            {Array.isArray(field.value) ? <ul className="list-disc list-inside space-y-1">
                                {field.value.map((item, i) => <li key={i}>{item}</li>)}
                              </ul> : field.value}
                          </div>
                        </div>)}
                    </div>)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>;
    })}
    </div>;
}