import { useI18n, Lang } from "@/i18n/i18n";

export const Logo = ({ size = 44 }: { size?: number }) => {
  return (
    <div
      className="flex items-center justify-center rounded-xl shadow-gold"
      style={{
        width: size,
        height: size,
        background: "hsl(var(--primary))",
      }}
      aria-label="MariSo logo"
    >
      <div className="flex items-baseline text-primary-foreground font-display font-semibold leading-none" style={{ fontSize: size * 0.44 }}>
        <span>MariS</span>
        <span
          className="inline-block animate-mirror-spin ml-[1px]"
          style={{
            width: size * 0.28,
            height: size * 0.28,
            position: "relative",
          }}
          aria-hidden
        >
          <span
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: "hsl(var(--primary-foreground))" }}
          />
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              bottom: -size * 0.12,
              width: size * 0.04,
              height: size * 0.12,
              background: "hsl(var(--primary-foreground))",
            }}
          />
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              bottom: -size * 0.16,
              width: size * 0.14,
              height: size * 0.03,
              background: "hsl(var(--primary-foreground))",
            }}
          />
        </span>
      </div>
    </div>
  );
};

export const LangSwitch = () => {
  const { lang, setLang } = useI18n();
  const langs: Lang[] = ["ru", "uz"];
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card/60 backdrop-blur px-1 py-1 text-xs font-medium">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-full transition-colors ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={lang === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
