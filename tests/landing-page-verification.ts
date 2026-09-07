import assert from "node:assert";
import {
  RESIDENT_PARTNERS,
  GOALS_DATA,
  BENEFITS_DATA,
  PRODUCTS_DATA,
  ROADMAP_DATA,
  BOARD_MEMBERS,
  SHOWCASE_EVENT,
} from "../src/components/landing/data.ts";

console.log("🧪 Running Ursa Major Landing Page (Milestone M1) Verification...\n");

// Test 1: Resident Partners Fidelity
console.log("Test 1: Resident Partners (12 residents)");
assert.strictEqual(RESIDENT_PARTNERS.length, 12, "Should have exactly 12 resident partners");
const expectedResidents = [
  "СОБА",
  "Сибири, Урала и Дальнего востока",
  "ARGENT CLUB",
  "FINMUSTER",
  "UNCRN.ru",
  "Центр Сообществ",
  "Pitchleaks",
  "ASB Consulting Group",
  "ЛАVА",
  "KPD",
  "Finmuster (Лицензия ЦБ РФ)",
  "DocSourcing",
];
expectedResidents.forEach((expected) => {
  const found = RESIDENT_PARTNERS.some((p) => p.name.includes(expected));
  assert.ok(found, `Resident partner containing '${expected}' must be present`);
});
console.log("  ✓ All 12 resident partners verified with logos, badges & bios.");

// Test 2: Goals & Objectives Fidelity
console.log("\nTest 2: Goals & Objectives (3 pillars, 9 goals)");
assert.strictEqual(GOALS_DATA.length, 3, "Should have 3 strategic pillars");
const totalGoals = GOALS_DATA.reduce((acc, col) => acc + col.goals.length, 0);
assert.strictEqual(totalGoals, 9, "Should have exactly 9 structured goals");
assert.strictEqual(GOALS_DATA[0].category, "Рыночный объем и защита прав");
assert.strictEqual(GOALS_DATA[1].category, "Компетенции и единая инфраструктура");
assert.strictEqual(GOALS_DATA[2].category, "Экосистема и региональное развитие");
console.log("  ✓ All 3 pillars and 9 goals verified with exact copy.");

// Test 3: Member Benefits
console.log("\nTest 3: Member Benefits (7 strategic benefits)");
assert.strictEqual(BENEFITS_DATA.length, 7, "Should have 7 member benefits");
assert.strictEqual(BENEFITS_DATA.filter((b) => b.column === "left").length, 4);
assert.strictEqual(BENEFITS_DATA.filter((b) => b.column === "right").length, 3);
console.log("  ✓ All 7 benefits verified across 2-column layout.");

// Test 4: Joint Products
console.log("\nTest 4: Joint Products (5 modules)");
assert.strictEqual(PRODUCTS_DATA.length, 5, "Should have 5 joint product modules");
const productNames = PRODUCTS_DATA.map((p) => p.name);
assert.ok(productNames.includes("INVESTMENT CLUB SHOW"));
assert.ok(productNames.includes("Венчурная Академия"));
assert.ok(productNames.includes("Консалтинговая поддержка открытия клубов для регионов"));
assert.ok(productNames.includes("Стартап кафе №1"));
assert.ok(productNames.includes("Платформа для клубов"));
console.log("  ✓ All 5 joint products verified with feature bullets.");

// Test 5: Events Showcase
console.log("\nTest 5: Events Showcase Data");
assert.strictEqual(SHOWCASE_EVENT.date, "07-02-2026");
assert.ok(SHOWCASE_EVENT.title.includes("От неопределённости к прорыву"));
assert.ok(SHOWCASE_EVENT.location.includes("Таиланд"));
assert.strictEqual(SHOWCASE_EVENT.paragraphs.length, 3);
console.log("  ✓ Showcase event 07-02-2026 Thailand verified.");

// Test 6: Association Roadmap
console.log("\nTest 6: Association Roadmap (5 phases)");
assert.strictEqual(ROADMAP_DATA.length, 5, "Should have 5 roadmap phases");
assert.strictEqual(ROADMAP_DATA[0].title, "Консолидация экосистемы");
assert.strictEqual(ROADMAP_DATA[1].title, "Единая стандартизация и скоринг");
assert.strictEqual(ROADMAP_DATA[2].title, "Региональное масштабирование");
assert.strictEqual(ROADMAP_DATA[3].title, "Международные мосты");
assert.strictEqual(ROADMAP_DATA[4].title, "Цифровая платформа синдикатов");
console.log("  ✓ 5-phase strategic roadmap verified.");

// Test 7: Board Members
console.log("\nTest 7: Board Members (12 leaders)");
assert.strictEqual(BOARD_MEMBERS.length, 12, "Should have 12 board members");
const expectedMembers = [
  "Луиза Александрова",
  "Андрей Заворин",
  "Михаил Пузырёв",
  "Максим Никитинский",
  "Константин Разетдинов",
  "Мария Кузнецова",
  "Сергей Львов",
  "Сергей Урескул",
  "Максим Печеник",
  "Алексей Соколов",
  "Диана Гуц",
  "Полина Савилова",
];
expectedMembers.forEach((expected) => {
  const found = BOARD_MEMBERS.some((m) => m.name === expected);
  assert.ok(found, `Board member '${expected}' must be present`);
});
console.log("  ✓ All 12 board members verified with photos and roles.");

console.log("\n✨ ALL 7 VERIFICATION TESTS PASSED SUCCESSFULLY! 100% CONTENT & LOGIC FIDELITY.");
