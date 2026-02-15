import { useState, useEffect, useCallback, useRef } from "react";
import { duckQuotes } from "@/lib/quotes";

export function useDuckQuotes(enabled: boolean = true) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  const showBanner = useCallback(() => {
    setVisible(true);
    setTimeout(() => setVisible(false), 8000);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Check every 10 seconds if user has been inactive for 90+ seconds
    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      if (inactiveTime >= 90000) { // 90 seconds
        setQuoteIndex((prev) => (prev + 1) % duckQuotes.length);
        showBanner();
        lastActivityRef.current = Date.now(); // Reset after showing
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [showBanner, enabled]);

  return {
    quote: duckQuotes[quoteIndex],
    visible,
    dismiss,
    resetActivity,
  };
}
