import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle, ArrowRight, FileText, Calculator, Briefcase, TrendingUp, Calendar, Lightbulb, ExternalLink } from "lucide-react";
interface LegalSetupProps {
  ideaName: string;
  ideaType?: 'food-tech' | 'saas' | 'fintech' | 'ecommerce' | 'other';
  recommendedStructure?: string;
  structureReasons?: string[];
}
interface BusinessStructure {
  structure: string;
  reasons: string[];
}
const getRecommendation = (ideaType: string = 'other'): BusinessStructure => {
  const recommendations: Record<string, BusinessStructure> = {
    'food-tech': {
      structure: 'LLP',
      reasons: ['Protects your personal assets from business liabilities', 'Professional credibility with B2B restaurant clients', 'Easier compliance than a Private Limited Company', 'Flexible profit-sharing among partners', 'Can raise funding (though not as easily as Pvt Ltd)']
    },
    'saas': {
      structure: 'Private Limited',
      reasons: ['Easiest to raise VC funding', 'Equity-based fundraising structure', 'Highest professional credibility', 'Global clients prefer Pvt Ltd entities', 'Easy exit options through share transfers']
    },
    'fintech': {
      structure: 'Private Limited',
      reasons: ['Required for most financial licenses', 'Regulatory compliance requirements', 'Professional credibility in finance sector', 'Easier to raise institutional funding', 'Separate legal entity for risk management']
    },
    'ecommerce': {
      structure: 'LLP',
      reasons: ['Balance between liability protection and compliance', 'Suitable for D2C brands', 'Flexible profit distribution', 'Lower compliance than Pvt Ltd', 'Professional credibility with suppliers']
    },
    'other': {
      structure: 'LLP',
      reasons: ['Protects personal assets', 'Professional credibility', 'Moderate compliance requirements', 'Flexible structure', 'Suitable for most startups']
    }
  };
  return recommendations[ideaType] || recommendations['other'];
};
const CALENDLY_URL = "https://calendly.com/advisorsprospera/30min";
export function LegalSetupPage({
  ideaName,
  ideaType = 'other',
  recommendedStructure,
  structureReasons
}: LegalSetupProps) {
  const defaultRecommendation = getRecommendation(ideaType);
  const recommendation = {
    structure: recommendedStructure || defaultRecommendation.structure,
    reasons: structureReasons || defaultRecommendation.reasons
  };
  const tableData = [{
    label: 'Best For',
    data: {
      'Sole Proprietorship': 'Solo consultants, freelancers',
      'Partnership': '2+ partners, family businesses',
      'LLP': 'Startups, professional services',
      'Private Limited': 'VC-backed, scaling businesses'
    }
  }, {
    label: 'Owner Liability',
    data: {
      'Sole Proprietorship': 'Unlimited personal liability',
      'Partnership': 'Unlimited for all partners',
      'LLP': 'Limited to capital contribution',
      'Private Limited': 'Limited to share capital'
    }
  }, {
    label: 'Ease of Setup',
    data: {
      'Sole Proprietorship': 'Easiest & quickest',
      'Partnership': 'Easy',
      'LLP': 'Moderate',
      'Private Limited': 'Most complex'
    }
  }, {
    label: 'Compliance Burden',
    data: {
      'Sole Proprietorship': 'Minimal',
      'Partnership': 'Low',
      'LLP': 'Moderate',
      'Private Limited': 'High (annual audits, ROC)'
    }
  }, {
    label: 'Separate Legal Entity',
    data: {
      'Sole Proprietorship': 'No',
      'Partnership': 'No',
      'LLP': 'Yes',
      'Private Limited': 'Yes'
    }
  }, {
    label: 'PAN & TAN',
    data: {
      'Sole Proprietorship': 'Uses personal PAN',
      'Partnership': 'Partnership PAN + TAN (optional)',
      'LLP': 'Separate PAN & TAN required',
      'Private Limited': 'Separate PAN & TAN required'
    }
  }, {
    label: 'Fundraising Ability',
    data: {
      'Sole Proprietorship': 'Very difficult',
      'Partnership': 'Difficult',
      'LLP': 'Possible but limited',
      'Private Limited': 'Easiest (equity-based)'
    }
  }, {
    label: 'Professional Credibility',
    data: {
      'Sole Proprietorship': 'Low',
      'Partnership': 'Low-Medium',
      'LLP': 'High',
      'Private Limited': 'Highest'
    }
  }, {
    label: 'Tax Treatment',
    data: {
      'Sole Proprietorship': 'Income tax at personal slab rates',
      'Partnership': 'Income tax at partner level',
      'LLP': 'Flat 30% + cess',
      'Private Limited': '25% + cess (for companies)'
    }
  }, {
    label: 'Exit/Transfer',
    data: {
      'Sole Proprietorship': 'Difficult (tied to owner)',
      'Partnership': 'Requires deed modification',
      'LLP': 'Moderately flexible',
      'Private Limited': 'Easy (share transfer)'
    }
  }, {
    label: 'Annual Filings',
    data: {
      'Sole Proprietorship': 'Income tax return only',
      'Partnership': 'Partnership return + ITR',
      'LLP': 'ROC filings + ITR',
      'Private Limited': 'Multiple ROC filings + audit'
    }
  }, {
    label: 'Minimum Members',
    data: {
      'Sole Proprietorship': '1',
      'Partnership': '2',
      'LLP': '2 designated partners',
      'Private Limited': '2 directors, 2 shareholders'
    }
  }, {
    label: 'Recommended For',
    data: {
      'Sole Proprietorship': 'Testing an idea',
      'Partnership': 'Traditional businesses',
      'LLP': 'Most startups ✨',
      'Private Limited': 'Investor-backed startups'
    }
  }];
  const structures = ['Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited'];
  const isRecommended = (structure: string) => structure === recommendation.structure;
  const services = [{
    icon: FileText,
    color: 'text-blue-600',
    title: 'Business Registration',
    description: 'Complete registration from name approval to incorporation. We handle Sole Proprietorship, Partnership, LLP, and Private Limited registrations with full documentation support.',
    link: '#registration'
  }, {
    icon: Calculator,
    color: 'text-green-600',
    title: 'GST & Taxation',
    description: 'GST registration, compliance, income tax filing, and comprehensive tax advisory. Stay compliant with monthly/quarterly returns and expert tax planning.',
    link: '#taxation'
  }, {
    icon: Briefcase,
    color: 'text-purple-600',
    title: 'Professional Accounting',
    description: 'Managed bookkeeping and financial reporting on Odoo ERP. Get real-time visibility into your finances with dedicated accountant support and monthly reports.',
    link: '#accounting'
  }, {
    icon: TrendingUp,
    color: 'text-indigo-600',
    title: 'Financial Advisory',
    description: 'MIS reports, dashboards, and strategic CFO advisory. Make data-driven decisions with quarterly business reviews and fundraising support.',
    link: '#advisory'
  }];
  const trustBadges = ['Expert guidance end-to-end', 'Transparent pricing', 'Fast turnaround times', 'Ongoing support', 'Error-free documentation', 'StartupBase exclusive rates'];
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="mb-12 sm:mb-16 animate-fade-in">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            ⚖️ Legal & Financial Setup
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
            Make it official. Stay compliant. Grow with confidence.
          </p>
          <p className="text-sm sm:text-base text-foreground leading-relaxed max-w-3xl mx-auto">
            Building a business in India requires navigating complex registration, 
            taxation, and compliance requirements. We've partnered with expert 
            advisors to handle everything — so you can focus on building.
          </p>
        </div>

        {/* CTA Card */}
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-600 rounded-lg flex-shrink-0">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">FREE EXPERT CONSULTATION</h3>
                <p className="text-sm sm:text-base text-foreground/80 mb-4">
                  Not sure where to start? Our advisors will help you choose the right 
                  structure, understand costs, and create a compliance roadmap for your 
                  business.
                </p>
                <div className="space-y-2 mb-6">
                  {['30-minute consultation call', 'Personalized recommendations', 'No obligation, completely free', 'Included with your Premium subscription'].map(feature => <div key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{feature}</span>
                    </div>)}
                </div>
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                    Schedule Free Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {trustBadges.map(badge => <div key={badge} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>{badge}</span>
            </div>)}
        </div>
      </section>

      {/* Business Structure Section */}
      <section className="mb-12 sm:mb-16">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            🏢 Choose Your Business Structure
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            This is one of the most important decisions you'll make. The structure 
            you choose impacts your liability, taxation, compliance requirements, 
            and ability to raise funding.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-border" aria-label="Business structure comparison table">
            <thead className="bg-muted sticky top-0 z-20">
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-muted px-4 py-4 text-left text-sm font-semibold text-foreground border-r border-border">
                  Feature
                </th>
                {structures.map(structure => <th key={structure} scope="col" className={`px-4 py-4 text-left text-sm font-semibold whitespace-nowrap min-w-[200px] transition-all ${isRecommended(structure) ? 'bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100 border-t-4 border-green-500 animate-pulse-slow' : 'text-foreground'}`}>
                    <div className="flex flex-col items-start gap-1">
                      <span>{structure}</span>
                      {isRecommended(structure) && <Badge className="bg-green-600 text-white text-xs">
                          ✨ Recommended for You
                        </Badge>}
                    </div>
                  </th>)}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {tableData.map((row, idx) => <tr key={row.label} className={`border-b hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                  <th scope="row" className="sticky left-0 z-10 bg-muted px-4 py-4 text-left text-sm font-medium text-foreground border-r border-border">
                    {row.label}
                  </th>
                  {structures.map((structure, colIdx) => {
                const cellValue = row.data[structure as keyof typeof row.data];
                const isRecommendedCell = isRecommended(structure);

                // Determine complexity color based on keywords
                let complexityColor = '';
                let complexityIcon = '';
                if (typeof cellValue === 'string') {
                  const lowerValue = cellValue.toLowerCase();
                  if (lowerValue.includes('easy') || lowerValue.includes('low') || lowerValue.includes('minimal') || lowerValue.includes('limited')) {
                    complexityColor = 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300';
                    complexityIcon = '🟢';
                  } else if (lowerValue.includes('moderate') || lowerValue.includes('medium') || lowerValue.includes('possible')) {
                    complexityColor = 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300';
                    complexityIcon = '🟡';
                  } else if (lowerValue.includes('complex') || lowerValue.includes('high') || lowerValue.includes('difficult') || lowerValue.includes('unlimited')) {
                    complexityColor = 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300';
                    complexityIcon = '🔴';
                  }
                }
                return <td key={structure} className={`px-4 py-4 text-sm transition-colors ${isRecommendedCell ? 'bg-green-50/50 dark:bg-green-950/20 border-l-4 border-green-400' : ''}`}>
                        <div className={`flex items-center gap-2 ${complexityColor} rounded px-2 py-1`}>
                          {complexityIcon && <span>{complexityIcon}</span>}
                          <span>{cellValue}</span>
                        </div>
                      </td>;
              })}
                </tr>)}
            </tbody>
          </table>
        </div>

        {/* Table Legend */}
        <div className="mt-4 flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span>🟢</span>
            <span className="text-muted-foreground">Easy / Good / Low</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟡</span>
            <span className="text-muted-foreground">Moderate / Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔴</span>
            <span className="text-muted-foreground">Complex / High / Difficult</span>
          </div>
          <div className="ml-auto text-muted-foreground italic hidden sm:block">
            💡 Hover over cells for detailed information
          </div>
        </div>

        {/* Recommendation Card */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-l-4 border-amber-400">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-400/20 rounded-lg flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-base sm:text-lg font-semibold mb-2">
                  For <span className="text-primary">{ideaName}</span>, we recommend:{" "}
                  <span className="text-amber-700 dark:text-amber-400">{recommendation.structure}</span>
                </p>
                <p className="text-sm sm:text-base font-medium text-foreground/80 mt-4 mb-3">Why?</p>
                <ul className="space-y-2 mb-6">
                  {recommendation.reasons.map((reason, idx) => <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-foreground/80">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>)}
                </ul>
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Talk to an Expert — It's Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Services Overview Section */}
      <section className="mb-12 sm:mb-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Our Services</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Everything you need to launch and stay compliant
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(service => {
          const Icon = service.icon;
          return <Card key={service.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-muted rounded-lg flex-shrink-0">
                      <Icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">{service.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  
                </CardContent>
              </Card>;
        })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mt-12 sm:mt-16">
        <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white border-0">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Ready to make your startup official?
            </h2>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-4 text-lg font-semibold">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <div className="mt-6">
              <p className="text-sm text-blue-200 mb-2">
                Or explore how to build your product first:
              </p>
              <button onClick={() => window.history.back()} className="text-white underline hover:text-blue-200 text-sm transition-colors">
                ← Back to Build Tools
              </button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>;
}