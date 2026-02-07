import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Star, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface AmazonProduct {
  title?: string;
  price?: string | number;
  rating?: string | number;
  reviews?: string | number;
  link?: string;
  category?: string;
  bestseller_rank?: string | number;
  availability?: string;
  image?: string;
  [key: string]: any;
}

interface InteractiveAmazonDataProps {
  amazonData: any;
}

export const InteractiveAmazonData: React.FC<InteractiveAmazonDataProps> = ({ amazonData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse Amazon data
  const parseAmazonData = (): AmazonProduct[] => {
    if (!amazonData) return [];

    try {
      let parsed = amazonData;
      if (typeof amazonData === 'string') {
        parsed = JSON.parse(amazonData);
      }

      // Handle different data structures
      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (parsed.products && Array.isArray(parsed.products)) {
        return parsed.products;
      }

      if (parsed.results && Array.isArray(parsed.results)) {
        return parsed.results;
      }

      // If it's a single product object
      if (typeof parsed === 'object' && parsed.title) {
        return [parsed];
      }

      return [];
    } catch (error) {
      logger.error('Error parsing Amazon data:', error);
      return [];
    }
  };

  const products = parseAmazonData();
  const displayProducts = isExpanded ? products : products.slice(0, 2);

  if (products.length === 0) {
    return null;
  }

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return 'N/A';
    const priceStr = String(price).replace(/[^0-9.]/g, '');
    return priceStr ? `$${priceStr}` : 'N/A';
  };

  const formatRating = (rating: string | number | undefined) => {
    if (!rating) return null;
    const ratingNum = typeof rating === 'number' ? rating : parseFloat(String(rating));
    return !isNaN(ratingNum) ? ratingNum.toFixed(1) : null;
  };

  const formatReviews = (reviews: string | number | undefined) => {
    if (!reviews) return null;
    const reviewStr = String(reviews).replace(/[^0-9]/g, '');
    const reviewNum = parseInt(reviewStr);
    if (!isNaN(reviewNum)) {
      if (reviewNum >= 1000) {
        return `${(reviewNum / 1000).toFixed(1)}K`;
      }
      return reviewNum.toString();
    }
    return null;
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package size={18} className="text-orange-500" />
          Amazon Product Analysis
        </CardTitle>
        <CardDescription>
          Competitive products and market insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayProducts.map((product, index) => (
          <div 
            key={index}
            className="p-4 bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 rounded-lg border border-orange-200/50 dark:border-orange-800/30 hover:shadow-md transition-all duration-200"
          >
            {/* Product Title */}
            <h4 className="font-semibold text-sm text-foreground leading-tight mb-3 line-clamp-2">
              {product.title || 'Product'}
            </h4>

            {/* Product Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Price */}
              {product.price && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                    <DollarSign size={14} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-sm font-bold text-foreground">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              )}

              {/* Rating */}
              {formatRating(product.rating) && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                    <Star size={14} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-sm font-bold text-foreground">
                      {formatRating(product.rating)}/5
                    </p>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {formatReviews(product.reviews) && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <ShoppingCart size={14} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                    <p className="text-sm font-bold text-foreground">
                      {formatReviews(product.reviews)}
                    </p>
                  </div>
                </div>
              )}

              {/* Bestseller Rank */}
              {product.bestseller_rank && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                    <TrendingUp size={14} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rank</p>
                    <p className="text-sm font-bold text-foreground">
                      #{product.bestseller_rank}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Category Badge */}
            {product.category && (
              <div className="mb-3">
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </div>
            )}

            {/* Availability Status */}
            {product.availability && (
              <p className="text-xs text-muted-foreground mb-3">
                <span className="font-medium">Availability:</span> {product.availability}
              </p>
            )}

            {/* View on Amazon Button */}
            {product.link && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                onClick={() => window.open(product.link, '_blank')}
              >
                View on Amazon
                <ExternalLink size={14} className="ml-2" />
              </Button>
            )}
          </div>
        ))}

        {/* Expand/Collapse Button */}
        {products.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUp size={16} className="ml-2" />
              </>
            ) : (
              <>
                Show {products.length - 2} More Products
                <ChevronDown size={16} className="ml-2" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
