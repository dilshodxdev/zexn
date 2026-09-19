import type { CSSProperties } from "react";
import { ArrowRight, BarChart3, BookOpen, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { ROUTES } from "@/routes";
import { HeroTwinCard } from "./HeroTwinCard";

export function LandingHero() {
  const { t } = useTranslation("landing");

  return (
    <>
      {/* Hero section: Typography and big statement */}
      <section id="mahsulot" className="scroll-mt-4 pt-10 pb-6 sm:pt-14 sm:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-12">
            {/* Left: Brand title + Key Metrics */}
            <div className="zx-in space-y-6 lg:col-span-6">
              <div>
                <h1 className="text-6xl font-black leading-none tracking-tighter text-text sm:text-7xl lg:text-8xl">
                  {t("hero.brandName")}
                  <span className="text-brand">{t("hero.brandDot")}</span>
                </h1>
              </div>

              {/* Stats: 30 o'quvchi bitta sinf, 1 shaxsiy yo'l */}
              <div className="flex items-center gap-10 pt-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-4xl font-black leading-none text-text sm:text-5xl">
                    {t("hero.stat1Num")}
                  </span>
                  <div className="text-xs font-medium leading-tight text-muted">
                    <p className="font-semibold text-text">{t("hero.stat1LabelLine1")}</p>
                    <p className="text-muted">{t("hero.stat1LabelLine2")}</p>
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-line" />

                <div className="flex items-center gap-3">
                  <span className="font-mono text-4xl font-black leading-none text-text sm:text-5xl">
                    {t("hero.stat2Num")}
                  </span>
                  <div className="text-xs font-medium leading-tight text-muted">
                    <p className="font-semibold text-text">{t("hero.stat2LabelLine1")}</p>
                    <p className="text-muted">{t("hero.stat2LabelLine2")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Headline statement */}
            <div
              className="zx-in flex h-full flex-col justify-between pt-1 lg:col-span-6 lg:pt-3"
              style={{ "--d": "0.15s" } as CSSProperties}
            >
              <p className="text-xl font-medium leading-snug tracking-tight text-text sm:text-2xl lg:text-3xl">
                {t("hero.headline")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Panoramic Banner Card matching the center panoramic slide */}
      <section className="py-4 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-pop sm:p-10">
            {/* Background subtle code / architecture layer */}
            <div className="pointer-events-none absolute inset-0 select-none overflow-hidden p-6 font-mono text-[10px] leading-relaxed opacity-[0.03]">
              <p>const analyzeTrajectory = (studentId, topicTree) =&gt; &#123;</p>
              <p>&nbsp;&nbsp;const gaps = evaluateKnowledgeGaps(topicTree);</p>
              <p>&nbsp;&nbsp;return gaps.map(g =&gt; findRootCauseNode(g));</p>
              <p>&#125;;</p>
              <p>
                export const ZEXN_AI_ENGINE = &#123; personalLearning: true, model: &quot;v2&quot;
                &#125;;
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              {/* Left col: Pill badge + Slogan + Connected glass cards node chain */}
              <div
                className="zx-in space-y-6 lg:col-span-5"
                style={{ "--d": "0.25s" } as CSSProperties}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-alt/90 px-3.5 py-1 text-xs font-semibold text-text shadow-sm backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                  <span>{t("hero.bannerPill")}</span>
                </div>

                <h2 className="text-3xl font-black leading-tight tracking-tight text-text sm:text-4xl lg:text-5xl">
                  {t("hero.bannerTitleLine1")}
                  <br />
                  {t("hero.bannerTitleLine2")}
                </h2>

                {/* Node chain graphic: Dot -> Glass Card (Chart) -> Glass Card (Book) */}
                <div className="flex items-center gap-3 pt-2 sm:gap-4">
                  {/* Origin Dot */}
                  <div className="flex h-3 w-3 items-center justify-center rounded-full bg-text shadow-sm" />

                  {/* Connecting Line 1 */}
                  <div className="h-[1px] w-6 bg-line sm:w-10" />

                  {/* Glass Card 1: Bar Chart */}
                  <div className="glass-node-card flex h-14 w-14 items-center justify-center rounded-2xl sm:h-16 sm:w-16">
                    <BarChart3 className="h-6 w-6 text-brand sm:h-7 sm:w-7" />
                  </div>

                  {/* Connecting Line 2 */}
                  <div className="h-[1px] w-6 bg-line sm:w-10" />

                  {/* Glass Card 2: Open Book */}
                  <div className="glass-node-card flex h-14 w-14 items-center justify-center rounded-2xl sm:h-16 sm:w-16">
                    <BookOpen className="h-6 w-6 text-text sm:h-7 sm:w-7" />
                  </div>
                </div>
              </div>

              {/* Middle col: Core explanation and action */}
              <div
                className="zx-in flex flex-col justify-center space-y-4 lg:col-span-4"
                style={{ "--d": "0.35s" } as CSSProperties}
              >
                <p className="max-w-sm text-xs font-medium leading-relaxed text-text sm:text-sm">
                  {t("hero.bannerDesc")}
                </p>

                {/* SDT: raqamli egizak haqida */}
                <div className="flex max-w-sm items-start gap-3 rounded-2xl border border-brand/30 bg-brand-soft p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-bg">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-text">{t("hero.sdtTitle")}</p>
                    <p className="text-muted">{t("hero.sdtDesc")}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <Link to={ROUTES.register} className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ArrowRight className="h-4 w-4" />}
                      className="w-full min-h-[44px] sm:w-auto"
                    >
                      {t("hero.ctaPrimary")}
                    </Button>
                  </Link>
                  <a href="#muammo" className="w-full sm:w-auto">
                    <Button variant="secondary" size="sm" className="w-full min-h-[44px] sm:w-auto">
                      {t("hero.ctaSecondary")}
                    </Button>
                  </a>
                </div>
              </div>

              {/* Right col: jonli SDT kartasi + pilot */}
              <div className="flex flex-col items-center gap-4 lg:col-span-3 lg:items-end">
                <HeroTwinCard />
                <p className="font-mono text-xs text-muted lg:text-right">
                  {t("hero.bannerPilot")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
