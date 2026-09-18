// Task board: docs/tasks/T-*.md sarlavhalaridan (Status, Assignee, Depends) holatni o'qiydi.
//   pnpm board                      - jadval
//   pnpm board next <agent>         - agentning hozirgi taski + prompt
//   pnpm board prompt <agent>       - faqat prompt (nusxa olish uchun)
//   pnpm board set T-005 REVIEW [izoh]
//   pnpm board run codex | gemini   - CLI orqali ijrochini hozirgi task bilan ishga tushiradi (log: docs/agent-log/runs)
import {
  createWriteStream,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const ROOT = process.cwd();
const TASKS_DIR = join(ROOT, "docs", "tasks");
const STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "CHANGES_REQUESTED",
  "BLOCKED",
  "DONE",
  "REJECTED",
];
const ACTIVE = new Set(["IN_PROGRESS", "CHANGES_REQUESTED"]);

const CHECK = {
  gemini: "pnpm check:client",
  gpt: "pnpm check:server",
  codex: "pnpm check:server",
  claude: "pnpm check",
};

const AGENTS = {
  gemini: {
    role: "client ijrochisi (apps/client)",
    rules: ["GEMINI.md", "apps/client/AGENTS.md"],
  },
  gpt: {
    role: "server/admin ijrochisi",
    rules: ["AGENTS.md", "apps/server/AGENTS.md", "apps/client/AGENTS.md"],
  },
  codex: {
    role: "server ijrochisi (apps/server)",
    rules: ["AGENTS.md", "apps/server/AGENTS.md"],
  },
  claude: {
    role: "orkestrator + reviewer",
    rules: ["CLAUDE.md", ".claude/rules/REVIEW.md"],
  },
};

