import { useState, useEffect } from "react";
import { ExternalLink, Clock, Newspaper, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral";
  description?: string;
  urlToImage?: string;
}

interface NewsFeedProps {
  symbol?: string;
}

export function NewsFeed({ symbol }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-stock-news', {
        body: { symbol: symbol || undefined, category: 'business' }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch news');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setArticles(data.articles || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch news";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [symbol]);

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            {symbol ? `${symbol} News` : 'Business News'}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchNews}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Loading news...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No news articles found</p>
                <p className="text-sm">Try refreshing or searching for a different stock</p>
              </div>
            ) : (
              articles.map((article, index) => (
              <div
                key={article.id}
                className="p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{article.source}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.publishedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <SentimentBadge sentiment={article.sentiment} />
                    <a
                      href={article.url}
                      className="text-primary hover:text-primary/80 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}