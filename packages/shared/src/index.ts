// Barcha domenlar shu yerdan re-export qilinadi. apps/* faqat "@zexn/shared" dan import qiladi.
// Eslatma: NodeNext rejimida relativ importlarda ".js" kengaytmasi majburiy (build'dan keyingi fayl nomi).
export * from "./errors.js";
export * from "./common.js";
export * from "./health.js";
export * from "./auth.js";
export * from "./admin.js";
export * from "./student.js";
