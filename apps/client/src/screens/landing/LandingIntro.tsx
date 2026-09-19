import type { CSSProperties } from "react";
import { ChevronDown, Brain, Users, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const FEATURES = [
  { key: "fast", icon: Zap },
  { key: "smart", icon: Brain },
  { key: "wide", icon: Users },
] as const;

/**
 * To'liq ekranli qora intro (referens: xdev landing): markazda logo + tagline, orqada aylanadigan orbita chiziqlari,
 * pastda sayyora gorizonti, skroll belgisi, chapda 3 xususiyat, o'ngda shior. Temaga bog'liq emas - doim qora.
 * Nav (LandingHeader) shu bo'lim ustida absolute turadi. Mavjud hero (LandingHero) pastda davom etadi.
 */
export function LandingIntro() {
  const { t } = useTranslation("landing");

  return (
    <section className="zx-intro relative flex min-h-svh flex-col overflow-hidden text-white">
      {/* Orbitalar: uch xil o'lcham va tezlik */}
      <div className="zx-orbit-scene" aria-hidden="true">
        <div
          className="zx-orbit"
          style={{ "--size": "115vw", "--speed": "46s", "--tilt": "-14deg" } as CSSProperties}
        >
          <span className="zx-orbit-dot" style={{ left: "8%", top: "22%" }} />
        </div>
        <div
          className="zx-orbit"
          style={{ "--size": "150vw", "--speed": "70s", "--tilt": "10deg" } as CSSProperties}
        >
          <span className="zx-orbit-dot" style={{ right: "12%", top: "30%" }} />
        </div>
        <div
          className="zx-orbit hidden lg:block"
          style={{ "--size": "190vw", "--speed": "95s", "--tilt": "-4deg" } as CSSProperties}
        />
      </div>

      {/* Sayyora gorizonti */}
      <div className="zx-planet" aria-hidden="true" />

      {/* Markaz */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-32 text-center sm:pb-48">
        <img
          src="/logo-zexn.png"
          alt="ZEXN.ai"
          className="zx-in w-[min(78vw,640px)] object-contain drop-shadow-[0_0_40px_rgba(217,249,68,0.25)]"
          style={{ "--d": "0.1s" } as CSSProperties}
        />
        <p
          className="zx-in mt-6 max-w-3xl text-lg font-light leading-snug text-white/90 sm:text-2xl lg:text-3xl"
          style={{ "--d": "0.35s" } as CSSProperties}
        >
          <span className="font-medium text-brand">{t("intro.taglineBrand")}</span>
          {" - "}
          {t("intro.tagline")}
        </p>
        <span
          className="zx-in mt-5 h-0.5 w-14 rounded-full bg-brand"
          style={{ "--d": "0.5s" } as CSSProperties}
        />
        <p
          className="zx-in mt-5 text-[11px] font-medium uppercase tracking-[0.35em] text-white/45 sm:text-xs"
          style={{ "--d": "0.65s" } as CSSProperties}
        >
          {t("intro.subline")}
        </p>
      </div>

      {/* Skroll belgisi */}
      <a
        href="#mahsulot"
        className="absolute bottom-14 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/60 transition-colors hover:text-brand sm:flex"
        aria-label={t("intro.scroll")}
      >
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-current pt-1.5">
          <span className="zx-scroll-dot h-1.5 w-1.5 rounded-full bg-current" />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.3em]">
          {t("intro.scroll")}
        </span>
        <ChevronDown className="zx-bounce h-4 w-4" />
      </a>

      {/* Pastki qator: chapda xususiyatlar, o'ngda shior */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 sm:px-8 sm:pb-7">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <ul className="flex flex-wrap gap-x-7 gap-y-3">
            {FEATURES.map((feature) => (
              <li key={feature.key} className="flex items-center gap-2.5">
                <feature.icon className="h-5 w-5 shrink-0 text-white" />
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-white">
                    {t(`intro.features.${feature.key}.title`)}
                  </span>
                  <span className="block text-xs text-white/55">
                    {t(`intro.features.${feature.key}.sub`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="hidden items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-white/70 sm:flex">
            <span className="h-px w-16 bg-white/60" />
            {t("intro.motto")}
          </p>
        </div>
      </div>
    </section>
  );
}
