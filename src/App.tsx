import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import HomePage from "./pages/HomePage";
import ExplorerPage from "./pages/ExplorerPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import IdeologicalMapPage from "./pages/IdeologicalMapPage";
import LoginPage from "./pages/LoginPage";
import ReviewerDashboardPage from "./pages/ReviewerDashboardPage";
import ReviewPage from "./pages/ReviewPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TransparencyPage from "./pages/TransparencyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-12 flex items-center border-b bg-card px-4 shrink-0">
                <SidebarTrigger />
                <span className="ml-3 text-sm font-medium text-muted-foreground">Bias Observatory</span>
              </header>
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explorer" element={<ExplorerPage />} />
                  <Route path="/article/:id" element={<ArticleDetailPage />} />
                  <Route path="/map" element={<IdeologicalMapPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/reviewer" element={<ReviewerDashboardPage />} />
                  <Route path="/review" element={<ReviewPage />} />
                  <Route path="/review/:articleId" element={<ReviewPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/transparency" element={<TransparencyPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
