import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { useMasters, useMasterServices, useCategories } from "@/hooks/useSupabaseData";

export const MastersPage = () => {
  const { t, lang } = useI18n();
  const { data: masters, isLoading: mastersLoading } = useMasters();
  const { data: masterServices, isLoading: msLoading } = useMasterServices();
  const { data: categories, isLoading: catLoading } = useCategories();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (mastersLoading || msLoading || catLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-24">
        <div className="container mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">MariSo</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">{t("masters.title")}</h1>
          <p className="mt-4 opacity-80 max-w-xl mx-auto">{t("masters.subtitle")}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto grid md:grid-cols-2 gap-6 sm:gap-10">
          {masters?.map((m, i) => {
            const masterServiceIds = masterServices?.filter(ms => ms.master_id === m.id).map(ms => ms.service_id) || [];
            // Assuming we'd fetch actual service category_id's later, but for now we skip tags or just show "Master"
            return (
            <div key={m.id} className="group bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500 flex flex-col sm:flex-row">
              <div className="sm:w-2/5 aspect-square sm:aspect-auto overflow-hidden">
                <img src={m.image} alt={lang === 'uz' ? m.name_uz : m.name_ru} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-gold mb-2">0{i + 1}</div>
                  <h2 className="font-display text-2xl sm:text-3xl">{lang === 'uz' ? m.name_uz : m.name_ru}</h2>
                  <div className="text-primary font-medium text-sm mt-1">{lang === 'uz' ? m.role_uz : m.role_ru}</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {m.experience} {t("masters.experience")}
                  </div>
                  <p className="text-sm text-muted-foreground mt-5 leading-relaxed">{lang === 'uz' ? m.bio_uz : m.bio_ru}</p>
                </div>
                <Button asChild size="sm" className="mt-6 w-fit bg-primary hover:bg-primary/90">
                  <Link to={`/booking?master=${m.id}`}>{t("services.book")}</Link>
                </Button>
              </div>
            </div>
          )})}
        </div>
      </section>
    </>
  );
};
