// Arxitektura invariantlarini grep bilan tekshiradi. Token sarflamaydi, har brief oxirida majburiy.
// Ishga tushirish: node scripts/check-invariants.mjs (yoki pnpm check ichida)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "migrations", "hujjatlar"]);

// Yo'l regex'i: "/" ikkala OS separatoriga, "." literal nuqtaga, "%" esa ".*" ga aylanadi.
const BS = String.fromCharCode(92); // backslash (tool'lar uni buzmasligi uchun)
const SEP = "[" + BS + "/]";
const path = (s) => new RegExp(s.split(".").join("[.]").split("/").join(SEP).split("%").join(".*"));

const RULES = [
  {
    id: "NO_DASH",
    files: /[.](ts|tsx|md|json|yml|yaml|prisma|conf|mjs)$/,
    exclude: path("locales/%.json$"),
    re: new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]"),
    msg: "uzun chiziq (U+2013/U+2014) - oddiy '-' ishlat",
  },
  {
    id: "TENANT_FROM_REQUEST",
    files: path("apps/server/src/%.ts$"),
    re: /req[.](body|query|params)[.]centerId|centerId\s*[:=]\s*req[.](body|query|params)/,
    msg: "centerId faqat req.centerId (JWT) dan olinadi",
  },
  {
    id: "PROCESS_ENV",
    files: path("apps/server/src/%.ts$"),
    exclude: path("config/(env|dotenv).ts$"),
    re: /process[.]env\b/,
    msg: "process.env faqat config/env.ts da; boshqa joyda `env` import qil",
  },
  {
    id: "PRISMA_OUTSIDE_REPOSITORY",
    files: path("apps/server/src/modules/%.(service|controller|routes).ts$"),
    re: /lib\/prisma[.]js|@prisma\/client/,
    msg: "Prisma faqat *.repository.ts da (service -> repository)",
  },
  {
    id: "NO_ANY",
    files: /[.](ts|tsx)$/,
    exclude: /[.]d[.]ts$/,
    re: /:\s*any\b|\bas\s+any\b|<any>/,
    msg: "any taqiqlangan: unknown + narrowing yoki aniq type",
  },
  {
    id: "CONSOLE_LOG",
    files: path("apps/(server|client)/src/%.(ts|tsx)$"),
    exclude: path("(src/index.ts|seed.ts)$"),
    re: /console[.]log\(/,
    msg: "console.log qoldirilmasin (server: console.warn/error errorHandler'da)",
  },
  {
    id: "HARDCODED_UI_TEXT",
    files: path("apps/client/src/%.tsx$"),
    re: />[^<>{}]*\b[OoGg]'[a-z]|(placeholder|title|label|aria-label)="[^"]*\b[OoGg]'[a-z]/,
    msg: "UI matni JSX ichida qattiq yozilgan - locales/uz/*.json + t() ishlat",
  },
  {
    id: "VALIDATE_MISSING",
    files: path("apps/server/src/modules/%.routes.ts$"),
    exclude: path("health.routes.ts$"),
    re: /[.](post|put|patch)\((?![^)]*validate)/,
    msg: "POST/PUT/PATCH endpointda validate({ body }) yo'q",
  },
];

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT, []);
const findings = [];
for (const file of files) {
  const rel = relative(ROOT, file);
  const applicable = RULES.filter((r) => r.files.test(rel) && !(r.exclude && r.exclude.test(rel)));
  if (applicable.length === 0) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const r of applicable) {
      if (r.re.test(line)) findings.push(`${rel}:${i + 1}  [${r.id}] ${r.msg}`);
    }
  });
}

if (findings.length) {
  console.error(`check-invariants: ${findings.length} ta muammo\n` + findings.join("\n"));
  process.exit(1);
}
console.log(`check-invariants: toza (${files.length} fayl)`);
