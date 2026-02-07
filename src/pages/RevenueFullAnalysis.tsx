import { Button } from '@/components/ui/button';
import { ChevronLeft, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useIdeaOfTheDay } from '@/hooks/useIdeaOfTheDay';

// Function to parse and format revenue model data for table display
function parseRevenueModel(revenueModel: any) {
  if (!revenueModel) return [];
  
  let parsed = revenueModel;
  if (typeof revenueModel === 'string') {
    try {
      parsed = JSON.parse(revenueModel);
    } catch {
      return [];
    }
  }
  
  type RowDetail = string | Array<{ [key: string]: any }>;
  const sections: Array<{ title: string; rows: Array<{ category: string; details: RowDetail }> }> = [];
  
  // Helper function to format keys
  const formatKey = (key: string) => {
    return key
      .replace(/[_-]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };
  
  // Check if an array contains structured objects (like pricing tiers)
  const isStructuredArray = (arr: any[]) => {
    if (arr.length === 0) return false;
    const firstItem = arr[0];
    return typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem);
  };
  
  // Helper function to recursively flatten nested objects
  const flattenObject = (obj: any, parentKey = '', rows: Array<{ category: string; details: RowDetail }> = []) => {
    Object.entries(obj).forEach(([key, value]) => {
      const formattedKey = formatKey(key);
      const fullKey = parentKey ? `${parentKey} - ${formattedKey}` : formattedKey;
      
      if (value === null || value === undefined) {
        return;
      }
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        // If it's an object, recursively flatten it
        flattenObject(value, fullKey, rows);
      } else if (Array.isArray(value)) {
        const filtered = value.filter(item => item !== null && item !== undefined);
        
        if (filtered.length === 0) return;
        
        // Check if this is a structured array (like pricing tiers)
        if (isStructuredArray(filtered)) {
          // Keep as structured data for sub-table rendering
          rows.push({ category: fullKey, details: filtered });
        } else {
          // Handle as simple array
          const arrayContent = filtered
            .map(item => {
              if (typeof item === 'object') {
                return Object.entries(item)
                  .map(([k, v]) => `${formatKey(k)}: ${String(v)}`)
                  .join('; ');
              }
              return String(item);
            })
            .join(' • ');
          
          if (arrayContent) {
            rows.push({ category: fullKey, details: arrayContent });
          }
        }
      } else {
        // It's a primitive value
        const details = String(value).trim();
        if (details) {
          rows.push({ category: fullKey, details });
        }
      }
    });
    
    return rows;
  };
  
  if (typeof parsed === 'object' && parsed !== null) {
    Object.entries(parsed).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        const formattedKey = formatKey(key).toUpperCase();
        const rows: Array<{ category: string; details: RowDetail }> = [];
        
        flattenObject(value, '', rows);
        
        if (rows.length > 0) {
          sections.push({ title: formattedKey, rows });
        }
      }
    });
  }
  
  return sections;
}

// Component to render structured data as a sub-table
function StructuredDetailsTable({ data }: { data: Array<{ [key: string]: any }> }) {
  if (!data || data.length === 0) return null;
  
  const formatKey = (key: string) => {
    return key
      .replace(/[_-]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };
  
  // Get all unique keys across all objects
  const allKeys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );
  
  return (
    <div className="mt-2 border rounded-lg overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {allKeys.map((key) => (
              <TableHead key={key} className="font-semibold text-xs text-foreground py-2">
                {formatKey(key)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="hover:bg-muted/10">
              {allKeys.map((key) => {
                const value = item[key];
                return (
                  <TableCell key={key} className="text-xs align-top py-3">
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {value.map((v, i) => (
                          <li key={i} className="text-muted-foreground">{String(v)}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">{String(value)}</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function RevenueFullAnalysis() {
  const navigate = useNavigate();
  const { data: ideaOfTheDay, isLoading } = useIdeaOfTheDay();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ideaOfTheDay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Analysis Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Revenue Analysis</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Main Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <IndianRupee className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Revenue Plan</h1>
                <p className="text-[15px] text-foreground leading-relaxed text-justify max-w-4xl mt-2">
                  {ideaOfTheDay.title} - Complete monetization strategy and revenue model
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Model Table */}
        {(() => {
          const sections = parseRevenueModel(ideaOfTheDay.revenue_model);
          
          if (sections.length === 0) {
            return (
              <Card>
                <CardContent className="p-8">
                  <p className="text-muted-foreground">No revenue model data available</p>
                </CardContent>
              </Card>
            );
          }
          
          return (
            <div className="space-y-8">
              {sections.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="border-2">
                  <CardContent className="p-0">
                    <div className="bg-muted/50 px-6 py-4 border-b">
                      <h2 className="text-lg font-bold text-foreground">
                        {section.title}
                      </h2>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-1/3 font-semibold text-foreground">Category</TableHead>
                          <TableHead className="font-semibold text-foreground">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex} className="hover:bg-muted/20">
                            <TableCell className="font-medium text-foreground align-top py-4 px-6">
                              {row.category}
                            </TableCell>
                            <TableCell className="text-muted-foreground align-top py-4 px-6 leading-relaxed">
                              {typeof row.details === 'string' ? (
                                row.details
                              ) : (
                                <StructuredDetailsTable data={row.details} />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}