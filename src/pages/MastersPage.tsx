import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { masters } from "@/data/salon";

export const MastersPage = () => {
  const { t, lang } = useI18n();

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-24">
        <div className="container mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">MariSo</div>
          <h1 className="font-display text-5xl sm:text-6xl">{t("masters.title")}</h1>
          <p className="mt-4 opacity-80 max-w-xl mx-auto">{t("masters.subtitle")}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto grid md:grid-cols-2 gap-10">
          {masters.map((m, i) => (
            <div key={m.id} className="group bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500 flex flex-col sm:flex-row">
              <div className="sm:w-2/5 aspect-square sm:aspect-auto overflow-hidden">
                <img src={m.image} alt={m.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-gold mb-2">0{i + 1}</div>
                  <h2 className="font-display text-3xl">{m.name[lang]}</h2>
                  <div className="text-primary font-medium text-sm mt-1">{m.role[lang]}</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {m.experience} {t("masters.experience")}
                  </div>
                  <p className="text-sm text-muted-foreground mt-5 leading-relaxed">{m.bio[lang]}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {m.specialization.map((sp) => (
                      <span key={sp} className="text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {t(`cat.${sp}`)}
                      </span>
                    ))}
                  </div>
                </div>
                <Button asChild size="sm" className="mt-6 w-fit bg-primary hover:bg-primary/90">
                  <Link to={`/booking?master=${m.id}`}>{t("services.book")}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
