import { useI18n, Lang } from "@/i18n/i18n";

/**
 * MariSo logo — horizontal plate on red background.
 * Last "O" is a spinning round mirror on a stand.
 */
export const Logo = ({ height = 44 }: { height?: number; size?: number }) => {
  const h = height;
  const fontSize = h * 0.52;
  const mirrorSize = h * 0.42;
  // Offset so mirror disc sits aligned with other letters; stand drops below baseline
  const mirrorTop = h * 0.22;
  const poleHeight = h * 0.1;
  const poleWidth = Math.max(1.5, h * 0.035);
  const baseWidth = mirrorSize * 0.55;

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
            height: fontSize + poleHeight + h * 0.04,
          }}
          aria-hidden
        >
          {/* Mirror disc — aligned with other letters */}
          <span
            className="absolute left-0 rounded-full border-2 animate-mirror-spin"
            style={{
              top: fontSize - mirrorSize,
              width: mirrorSize,
              height: mirrorSize,
              borderColor: "hsl(var(--primary-foreground))",
              background:
                "radial-gradient(circle at 35% 30%, hsla(0,0%,100%,.4), hsla(0,0%,100%,0) 55%), hsl(var(--primary))",
              transformOrigin: "50% 50%",
            }}
          />
          {/* Stand pole — drops below baseline like descender of "у" */}
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              top: fontSize - 1,
              width: poleWidth,
              height: poleHeight,
              background: "hsl(var(--primary-foreground))",
            }}
          />
          {/* Stand base */}
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-sm"
            style={{
              top: fontSize + poleHeight - 1,
              width: baseWidth,
              height: Math.max(1.5, h * 0.035),
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
