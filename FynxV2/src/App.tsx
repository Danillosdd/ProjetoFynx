import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import routerBindings from '@refinedev/react-router-v6';
import Layout from "@/components/Layout"
import Index from "./pages/Index"
import Ranking from "./pages/Ranking"
import NotFound from "./pages/NotFound"
import Goal from "./pages/Goal"
import Login from "./pages/Login"
import { dataProvider, resourcesConfig } from "./refine/providers";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RefineKbarProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Refine
              dataProvider={dataProvider}
              routerProvider={routerBindings}
              resources={resourcesConfig}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                disableTelemetry: true,
              }}
            >
              <Routes>
                {/* Rota de login sem Layout */}
                <Route path="/login" element={<Login />} />

                {/* Rotas com Layout (dashboard) - Protegidas */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Index />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/ranking" element={
                  <ProtectedRoute>
                    <Layout>
                      <Ranking />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/goals" element={
                  <ProtectedRoute>
                    <Layout>
                      <Goal />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Redirecionamento automático para login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <RefineKbar />
            </Refine>
          </BrowserRouter>
        </TooltipProvider>
      </RefineKbarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
