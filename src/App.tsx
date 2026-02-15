// bring in popup message tools
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// bring in tooltip helpers
import { TooltipProvider } from "@/components/ui/tooltip";
// bring in data loading helpers
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// bring in page navigation tools
import { BrowserRouter, Routes, Route } from "react-router-dom";
// bring in home page
import Index from "./pages/Index";
// bring in chat page
import ChatPage from "./pages/ChatPage";
// bring in error page
import NotFound from "./pages/NotFound";

// make helper for loading data
const queryClient = new QueryClient();

// main app that holds everything
const App = () => (
  // wrap app in data loader
  <QueryClientProvider client={queryClient}>
    {/* wrap app in tooltip helper */}
    <TooltipProvider>
      {/* add popup message boxes */}
      <Toaster />
      <Sonner />
      {/* add page navigation */}
      <BrowserRouter>
        <Routes>
          {/* home page at website start */}
          <Route path="/" element={<Index />} />
          {/* chat page with persona name */}
          <Route path="/chat/:personaId" element={<ChatPage />} />
          {/* show this if page not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// let other files use this app
export default App;
