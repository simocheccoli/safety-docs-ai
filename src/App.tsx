import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import SafetySheets from "./pages/SafetySheets";
import SafetySheetDetail from "./pages/SafetySheetDetail";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import Companies from "./pages/Companies";
import RiskManagement from "./pages/RiskManagement";
import RiskDetail from "./pages/RiskDetail";
import DVRList from "./pages/DVRList";
import DVRDetail from "./pages/DVRDetail";
import DVRDocumentEditor from "./pages/DVRDocumentEditor";
import DVRWizard from "./pages/DVRWizard";
import Deadlines from "./pages/Deadlines";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={
                <ProtectedRoute>
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
                            <Route path="/safety-sheets/:id" element={<SafetySheetDetail />} />
                            <Route path="/companies" element={<Companies />} />
                            <Route path="/deadlines" element={<Deadlines />} />
                            <Route path="/rischi" element={<RiskManagement />} />
                            <Route path="/rischi/:id" element={<RiskDetail />} />
                            <Route path="/dvr" element={<DVRList />} />
                            <Route path="/dvr/wizard" element={<DVRWizard />} />
                            <Route path="/dvr/:id" element={<DVRDetail />} />
                            <Route path="/dvr/:id/document" element={<DVRDocumentEditor />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
