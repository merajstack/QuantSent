import { useState } from "react";
import { Plus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AddStockDialogProps {
  onAddStock?: (symbol: string) => Promise<void>;
}

export function AddStockDialog({ onAddStock }: AddStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddStock = async () => {
    if (!symbol.trim()) return;

    setLoading(true);
    
    try {
      if (onAddStock) {
        await onAddStock(symbol.toUpperCase());
      }
      
      setSymbol("");
      setOpen(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:scale-105 transition-all duration-200 shadow-finance">
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-finance-gold" />
            Add Stock to Watchlist
          </DialogTitle>
          <DialogDescription>
            Enter a stock symbol to add it to your watchlist (e.g., AAPL, TSLA, MSFT)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter stock symbol..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddStock()}
              className="text-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddStock}
              disabled={loading || !symbol.trim()}
              className="flex-1 bg-gradient-primary"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Add to Watchlist"
              )}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}