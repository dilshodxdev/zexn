import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/routes";

const NAV = [
  { key: "product", href: "#mahsulot" },
  { key: "solutions", href: "#yechimlar" },
  { key: "partners", href: "#hamkorlik" },
  { key: "about", href: "#biz-haqimizda" },
] as const;

/**
 * Intro ustida shaffof nav (referens: xdev): logo, bo'limlarga anchor havolalar, "Kirish", chegarali lime "Boshlash".
 * Intro doim qora, shuning uchun bu header ham oq matnli - tema tokenlariga bog'lanmagan.
 */
export function LandingHeader() {
  const { t } = useTranslation("landing");

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
        <Link to={ROUTES.home} className="flex items-center" aria-label="ZEXN">
          <img src="/logo-zexn.png" alt="ZEXN" className="h-8 w-auto object-contain sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-white/85 md:flex">
          {NAV.map((item) => (
            <a key={item.key} href={item.href} className="transition-colors hover:text-brand">
              {t(`header.nav.${item.key}`)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to={ROUTES.login}
            className="hidden min-h-[44px] items-center text-sm text-white/85 transition-colors hover:text-brand sm:flex"
          >
            {t("header.login")}
          </Link>
          <Link
            to={ROUTES.register}
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-brand px-5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-black"
          >
            {t("header.start")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
