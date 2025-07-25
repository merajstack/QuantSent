import { ExternalLink, Clock, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral";
}

const mockNews: NewsArticle[] = [
  {
    id: "1",
    title: "Tech stocks rally as AI sector shows strong growth potential",
    source: "Financial Times",
    url: "#",
    publishedAt: "2 hours ago",
    sentiment: "positive"
  },
  {
    id: "2", 
    title: "Market volatility increases amid economic uncertainty",
    source: "Bloomberg",
    url: "#",
    publishedAt: "4 hours ago",
    sentiment: "negative"
  },
  {
    id: "3",
    title: "Federal Reserve maintains current interest rates",
    source: "Reuters",
    url: "#",
    publishedAt: "6 hours ago",
    sentiment: "neutral"
  },
  {
    id: "4",
    title: "Renewable energy stocks surge on new climate policies",
    source: "CNBC",
    url: "#",
    publishedAt: "8 hours ago",
    sentiment: "positive"
  },
  {
    id: "5",
    title: "Banking sector faces regulatory headwinds",
    source: "Wall Street Journal",
    url: "#",
    publishedAt: "12 hours ago",
    sentiment: "negative"
  }
];

export function NewsFeed() {
  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          News Sentiment Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {mockNews.map((article, index) => (
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
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}