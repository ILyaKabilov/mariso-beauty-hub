import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { useServices, useCategories, getGroupedServices } from "@/hooks/useSupabaseData";
import { categories as staticCategories } from "@/data/salon";

export const ServicesPage = () => {
  const { t, lang } = useI18n();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (servicesLoading || categoriesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  const grouped = getGroupedServices(services || [], categories || []);

  const getCategoryImage = (cat: any) => {
    if (cat.image) return cat.image;
    const name = (cat.name_ru || "").toLowerCase();
    if (name.includes('стриж') || name.includes('уклад')) return staticCategories[0].image;
    if (name.includes('маник')) return staticCategories[1].image;
    if (name.includes('педик')) return staticCategories[2].image;
    if (name.includes('массаж')) return staticCategories[3].image;
    return staticCategories[4].image;
  };

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-24">
        <div className="container mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">MariSo</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">{t("services.title")}</h1>
          <p className="mt-4 opacity-80 max-w-xl mx-auto">{t("services.subtitle")}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto space-y-16 sm:space-y-24">
          {grouped.map((group, idx) => {
            const bgImage = getCategoryImage(group);
            return (
            <div key={group.id} className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${idx % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}>
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant">
                  <img src={bgImage} alt={lang === 'uz' ? group.name_uz : group.name_ru} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 h-20 w-20 sm:h-28 sm:w-28 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                  <span className="font-display text-2xl sm:text-3xl text-primary">{String(idx + 1).padStart(2, "0")}</span>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">0{idx + 1} / 0{grouped.length}</div>
                <h2 className="font-display text-3xl sm:text-4xl mb-6 sm:mb-8">{lang === 'uz' ? group.name_uz : group.name_ru}</h2>
                <div className="divide-y divide-border">
                  {group.services.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-4 gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-lg">{lang === 'uz' ? s.name_uz : s.name_ru}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock size={12} /> {s.duration} {t("services.duration")}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-muted-foreground">{t("services.from")}</div>
                        <div className="font-display text-2xl text-primary">
                          {s.price.toLocaleString("ru-RU")} <span className="text-sm font-body">{t("services.sum")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90">
                  <Link to="/booking">{t("services.book")}</Link>
                </Button>
              </div>
            </div>
          )})}
        </div>
      </section>
    </>
  );
};
