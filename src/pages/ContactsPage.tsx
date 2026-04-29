import { useEffect } from "react";
import { MapPin, Phone, Clock, Instagram, MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { useContacts } from "@/hooks/useSupabaseData";

export const ContactsPage = () => {
  const { t, lang } = useI18n();
  const { data: contacts } = useContacts();

  const items = [
    { Icon: MapPin, label: t("contacts.address"), value: contacts ? (lang === 'uz' ? contacts.address_uz : contacts.address_ru) : t("contacts.addressVal") },
    { Icon: Phone, label: t("contacts.phone"), value: contacts?.phone || "+998 71 200 00 00" },
    { Icon: Clock, label: t("contacts.hours"), value: contacts ? (lang === 'uz' ? contacts.working_hours_uz : contacts.working_hours_ru) : t("contacts.hoursVal") },
    { Icon: Instagram, label: "Instagram", value: contacts?.instagram || "@mariso.tashkent" },
    { Icon: MessageCircle, label: "Telegram", value: contacts?.telegram || "@mariso_bot" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-24">
        <div className="container mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">MariSo</div>
          <h1 className="font-display text-5xl sm:text-6xl">{t("contacts.title")}</h1>
          <p className="mt-4 opacity-80 max-w-xl mx-auto">{t("contacts.subtitle")}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12">
          <div className="space-y-5">
            {items.map(({ Icon, label, value }, i) => (
              <div key={i} className="flex items-start gap-5 p-6 rounded-2xl bg-card shadow-soft hover:shadow-elegant transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0 shadow-gold">
                  <Icon size={22} className="text-primary" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
                  <div className="text-lg font-medium mt-1">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl overflow-hidden shadow-elegant h-[500px] lg:h-auto">
            <iframe
              title="MariSo Tashkent map"
              src={contacts?.map_url || "https://www.openstreetmap.org/export/embed.html?bbox=69.24%2C41.29%2C69.32%2C41.33&layer=mapnik&marker=41.311%2C69.279"}
              className="w-full h-full min-h-[400px] border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
};
