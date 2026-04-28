import { Link } from "react-router-dom";
import { Instagram, Phone, MapPin, Clock } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Logo } from "./brand";

export const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="container mx-auto py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Logo size={48} />
              <div>
                <div className="font-display text-2xl">MariSo</div>
                <div className="text-xs uppercase tracking-[0.2em] opacity-70 mt-1">Beauty · Tashkent</div>
              </div>
            </div>
            <p className="mt-6 max-w-md font-display text-xl italic opacity-80">
              {t("footer.slogan")}
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg mb-4 text-gold">{t("nav.services")}</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/services" className="hover:text-gold transition-colors">{t("cat.hair")}</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">{t("cat.manicure")}</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">{t("cat.pedicure")}</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">{t("cat.massage")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg mb-4 text-gold">{t("nav.contacts")}</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" />{t("contacts.addressVal")}</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-gold" />+998 71 200 00 00</li>
              <li className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0 text-gold" />{t("contacts.hoursVal")}</li>
              <li className="flex items-center gap-2"><Instagram size={16} className="text-gold" />@mariso.tashkent</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs opacity-60">
          <div>© {new Date().getFullYear()} MariSo. {t("footer.rights")}.</div>
          <div>Made with ❤ in Tashkent</div>
        </div>
      </div>
    </footer>
  );
};
