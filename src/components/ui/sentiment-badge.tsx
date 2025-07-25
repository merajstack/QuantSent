import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
  sentiment: "positive" | "negative" | "neutral";
  className?: string;
}

export function SentimentBadge({ sentiment, className }: SentimentBadgeProps) {
  const getVariant = () => {
    switch (sentiment) {
      case "positive":
        return "bg-finance-positive text-white";
      case "negative":
        return "bg-finance-negative text-white";
      case "neutral":
        return "bg-finance-neutral text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getIcon = () => {
    switch (sentiment) {
      case "positive":
        return "🟢";
      case "negative":
        return "🔴";
      case "neutral":
        return "🟡";
      default:
        return "⚪";
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
      getVariant(),
      className
    )}>
      <span>{getIcon()}</span>
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
}