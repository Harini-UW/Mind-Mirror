// bring in react tools
import * as React from "react";

// screen width for phones is below this
const MOBILE_BREAKPOINT = 768;

// tool to check if on phone
export function useIsMobile() {
  // remember if on phone or not
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  // run once when page loads
  React.useEffect(() => {
    // listen for screen size changes
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    // when screen size changes update state
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    // start listening
    mql.addEventListener("change", onChange);
    // check size right now
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    // stop listening when leaving page
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // return true if mobile
  return !!isMobile;
}
