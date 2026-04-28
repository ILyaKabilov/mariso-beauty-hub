import { useI18n, Lang } from "@/i18n/i18n";

/**
 * MariSo logo — horizontal plate on red background.
 * Last "O" is a spinning round mirror on a stand.
 */
export const Logo = ({ height = 44 }: { height?: number; size?: number }) => {
  const h = height;
  const fontSize = h * 0.52;
  const mirrorSize = h * 0.42;

  return (
    <div
      className="flex items-center justify-center rounded-xl shadow-gold px-4"
      style={{
        height: h,
        minWidth: h * 3.2,
        background: "hsl(var(--primary))",
      }}
      aria-label="MariSo logo"
    >
      <div
        className="flex items-center text-primary-foreground font-display font-semibold leading-none tracking-wide"
        style={{ fontSize }}
      >
        <span>MariS</span>
        {/* Mirror "O" */}
        <span
          className="relative inline-block ml-[2px]"
          style={{
            width: mirrorSize,
            height: mirrorSize + h * 0.22,
          }}
          aria-hidden
        >
          {/* Mirror disc */}
          <span
            className="absolute left-0 top-0 rounded-full border-2 animate-mirror-spin"
            style={{
              width: mirrorSize,
              height: mirrorSize,
              borderColor: "hsl(var(--primary-foreground))",
              background:
                "radial-gradient(circle at 35% 30%, hsla(0,0%,100%,.4), hsla(0,0%,100%,0) 55%), hsl(var(--primary))",
              transformOrigin: "50% 50%",
            }}
          />
          {/* Stand pole */}
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              top: mirrorSize - 2,
              width: Math.max(2, h * 0.05),
              height: h * 0.16,
              background: "hsl(var(--primary-foreground))",
            }}
          />
          {/* Stand base */}
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              top: mirrorSize + h * 0.14,
              width: mirrorSize * 0.75,
              height: Math.max(2, h * 0.05),
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
