import type { CSSProperties } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DemoSkill {
  key: "jsx" | "props" | "state";
  value: number;
  tone: "ok" | "warn" | "danger";
}

const SKILLS: DemoSkill[] = [
  { key: "jsx", value: 92, tone: "ok" },
  { key: "props", value: 86, tone: "ok" },
  { key: "state", value: 42, tone: "danger" },
];

const RING_SIZE = 72;
const RING_STROKE = 6;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;
const OVERALL = 61;

/**
 * Hero'dagi statik-lekin-jonli SDT kartasi: mastery halqasi to'ladi, skill barlar o'sadi,
 * pattern badge va tavsiya ketma-ket chiqadi. API yo'q - ilovadagi haqiqiy egizakning namunasi.
 */
export function HeroTwinCard() {
  const { t } = useTranslation("landing");
  const toneBar = { ok: "bg-ok", warn: "bg-warn", danger: "bg-danger" } as const;
  const toneText = { ok: "text-ok", warn: "text-warn", danger: "text-danger" } as const;

  return (
    <div className="zx-pop w-full max-w-xs" style={{ "--d": "0.35s" } as CSSProperties}>
      <div className="zx-float relative rounded-3xl border border-line bg-bg/80 p-4 shadow-pop backdrop-blur-md sm:p-5">
        <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-bg shadow-md">
          <Sparkles className="h-4 w-4 fill-current" />
        </div>

        {/* Sarlavha: avatar + ism + daraja + halqa */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-bg">
            N
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text">{t("hero.twin.name")}</p>
            <p className="text-[11px] text-muted">{t("hero.twin.level")}</p>
          </div>
          <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
            <svg className="-rotate-90" width={RING_SIZE} height={RING_SIZE} aria-hidden="true">
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                stroke="currentColor"
                strokeWidth={RING_STROKE}
                fill="none"
                className="text-surface-alt"
              />
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                stroke="currentColor"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={RING_C}
                className="zx-ring text-brand"
                style={
                  {
                    "--ring-c": RING_C,
                    "--ring-o": RING_C - (OVERALL / 100) * RING_C,
                    "--d": "0.7s",
                  } as CSSProperties
                }
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-text">
              {OVERALL}%
            </span>
          </div>
        </div>

        {/* Skill barlar */}
        <div className="mt-4 space-y-2.5">
          {SKILLS.map((skill, i) => (
            <div key={skill.key}>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-text">
                  {t(`hero.twin.skills.${skill.key}`)}
                </span>
                <span className={`font-mono font-bold ${toneText[skill.tone]}`}>
                  {skill.value}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
                <div
                  className={`zx-bar h-full rounded-full ${toneBar[skill.tone]}`}
                  style={
                    { "--bar": `${skill.value}%`, "--d": `${0.8 + i * 0.2}s` } as CSSProperties
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pattern badge */}
        <div
          className="zx-in mt-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2"
          style={{ "--d": "1.6s" } as CSSProperties}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
          <div className="min-w-0 text-[11px] leading-tight">
            <p className="font-semibold text-text">{t("hero.twin.pattern")}</p>
            <p className="text-muted">{t("hero.twin.patternSub")}</p>
          </div>
        </div>

        {/* ZEXN tavsiyasi */}
        <div
          className="zx-in zx-shimmer relative mt-2 overflow-hidden rounded-xl bg-brand px-3 py-2 text-bg"
          style={{ "--d": "2.1s" } as CSSProperties}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            {t("hero.twin.nextLabel")}
          </p>
          <p className="text-xs font-semibold leading-snug">{t("hero.twin.next")}</p>
        </div>
      </div>
    </div>
  );
}
