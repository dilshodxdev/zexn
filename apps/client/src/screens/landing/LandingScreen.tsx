import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  GraduationCap,
  HelpCircle,
  Radio,
  School,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Button, Card } from "@/components/ui";
import { ROUTES } from "@/routes";

export function LandingScreen() {
  const { t } = useTranslation("landing");

  return (
    <div className="flex min-h-full flex-col bg-bg text-text selection:bg-brand selection:text-bg">
      {/* Header bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link to={ROUTES.home} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-alt text-brand border border-line font-mono font-black text-sm">
              Z
            </div>
            <span className="font-mono text-lg font-black tracking-tight text-text">
              ZEXN<span className="text-brand">.ai</span>
            </span>
          </Link>

          <div>
            <Link to={ROUTES.login}>
              <Button variant="primary" size="sm">
                {t("header.start")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section: Typography and big statement from slide */}
      <section className="pt-10 pb-6 sm:pt-14 sm:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
            {/* Left: Brand title + Key Metrics */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-text leading-none">
                  {t("hero.brandName")}
                  <span className="text-brand">{t("hero.brandDot")}</span>
                </h1>
              </div>

              {/* Stats: 30 o'quvchi bitta sinf, 1 shaxsiy yo'l */}
              <div className="flex items-center gap-10 pt-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-4xl sm:text-5xl font-black text-text leading-none">
                    {t("hero.stat1Num")}
                  </span>
                  <div className="text-xs text-muted leading-tight font-medium">
                    <p className="font-semibold text-text">{t("hero.stat1LabelLine1")}</p>
                    <p className="text-muted">{t("hero.stat1LabelLine2")}</p>
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-line" />

                <div className="flex items-center gap-3">
                  <span className="font-mono text-4xl sm:text-5xl font-black text-text leading-none">
                    {t("hero.stat2Num")}
                  </span>
                  <div className="text-xs text-muted leading-tight font-medium">
                    <p className="font-semibold text-text">{t("hero.stat2LabelLine1")}</p>
                    <p className="text-muted">{t("hero.stat2LabelLine2")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Headline statement */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full pt-1 lg:pt-3">
              <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-text leading-snug tracking-tight">
                {t("hero.headline")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Panoramic Banner Card matching the center panoramic slide */}
      <section className="py-4 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-10 shadow-pop">
            {/* Background subtle code / architecture layer */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] select-none font-mono text-[10px] leading-relaxed p-6 overflow-hidden">
              <p>const analyzeTrajectory = (studentId, topicTree) =&gt; &#123;</p>
              <p>&nbsp;&nbsp;const gaps = evaluateKnowledgeGaps(topicTree);</p>
              <p>&nbsp;&nbsp;return gaps.map(g =&gt; findRootCauseNode(g));</p>
              <p>&#125;;</p>
              <p>
                export const ZEXN_AI_ENGINE = &#123; personalLearning: true, model: &quot;v2&quot;
                &#125;;
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left col: Pill badge + Slogan + Connected glass cards node chain */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-alt/90 px-3.5 py-1 text-xs font-semibold text-text shadow-sm backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                  <span>{t("hero.bannerPill")}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text leading-tight">
                  {t("hero.bannerTitleLine1")}
                  <br />
                  {t("hero.bannerTitleLine2")}
                </h2>

                {/* Node chain graphic: Dot -> Glass Card (Chart) -> Glass Card (Book) */}
                <div className="pt-2 flex items-center gap-3 sm:gap-4">
                  {/* Origin Dot */}
                  <div className="flex h-3 w-3 items-center justify-center rounded-full bg-text shadow-sm" />

                  {/* Connecting Line 1 */}
                  <div className="h-[1px] w-6 sm:w-10 bg-line" />

                  {/* Glass Card 1: Bar Chart */}
                  <div className="glass-node-card flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl">
                    <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-brand" />
                  </div>

                  {/* Connecting Line 2 */}
                  <div className="h-[1px] w-6 sm:w-10 bg-line" />

                  {/* Glass Card 2: Open Book */}
                  <div className="glass-node-card flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl">
                    <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-text" />
                  </div>
                </div>
              </div>

              {/* Middle col: Core explanation and action */}
              <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
                <p className="text-xs sm:text-sm text-text font-medium leading-relaxed max-w-sm">
                  {t("hero.bannerDesc")}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <Link to={ROUTES.register}>
                    <Button variant="primary" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                      {t("hero.ctaPrimary")}
                    </Button>
                  </Link>
                  <a href="#muammo">
                    <Button variant="secondary" size="sm">
                      {t("hero.ctaSecondary")}
                    </Button>
                  </a>
                </div>
              </div>

              {/* Right col: Bright Star Badge + 3D Obsidian Sphere with Asterisk + Pilot label */}
              <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-between gap-6">
                {/* Yellow rounded square with star in top right corner */}
                <div className="self-end hidden sm:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-brand text-bg shadow-md">
                  <Sparkles className="h-5 w-5 fill-current" />
                </div>

                {/* 3D Glossy Sphere with Orbit and Glowing Asterisk */}
                <div className="relative my-2 flex items-center justify-center">
                  <div className="obsidian-sphere relative z-10 flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full">
                    <span className="sphere-asterisk-glow font-mono text-4xl sm:text-5xl font-black text-brand select-none">
                      ✱
                    </span>
                  </div>
                  {/* Orbit ring around sphere */}
                  <div className="orbit-ring pointer-events-none absolute h-40 w-40 sm:h-48 sm:w-48 -inset-4 sm:-inset-6" />
                </div>

                {/* Pilot label */}
                <div className="text-center lg:text-right">
                  <p className="font-mono text-xs text-muted">{t("hero.bannerPilot")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Muammo Section */}
      <section id="muammo" className="border-t border-line py-12 sm:py-16 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-10 text-center">
            <Badge tone="warn" className="mb-3">
              {t("problem.badge")}
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-text">
              {t("problem.title")}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted max-w-xl mx-auto">
              {t("problem.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Card className="flex flex-col gap-2">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-alt text-warn border border-line">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-text">{t("problem.card1Title")}</h3>
              <p className="text-xs text-muted leading-relaxed">{t("problem.card1Desc")}</p>
            </Card>

            <Card className="flex flex-col gap-2">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-alt text-warn border border-line">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-text">{t("problem.card2Title")}</h3>
              <p className="text-xs text-muted leading-relaxed">{t("problem.card2Desc")}</p>
            </Card>

            <Card className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-alt text-warn border border-line">
                <Radio className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-text">{t("problem.card3Title")}</h3>
              <p className="text-xs text-muted leading-relaxed">{t("problem.card3Desc")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Qanday ishlaydi Section */}
      <section className="border-t border-line py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-10 text-center">
            <Badge tone="brand" className="mb-3">
              {t("howItWorks.badge")}
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-text">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted max-w-xl mx-auto">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Card className="flex flex-col gap-2">
              <span className="font-mono text-xs font-bold text-brand">01</span>
              <h3 className="text-sm font-semibold text-text">{t("howItWorks.step1Title")}</h3>
              <p className="text-xs text-muted leading-relaxed">{t("howItWorks.step1Desc")}</p>
            </Card>

            <Card className="flex flex-col gap-2">
              <span className="font-mono text-xs font-bold text-brand">02</span>
              <h3 className="text-sm font-semibold text-text">{t("howItWorks.step2Title")}</h3>
              <p className="text-xs text-muted leading-relaxed">{t("howItWorks.step2Desc")}</p>
            </Card>

            <Card className="flex flex-col gap-2">
              <span className="font-mono text-xs font-bold text-brand">03</span>
              <h3 className="text-sm font-semibold text-text">{t("howItWorks.step3Title")}</h3>
              <p className="text-xs text-muted leading-relaxed">{t("howItWorks.step3Desc")}</p>
            </Card>

            <Card className="flex flex-col gap-2">
              <span className="font-mono text-xs font-bold text-brand">04</span>
              <h3 className="text-sm font-semibold text-text">{t("howItWorks.step4Title")}</h3>
              <p className="text-xs text-muted leading-relaxed">{t("howItWorks.step4Desc")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Kim uchun Section */}
      <section className="border-t border-line py-12 sm:py-16 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-10 text-center">
            <Badge tone="info" className="mb-3">
              {t("whoIsItFor.badge")}
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-text">
              {t("whoIsItFor.title")}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted max-w-xl mx-auto">
              {t("whoIsItFor.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-text">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-alt text-brand border border-line">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold">{t("whoIsItFor.studentTitle")}</h3>
              </div>
              <ul className="flex flex-col gap-2 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-brand">•</span>
                  <span>{t("whoIsItFor.studentBenefit1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand">•</span>
                  <span>{t("whoIsItFor.studentBenefit2")}</span>
                </li>
              </ul>
            </Card>

            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-text">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-alt text-brand border border-line">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold">{t("whoIsItFor.teacherTitle")}</h3>
              </div>
              <ul className="flex flex-col gap-2 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-brand">•</span>
                  <span>{t("whoIsItFor.teacherBenefit1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand">•</span>
                  <span>{t("whoIsItFor.teacherBenefit2")}</span>
                </li>
              </ul>
            </Card>

            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-text">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-alt text-brand border border-line">
                  <School className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold">{t("whoIsItFor.centerTitle")}</h3>
              </div>
              <ul className="flex flex-col gap-2 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-brand">•</span>
                  <span>{t("whoIsItFor.centerBenefit1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand">•</span>
                  <span>{t("whoIsItFor.centerBenefit2")}</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-line py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Card className="border-line bg-surface p-8 sm:p-12 shadow-pop">
            <h2 className="text-2xl font-bold sm:text-3xl text-text">{t("cta.title")}</h2>
            <p className="mt-3 text-xs sm:text-sm text-muted max-w-lg mx-auto">
              {t("cta.subtitle")}
            </p>
            <div className="mt-6 flex justify-center">
              <Link to={ROUTES.register}>
                <Button variant="primary" size="lg" icon={<Sparkles className="h-4 w-4" />}>
                  {t("cta.button")}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-line py-6 text-center text-xs text-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex items-center justify-center">
          <p className="font-mono text-xs text-muted">{t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