function parseTask(file) {
  const text = readFileSync(join(TASKS_DIR, file), "utf8");
  const id = file.slice(0, 5);
  const title = (text.match(/^# T-\d{3} - (.+)$/m) || [])[1] || file;
  const status = (text.match(/^\*\*Status:\*\*\s*([A-Z_]+)(.*)$/m) || []).slice(1);
  const assignee = ((text.match(/^\*\*Assignee:\*\*\s*(\S+)/m) || [])[1] || "-").toLowerCase();
  const depends = ((text.match(/^\*\*Depends:\*\*\s*(.+)$/m) || [])[1] || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^T-\d{3}$/.test(s));
  const questions = ((text.split("## Questions")[1] || "").split("## ")[0] || "").trim();
  return {
    id,
    file,
    title,
    status: status[0] || "TODO",
    note: (status[1] || "").trim(),
    assignee,
    depends,
    questions,
  };
}

function loadTasks() {
  return readdirSync(TASKS_DIR)
    .filter((f) => /^T-\d{3}-.*\.md$/.test(f))
    .sort()
    .map(parseTask);
}

function isReady(task, all) {
  return task.depends.every((d) => all.find((t) => t.id === d)?.status === "DONE");
}

function currentFor(agent, all) {
  const mine = all.filter((t) => t.assignee === agent && !["DONE", "REJECTED"].includes(t.status));
  return (
    mine.find((t) => ACTIVE.has(t.status)) ||
    mine.find((t) => t.status === "BLOCKED") ||
    mine.find((t) => t.status === "TODO" && isReady(t, all)) ||
    null
  );
}

function prompt(agent, task) {
  const a = AGENTS[agent];
  if (!a) throw new Error(`Noma'lum agent: ${agent}. Mavjud: ${Object.keys(AGENTS).join(", ")}`);
  if (!task)
    return `${agent}: hozir tayyor task yo'q (bog'liqliklar kutilmoqda yoki hammasi DONE).`;
  if (agent === "claude") {
    return `Task ${task.id} (${task.status}): docs/tasks/${task.file}. Review qil (.claude/rules/REVIEW.md), keyin pnpm board set.`;
  }
  const waiting =
    task.status === "BLOCKED"
      ? `\nStatus BLOCKED edi - Questions'ga javob task faylida, qayta o'qi.`
      : "";
  const fix =
    task.status === "CHANGES_REQUESTED"
      ? `\nReview findings bo'limidagi topilmalarni tuzat, boshqa narsaga tegma.`
      : "";
  return (
    `Sen ZEXN loyihasida ${a.role}san. Avval ${a.rules.join(", ")} ni o'qi.\n` +
    `Vazifa: docs/tasks/${task.file} ni bajar (${task.id} - ${task.title}).${waiting}${fix}\n` +
    `Faqat brief'dagi "Read only" fayllarni o'qi, faqat "Files" ro'yxatini o'zgartir, packages/shared ga tegma.\n` +
    `Boshlashda: node scripts/board.mjs set ${task.id} IN_PROGRESS\n` +
    `Tugatishda: pnpm check yashil, task faylida Report, keyin: node scripts/board.mjs set ${task.id} REVIEW\n` +
    `Savol bo'lsa: Questions'ga yoz va node scripts/board.mjs set ${task.id} BLOCKED\n` +
    `Tushuntirma, variant sanama. git buyruq ishlatma.`
  );
}

function setStatus(id, status, note) {
  if (!STATUSES.includes(status)) throw new Error(`Status: ${STATUSES.join(" | ")}`);
  const task = loadTasks().find((t) => t.id === id);
  if (!task) throw new Error(`Task topilmadi: ${id}`);
  const path = join(TASKS_DIR, task.file);
  const text = readFileSync(path, "utf8");
  const line = `**Status:** ${status}${note ? ` (${note})` : ""}`;
  writeFileSync(path, text.replace(/^\*\*Status:\*\*.*$/m, line));
  console.log(`${id}: ${task.status} -> ${status}${note ? ` (${note})` : ""}`);
}

function table(all) {
  const pad = (s, n) => String(s).padEnd(n);
  console.log(pad("Task", 6) + pad("Agent", 8) + pad("Status", 18) + pad("Depends", 14) + "Nom");
  for (const t of all) {
    const ready = t.status === "TODO" ? (isReady(t, all) ? "" : " (kutmoqda)") : "";
    console.log(
      pad(t.id, 6) +
        pad(t.assignee, 8) +
        pad(t.status + ready, 18) +
        pad(t.depends.join(",") || "-", 14) +
        t.title,
    );
  }
  console.log("");
  for (const agent of Object.keys(AGENTS)) {
    const cur = currentFor(agent, all);
    console.log(`${pad(agent, 8)} -> ${cur ? `${cur.id} ${cur.status}` : "tayyor task yo'q"}`);
  }
}

function runAgent(agent, task) {
  const p = prompt(agent, task);
  const runsDir = join(ROOT, "docs", "agent-log", "runs");
  mkdirSync(runsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const logFile = join(runsDir, `${task.id}-${agent}-${stamp}.log`);
  const lastFile = join(runsDir, `${task.id}-${agent}-last.md`);
  // Prompt stdin orqali: Windows shell argumentida ko'p qatorli matn buziladi
  const promptFile = join(runsDir, `${task.id}-${agent}-prompt.txt`);
  writeFileSync(promptFile, p);
  const args =
    agent === "gemini"
      ? ["--yolo"]
      : [
          "exec",
          "-C",
          ROOT,
          "-s",
          "workspace-write",
          "-c",
          "sandbox_workspace_write.network_access=true",
          "-o",
          lastFile,
        ];
  console.log(`${agent} ishga tushdi: ${task.id}. Log: ${logFile}
`);
  setStatus(task.id, "IN_PROGRESS", `${agent} CLI`);
  return new Promise((resolve) => {
    const child = spawn(agent, args, {
      cwd: ROOT,
      shell: true,
      stdio: [openSync(promptFile, "r"), "pipe", "pipe"],
    });
    const out = createWriteStream(logFile);
    for (const stream of [child.stdout, child.stderr]) {
      stream.on("data", (chunk) => {
        out.write(chunk);
        process.stdout.write(chunk);
      });
    }
    child.on("close", (code) => {
      out.end(`
[exit ${code}]
`);
      console.log(`
${agent} tugadi (exit ${code}): ${task.id}`);
      resolve(code ?? 1);
    });
  });
}

const [cmd = "list", arg1, arg2, ...rest] = process.argv.slice(2);
const all = loadTasks();

switch (cmd) {
  case "list":
    table(all);
    break;
  case "next": {
    const task = currentFor(arg1, all);
    if (task?.status === "BLOCKED")
      console.log(`${task.id} BLOCKED. Questions:\n${task.questions}\n`);
    console.log(prompt(arg1, task));
    break;
  }
  case "prompt":
    console.log(prompt(arg1, currentFor(arg1, all)));
    break;
  case "set":
    setStatus(arg1, arg2, rest.join(" "));
    break;
  case "run": {
    // pnpm board run codex [--chain]   (gemini: @google/gemini-cli bo'lsa)
    // --chain: task REVIEW ga chiqsa va `pnpm check` yashil bo'lsa avtomatik DONE (izoh: auto) va
    // keyingi tayyor task boshlanadi. Claude keyin barchasini bir yo'la review qiladi.
    const agent = arg1 === "gemini" ? "gemini" : "codex";
    const chain = [arg2, ...rest].includes("--chain");
    const loop = async () => {
      for (;;) {
        const tasks = loadTasks();
        const task =
          agent === "gemini"
            ? currentFor("gemini", tasks)
            : currentFor("codex", tasks) || currentFor("gpt", tasks);
        if (!task || task.status === "BLOCKED") {
          console.log(prompt(agent, task));
          return;
        }
        const code = await runAgent(agent, task);
        const after = loadTasks().find((t) => t.id === task.id);
        if (!chain || code !== 0 || after?.status !== "REVIEW") return;
        const check = spawnSync(CHECK[agent], [], { cwd: ROOT, shell: true, stdio: "inherit" });
        if (check.status !== 0) {
          setStatus(task.id, "CHANGES_REQUESTED", `auto: ${CHECK[agent]} qizil`);
          return;
        }
        setStatus(task.id, "DONE", `auto: ${CHECK[agent]} yashil, Claude review kutilmoqda`);
      }
    };
    loop().then(() => process.exit(0));
    break;
  }
  default:
    console.log(
      "Buyruqlar: list | next <agent> | prompt <agent> | set <T-XXX> <STATUS> [izoh] | run codex|gemini",
    );
}
