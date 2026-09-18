export type ReactCourseTopic = {
  title: string;
  slug: string;
  description: string;
  prerequisites: string[];
  materials: Array<{ title: string; url: string; kind: string }>;
};

export const reactCourse = {
  title: "Frontend - React",
  slug: "frontend-react",
  topics: [
    {
      title: "React asoslari",
      slug: "react-asoslari",
      description: "React, komponentlar va deklarativ interfeys tushunchalari.",
      prerequisites: [],
      materials: [
        { title: "React bilan tanishuv", url: "https://react.dev/learn", kind: "article" },
      ],
    },
    {
      title: "JSX va markup",
      slug: "jsx-va-markup",
      description: "JSX sintaksisi, atributlar va JavaScript ifodalarini markup ichida ishlatish.",
      prerequisites: ["react-asoslari"],
      materials: [
        {
          title: "JSX bilan markup yozish",
          url: "https://react.dev/learn/writing-markup-with-jsx",
          kind: "article",
        },
      ],
    },
    {
      title: "Component arxitekturasi",
      slug: "component-arxitekturasi",
      description: "Interfeysni qayta ishlatiladigan, kichik komponentlarga ajratish.",
      prerequisites: ["jsx-va-markup"],
      materials: [
        {
          title: "Birinchi komponent",
          url: "https://react.dev/learn/your-first-component",
          kind: "article",
        },
      ],
    },
    {
      title: "Props bilan ma'lumot uzatish",
      slug: "props",
      description: "Ota komponentdan bola komponentga props orqali ma'lumot uzatish.",
      prerequisites: ["component-arxitekturasi"],
      materials: [
        {
          title: "Props uzatish",
          url: "https://react.dev/learn/passing-props-to-a-component",
          kind: "article",
        },
      ],
    },
    {
      title: "Shartli rendering",
      slug: "shartli-rendering",
      description: "Holatga qarab turli JSX elementlarini ko'rsatish.",
      prerequisites: ["props"],
      materials: [
        {
          title: "Shartli rendering",
          url: "https://react.dev/learn/conditional-rendering",
          kind: "article",
        },
      ],
    },
    {
      title: "Ro'yxatlar va key",
      slug: "royxatlar-va-key",
      description: "Massivlarni JSX ro'yxatiga aylantirish va barqaror key tanlash.",
      prerequisites: ["jsx-va-markup", "props"],
      materials: [
        {
          title: "Ro'yxatlarni render qilish",
          url: "https://react.dev/learn/rendering-lists",
          kind: "article",
        },
      ],
    },
    {
      title: "Interaktivlik va hodisalar",
      slug: "interaktivlik",
      description: "Foydalanuvchi hodisalariga handlerlar orqali javob berish.",
      prerequisites: ["component-arxitekturasi"],
      materials: [
        {
          title: "Hodisalarga javob berish",
          url: "https://react.dev/learn/responding-to-events",
          kind: "article",
        },
      ],
    },
    {
      title: "State asoslari",
      slug: "state-asoslari",
      description: "Komponent xotirasi va useState hookidan foydalanish.",
      prerequisites: ["interaktivlik", "props"],
      materials: [
        {
          title: "State: komponent xotirasi",
          url: "https://react.dev/learn/state-a-components-memory",
          kind: "article",
        },
      ],
    },
    {
      title: "Rendering jarayoni",
      slug: "rendering-jarayoni",
      description: "React render va commit bosqichlari hamda snapshot tushunchasi.",
      prerequisites: ["state-asoslari"],
      materials: [
        {
          title: "Render va commit",
          url: "https://react.dev/learn/render-and-commit",
          kind: "article",
        },
      ],
    },
    {
      title: "State yangilanishlarini boshqarish",
      slug: "state-yangilanishlari",
      description: "State navbati, batching va updater funksiyalarini qo'llash.",
      prerequisites: ["rendering-jarayoni"],
      materials: [
        {
          title: "State yangilanishlari navbati",
          url: "https://react.dev/learn/queueing-a-series-of-state-updates",
          kind: "article",
        },
      ],
    },
    {
      title: "Obyekt va massiv state",
      slug: "obyekt-massiv-state",
      description: "State ichidagi obyekt va massivlarni mutatsiyasiz yangilash.",
      prerequisites: ["state-yangilanishlari"],
      materials: [
        {
          title: "State ichidagi obyektlar",
          url: "https://react.dev/learn/updating-objects-in-state",
          kind: "article",
        },
        {
          title: "State ichidagi massivlar",
          url: "https://react.dev/learn/updating-arrays-in-state",
          kind: "article",
        },
      ],
    },
    {
      title: "Formalar",
      slug: "formalar",
      description: "Controlled inputlar, forma yuborish va state bilan sinxronlash.",
      prerequisites: ["state-asoslari", "obyekt-massiv-state"],
      materials: [
        {
          title: "Input state bilan ishlash",
          url: "https://react.dev/learn/reacting-to-input-with-state",
          kind: "article",
        },
      ],
    },
    {
      title: "State strukturasini tanlash",
      slug: "state-strukturasi",
      description: "Takroriy va qarama-qarshi state qiymatlaridan qochish.",
      prerequisites: ["formalar"],
      materials: [
        {
          title: "State strukturasini tanlash",
          url: "https://react.dev/learn/choosing-the-state-structure",
          kind: "article",
        },
      ],
    },
    {
      title: "State flow va lifting state up",
      slug: "state-flow",
      description: "Umumiy stateni eng yaqin ota komponentga ko'tarish.",
      prerequisites: ["state-strukturasi", "props"],
      materials: [
        {
          title: "State komponentlar orasida",
          url: "https://react.dev/learn/sharing-state-between-components",
          kind: "article",
        },
      ],
    },
    {
      title: "State management va reducer",
      slug: "reducer",
      description: "Murakkab state yangilanishlarini reducer orqali markazlashtirish.",
      prerequisites: ["state-flow"],
      materials: [
        {
          title: "State mantiqini reducerga ajratish",
          url: "https://react.dev/learn/extracting-state-logic-into-a-reducer",
          kind: "article",
        },
      ],
    },
    {
      title: "Context",
      slug: "context",
      description: "Chuqur komponent daraxtida ma'lumotni propssiz uzatish.",
      prerequisites: ["state-flow"],
      materials: [
        {
          title: "Context bilan ma'lumot uzatish",
          url: "https://react.dev/learn/passing-data-deeply-with-context",
          kind: "article",
        },
      ],
    },
    {
      title: "Reducer va Context",
      slug: "reducer-context",
      description: "Katta ekran state boshqaruvida reducer va contextni birlashtirish.",
      prerequisites: ["reducer", "context"],
      materials: [
        {
          title: "Reducer va Contextni kengaytirish",
          url: "https://react.dev/learn/scaling-up-with-reducer-and-context",
          kind: "article",
        },
      ],
    },
    {
      title: "Refs va DOM",
      slug: "refs-va-dom",
      description: "Render uchun kerak bo'lmagan qiymatlar va DOM tugunlariga ref orqali murojaat.",
      prerequisites: ["rendering-jarayoni"],
      materials: [
        {
          title: "Ref bilan qiymat saqlash",
          url: "https://react.dev/learn/referencing-values-with-refs",
          kind: "article",
        },
      ],
    },
    {
      title: "Effects",
      slug: "effects",
      description: "Komponentni tashqi tizimlar bilan useEffect orqali sinxronlash.",
      prerequisites: ["refs-va-dom", "state-yangilanishlari"],
      materials: [
        {
          title: "Effect bilan sinxronlash",
          url: "https://react.dev/learn/synchronizing-with-effects",
          kind: "article",
        },
      ],
    },
    {
      title: "API asoslari va custom hooklar",
      slug: "api-va-custom-hooklar",
      description: "API ma'lumotlarini yuklash va takroriy mantiqni custom hookka ajratish.",
      prerequisites: ["effects", "reducer-context"],
      materials: [
        {
          title: "Custom hooklar",
          url: "https://react.dev/learn/reusing-logic-with-custom-hooks",
          kind: "article",
        },
        {
          title: "Effectdan foydalanish",
          url: "https://react.dev/learn/you-might-not-need-an-effect",
          kind: "article",
        },
      ],
    },
  ] satisfies ReactCourseTopic[],
};

export function assertAcyclicTopics(topics: ReactCourseTopic[]): void {
  const bySlug = new Map(topics.map((topic) => [topic.slug, topic]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(slug: string): void {
    if (visiting.has(slug)) throw new Error(`Mavzu prerequisite sikli topildi: ${slug}`);
    if (visited.has(slug)) return;
    const topic = bySlug.get(slug);
    if (!topic) throw new Error(`Noma'lum prerequisite: ${slug}`);
    visiting.add(slug);
    for (const prerequisite of topic.prerequisites) visit(prerequisite);
    visiting.delete(slug);
    visited.add(slug);
  }

  for (const topic of topics) visit(topic.slug);
}
