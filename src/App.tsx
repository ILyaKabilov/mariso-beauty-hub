import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/i18n";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { ServicesPage } from "@/pages/ServicesPage";
import { MastersPage } from "@/pages/MastersPage";
import { BookingPage } from "@/pages/BookingPage";
import { ContactsPage } from "@/pages/ContactsPage";
import NotFound from "./pages/NotFound.tsx";
import { AdminLayout } from "./pages/Admin/AdminLayout";
import { AdminLoginPage } from "./pages/Admin/LoginPage";
import { AdminDashboard } from "./pages/Admin/Dashboard";
import { ManageMasters } from "./pages/Admin/ManageMasters";
import { ManageServices } from "./pages/Admin/ManageServices";
import { ManageAdmins } from "./pages/Admin/ManageAdmins";
import { ManageContacts } from "./pages/Admin/ManageContacts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/masters" element={<MastersPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="masters" element={<ManageMasters />} />
              <Route path="services" element={<ManageServices />} />
              <Route path="admins" element={<ManageAdmins />} />
              <Route path="contacts" element={<ManageContacts />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
