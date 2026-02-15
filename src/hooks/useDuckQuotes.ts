// bring in effect and state tools
import { useState, useEffect, useCallback, useRef } from "react";
// bring in duck motivation quotes
import { duckQuotes } from "@/lib/quotes";

// tool to show duck quotes automatically
export function useDuckQuotes(enabled: boolean = true) {
  // remember which quote to show
  const [quoteIndex, setQuoteIndex] = useState(0);
  // remember if popup is showing
  const [visible, setVisible] = useState(false);
  // remember when user last did something
  const lastActivityRef = useRef<number>(Date.now());

  // show popup then hide after time
  const showBanner = useCallback(() => {
    setVisible(true);
    // hide after eight seconds
    setTimeout(() => setVisible(false), 8000);
  }, []);

  // hide popup right away
  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  // mark that user did something now
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // check for inactivity and show quotes
  useEffect(() => {
    // stop if turned off
    if (!enabled) return;

    // check every ten seconds
    const interval = setInterval(() => {
      // calculate how long since activity
      const inactiveTime = Date.now() - lastActivityRef.current;
      // if ninety seconds passed show duck
      if (inactiveTime >= 90000) {
        // go to next quote
        setQuoteIndex((prev) => (prev + 1) % duckQuotes.length);
        // show popup
        showBanner();
        // reset timer
        lastActivityRef.current = Date.now();
      }
    }, 10000);

    // stop checking when leaving page
    return () => clearInterval(interval);
  }, [showBanner, enabled]);

  return {
    quote: duckQuotes[quoteIndex],
    visible,
    dismiss,
    resetActivity,
  };
}
