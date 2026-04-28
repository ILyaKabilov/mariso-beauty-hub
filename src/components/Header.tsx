import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { LangSwitch, Logo } from "./brand";
import { Button } from "./ui/button";

export const Header = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/masters", label: t("nav.masters") },
    { to: "/booking", label: t("nav.booking") },
    { to: "/contacts", label: t("nav.contacts") },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Logo size={44} />
          <div className="hidden sm:block">
            <div className="font-display text-xl leading-none">MariSo</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Beauty · Tashkent</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary relative py-2 ${
                  isActive ? "text-primary" : "text-foreground/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <span className="absolute -bottom-0 left-0 right-0 h-[2px] bg-gradient-gold" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitch />
          <Button asChild size="sm" className="hidden md:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/booking">{t("nav.bookNow")}</Link>
          </Button>
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-3 px-3 rounded-lg text-base font-medium ${
                    isActive ? "bg-secondary text-primary" : "text-foreground/80"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Button asChild size="lg" className="mt-3 bg-primary text-primary-foreground">
              <Link to="/booking" onClick={() => setOpen(false)}>{t("nav.bookNow")}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
