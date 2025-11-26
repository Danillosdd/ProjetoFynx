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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              
              {/* Rotas com Layout (dashboard) - mantendo as páginas atuais */}
              <Route path="/dashboard" element={
                <Layout>
                  <Index />
                </Layout>
              } />
              <Route path="/ranking" element={
                <Layout>
                  <Ranking />
                </Layout>
              } />
              <Route path="/metas" element={
                <Layout>
                  <Goal />
                </Layout>
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
  </QueryClientProvider>
);

export default App;
