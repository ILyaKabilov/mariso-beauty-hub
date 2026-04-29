import { useI18n, Lang } from "@/i18n/i18n";

/**
 * MariSo logo — horizontal plate on red background.
 * Last "O" is a spinning round mirror on a stand.
 */
export const Logo = ({ height = 44 }: { height?: number; size?: number }) => {
  return (
    <img 
      src="/logo.png" 
      alt="MariSo logo" 
      style={{ height }}
      className="object-contain"
    />
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
