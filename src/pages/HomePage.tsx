import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Scissors, Flower2, Hand, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { categories as staticCategories } from "@/data/salon";
import { useMasters, useCategories } from "@/hooks/useSupabaseData";
import heroImg from "@/assets/hero-salon.jpg";

export const HomePage = () => {
  const { t, lang } = useI18n();
  const { data: masters, isLoading: mastersLoading } = useMasters();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  if (mastersLoading || categoriesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  const getCategoryImage = (cat: any) => {
    if (cat.image) return cat.image;
    const name = (cat.name_ru || "").toLowerCase();
    if (name.includes('стриж') || name.includes('уклад')) return staticCategories[0].image;
    if (name.includes('маник')) return staticCategories[1].image;
    if (name.includes('педик')) return staticCategories[2].image;
    if (name.includes('массаж')) return staticCategories[3].image;
    return staticCategories[4].image; // fallback/other
  };

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="MariSo salon" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-overlay" />
          <div className="absolute inset-0 bg-primary/30 mix-blend-multiply" />
        </div>

        <div className="container mx-auto relative z-10 text-primary-foreground">
          <div className="max-w-3xl fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 text-xs tracking-[0.25em] uppercase mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {t("hero.tagline")}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl leading-[1.05] whitespace-pre-line">
              {t("hero.title")}
            </h1>
            <p className="mt-8 text-lg sm:text-xl max-w-xl opacity-90 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-gradient-gold text-primary hover:opacity-90 shadow-gold h-14 px-8 text-base">
                <Link to="/booking">
                  {t("hero.cta")} <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/services">{t("hero.services")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 bg-gradient-soft">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">MariSo</div>
            <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-6">{t("home.aboutTitle")}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{t("home.aboutText")}</p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { n: t("home.val1Title"), l: t("home.val1Text") },
                { n: t("home.val2Title"), l: t("home.val2Text") },
                { n: t("home.val3Title"), l: t("home.val3Text") },
              ].map((s, i) => (
                <div key={i} className="border-l-2 border-gold pl-4">
                  <div className="font-display text-2xl text-primary leading-tight">{s.n}</div>
                  <div className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={staticCategories[0].image} alt="hair" className="w-full h-72 object-cover rounded-2xl shadow-soft" loading="lazy" />
            <img src={staticCategories[1].image} alt="manicure" className="w-full h-72 object-cover rounded-2xl shadow-soft mt-10" loading="lazy" />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">{t("nav.services")}</div>
            <h2 className="font-display text-4xl sm:text-5xl">{t("home.servicesTitle")}</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{t("home.servicesSubtitle")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(categories || []).slice(0, 4).map((cat) => {
              const bgImage = getCategoryImage(cat);
              return (
                <Link
                  key={cat.id}
                  to="/services"
                  className="group relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-elegant transition-all duration-500"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={bgImage}
                      alt={lang === 'uz' ? cat.name_uz : cat.name_ru}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[900ms]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground">
                    <h3 className="font-display text-2xl">{lang === 'uz' ? cat.name_uz : cat.name_ru}</h3>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("services.book")} <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/services">{t("home.viewAll")} <ArrowRight size={16} className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* MASTERS PREVIEW */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-gold opacity-10 blur-3xl rounded-full" />
        <div className="container mx-auto relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{t("nav.masters")}</div>
              <h2 className="font-display text-4xl sm:text-5xl">{t("masters.title")}</h2>
            </div>
            <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 w-fit">
              <Link to="/masters">{t("home.viewAllMasters") || "Смотреть всех мастеров"} <ArrowRight size={16} className="ml-2" /></Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(masters || []).slice(0, 4).map((m) => (
              <div key={m.id} className="group">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                  <img src={m.image} alt={lang === 'uz' ? m.name_uz : m.name_ru} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <h3 className="font-display text-2xl">{lang === 'uz' ? m.name_uz : m.name_ru}</h3>
                <div className="text-sm text-gold mt-1">{lang === 'uz' ? m.role_uz : m.role_ru}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-20 text-center text-primary-foreground shadow-elegant">
            <Sparkles className="absolute top-8 left-8 text-gold opacity-30" size={48} />
            <Sparkles className="absolute bottom-8 right-8 text-gold opacity-30" size={64} />
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl max-w-3xl mx-auto leading-tight">
              {t("footer.slogan")}
            </h2>
            <Button asChild size="lg" className="mt-10 bg-gradient-gold text-primary hover:opacity-90 h-14 px-10 text-base">
              <Link to="/booking">{t("hero.cta")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
