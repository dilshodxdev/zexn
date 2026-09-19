import { afterEach, describe, expect, it, vi } from "vitest";
import { DeepSeekAiProvider } from "../../lib/ai/DeepSeekAiProvider.js";
import { buildSystemPrompt } from "../student/mentor.service.js";

vi.mock("../../lib/ai/index.js", () => ({
  createAiProvider: () => ({ name: "mock" }),
}));
vi.mock("./settings.repository.js", () => ({}));
vi.mock("../student/mentor.repository.js", () => ({}));
vi.mock("../student/student.repository.js", () => ({}));

function createProvider(timeoutMs = 100): DeepSeekAiProvider {
  return new DeepSeekAiProvider({
    apiKey: "test-key",
    model: "deepseek-chat",
    baseUrl: "https://api.deepseek.test",
    timeoutMs,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mentor system prompt", () => {
  it("platforma, markaz va kontekst tartibini saqlaydi", () => {
    const prompt = buildSystemPrompt(
      "Platforma qoidasi",
      "Markaz qoidasi",
      "Ali",
      "React",
      [{ title: "State", material: null }],
      "State mashqini bajaring",
      false,
    );

    // Tartib: platforma -> markaz -> ZEXN faktlari -> o'quvchi konteksti (context-builder)
    expect(prompt.startsWith("Platforma qoidasi\nMarkaz qoidasi\n")).toBe(true);
    expect(prompt.indexOf("ZEXN HAQIDA ANIQ MA'LUMOT")).toBeLessThan(
      prompt.indexOf("O'quvchi: Ali"),
    );
    expect(prompt).toContain("Kurs: React");
    expect(prompt).toContain("Joriy keyingi qadam: State mashqini bajaring");
  });
});

describe("DeepSeekAiProvider", () => {
  it("200 javobdagi matnni qaytaradi", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "Sinov javobi" } }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createProvider().chat({ system: "Tizim", history: [], message: "Salom" }),
    ).resolves.toBe("Sinov javobi");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("401 javobni AI_UNAVAILABLE 503 ga o'giradi", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 401 })),
    );

    await expect(
      createProvider().chat({ system: "Tizim", history: [], message: "Salom" }),
    ).rejects.toMatchObject({ statusCode: 503, code: "AI_UNAVAILABLE", meta: { status: 401 } });
  });

  it("timeoutni AI_UNAVAILABLE 503 ga o'giradi", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createProvider(1).chat({ system: "Tizim", history: [], message: "Salom" }),
    ).rejects.toMatchObject({
      statusCode: 503,
      code: "AI_UNAVAILABLE",
      meta: { status: "timeout" },
    });
  });
});
