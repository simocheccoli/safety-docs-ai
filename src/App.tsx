import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import SafetySheets from "./pages/SafetySheets";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import RiskManagement from "./pages/RiskManagement";

const queryClient = new QueryClient();

const App = () => {
  const isLoginPage = window.location.pathname === '/login';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {isLoginPage ? null : (
              <Route
                path="*"
                element={
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
                          <SidebarTrigger />
                        </header>
                        <main className="flex-1 p-6">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
            <Route path="/safety-sheets" element={<SafetySheets />} />
            <Route path="/risk-management" element={<RiskManagement />} />
            <Route path="/users" element={<Users />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </SidebarProvider>
                }
              />
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
