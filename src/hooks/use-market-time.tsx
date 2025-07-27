import { useState, useEffect } from "react";

export function useMarketTime() {
  const [marketTime, setMarketTime] = useState("");
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    const updateMarketTime = () => {
      const now = new Date();
      const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      
      // Format time
      const timeString = nyTime.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      
      setMarketTime(`${timeString} EST`);
      
      // Check if market is open (9:30 AM - 4:00 PM EST, Monday-Friday)
      const hours = nyTime.getHours();
      const minutes = nyTime.getMinutes();
      const day = nyTime.getDay();
      const isWeekday = day >= 1 && day <= 5;
      const marketOpenTime = 9 * 60 + 30; // 9:30 AM in minutes
      const marketCloseTime = 16 * 60; // 4:00 PM in minutes
      const currentTimeInMinutes = hours * 60 + minutes;
      
      setIsMarketOpen(
        isWeekday && 
        currentTimeInMinutes >= marketOpenTime && 
        currentTimeInMinutes < marketCloseTime
      );
    };

    updateMarketTime();
    const interval = setInterval(updateMarketTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return { marketTime, isMarketOpen };
}