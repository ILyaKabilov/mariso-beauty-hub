import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Users, CalendarDays, Scissors, Shield, Phone } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

export const AdminLayout = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useI18n();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/admin/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navLinks = [
    { href: "/admin", label: "Записи", icon: <CalendarDays size={18} /> },
    { href: "/admin/masters", label: "Мастера", icon: <Users size={18} /> },
    { href: "/admin/services", label: "Услуги", icon: <Scissors size={18} /> },
    { href: "/admin/contacts", label: "Контакты", icon: <Phone size={18} /> },
    { href: "/admin/admins", label: "Администраторы", icon: <Shield size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-6 flex flex-col">
        <div className="text-2xl font-display font-bold text-primary mb-10">MariSo Admin</div>
        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => {
            const active = location.pathname === link.href || (link.href !== "/admin" && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all font-medium mt-auto"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
};
