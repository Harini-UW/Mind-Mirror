// bring in url reading tool
import { useLocation } from "react-router-dom";
// bring in effect tool
import { useEffect } from "react";

// error page for wrong addresses
const NotFound = () => {
  // get current web address
  const location = useLocation();

  // run once when page loads
  useEffect(() => {
    // write error to browser console
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
