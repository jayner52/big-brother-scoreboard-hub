import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrentWeekProvider } from "@/contexts/CurrentWeekContext";
import { PoolProvider } from "@/contexts/PoolContext";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Welcome from "./pages/Welcome";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Draft from "./pages/Draft";
import MyTeams from "./pages/MyTeams";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PoolProvider>
        <CurrentWeekProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/draft" element={<Draft />} />
              <Route path="/my-teams" element={<MyTeams />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CurrentWeekProvider>
      </PoolProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
