// Admin-frontend/src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext"; // Ensure this path is correct
import { DepartmentsProvider } from "@/contexts/DepartmentsContext";

import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ManageUsers from "@/pages/ManageUsers";
import ManagePermissions from "@/pages/ManagePermissions";
import SurveyReports from "@/pages/SurveyReports";
import CustomerFocus from "@/pages/CustomerFocus";
import AccountSettings from "@/pages/AccountSettings";
import Login from "../../Shared/Login"; // Adjusted path to Shared folder
import NotFound from "@/pages/NotFound";

// Removed direct imports for Header and Sidebar as they are rendered within AppLayout

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DepartmentsProvider>
            <Routes>
              
              <Route path="/login" element={<Login />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} /> 
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<ManageUsers />} />
                <Route path="/permissions" element={<ManagePermissions />} />
                <Route path="/reports" element={<SurveyReports />} />
                <Route path="/customer-focus" element={<CustomerFocus />} />
                <Route path="/account" element={<AccountSettings />} />
              </Route>

              {/* Catch-all for undefined routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DepartmentsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;