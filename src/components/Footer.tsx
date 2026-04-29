import { Link } from "react-router-dom";
import { Instagram, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { useContacts, useCategories } from "@/hooks/useSupabaseData";
import { Logo } from "./brand";

export const Footer = () => {
  const { t, lang } = useI18n();
  const { data: contacts } = useContacts();
  const { data: categories } = useCategories();
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="container mx-auto py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="inline-block">
              <Logo height={56} />
            </div>
            <div className="text-xs uppercase tracking-[0.25em] opacity-70 mt-4">Beauty · Tashkent</div>
            <p className="mt-6 max-w-md font-display text-xl italic opacity-80">
              {t("footer.slogan")}
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg mb-4 text-gold">{t("nav.services")}</h3>
            <ul className="space-y-2 text-sm opacity-80">
              {categories?.slice(0, 4).map((cat) => (
                <li key={cat.id}><Link to="/services" className="hover:text-gold transition-colors">{lang === 'uz' ? cat.name_uz : cat.name_ru}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg mb-4 text-gold">{t("nav.contacts")}</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" />{contacts ? (lang === 'uz' ? contacts.address_uz : contacts.address_ru) : t("contacts.addressVal")}</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-gold" />{contacts?.phone || "+998 71 200 00 00"}</li>
              <li className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0 text-gold" />{contacts ? (lang === 'uz' ? contacts.working_hours_uz : contacts.working_hours_ru) : t("contacts.hoursVal")}</li>
              <li className="flex items-center gap-2"><Instagram size={16} className="text-gold" />{contacts?.instagram || "@mariso.tashkent"}</li>
              <li className="flex items-center gap-2"><MessageCircle size={16} className="text-gold" />{contacts?.telegram || "@mariso_bot"}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs opacity-60">
          <div>© {new Date().getFullYear()} MariSo. {t("footer.rights")}.</div>
        </div>
      </div>
    </footer>
  );
};
