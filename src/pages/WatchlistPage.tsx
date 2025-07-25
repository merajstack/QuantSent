import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Watchlist } from "@/components/dashboard/watchlist";
import { AddStockDialog } from "@/components/dashboard/add-stock-dialog";

export default function WatchlistPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Watchlist</h1>
            <p className="text-muted-foreground">
              Track your favorite stocks and their sentiment in real-time
            </p>
          </div>
          <AddStockDialog />
        </div>

        <Watchlist />
      </div>
    </DashboardLayout>
  );
}