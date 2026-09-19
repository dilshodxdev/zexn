import { LandingHeader } from "./LandingHeader";
import { LandingIntro } from "./LandingIntro";
import { LandingHero } from "./LandingHero";
import { LandingProblems } from "./LandingProblems";
import { LandingSdtSection } from "./LandingSdtSection";
import { LandingClosedLoop } from "./LandingClosedLoop";
import { LandingAudience } from "./LandingAudience";
import { LandingCta } from "./LandingCta";
import { LandingFooter } from "./LandingFooter";
import { Reveal } from "./Reveal";

export function LandingScreen() {
  return (
    <div className="flex min-h-full flex-col bg-bg text-text selection:bg-brand selection:text-bg">
      <LandingHeader />
      <main className="flex-1">
        <LandingIntro />
        <LandingHero />
        <Reveal>
          <LandingProblems />
        </Reveal>
        <Reveal>
          <LandingSdtSection />
        </Reveal>
        <Reveal>
          <LandingClosedLoop />
        </Reveal>
        <Reveal>
          <LandingAudience />
        </Reveal>
        <Reveal>
          <LandingCta />
        </Reveal>
      </main>
      <LandingFooter />
    </div>
  );
}
