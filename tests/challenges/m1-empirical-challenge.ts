import { chromium } from "@playwright/test";
import type { Browser, Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
    console.log(`  ✓ [PASS] ${suite} > ${name}`);
  } else {
    results.push({ suite, name, passed: false, error: details || "Assertion failed" });
    console.error(`  ✗ [FAIL] ${suite} > ${name}: ${details}`);
  }
}

async function run() {
  console.log("================================================================================");
  console.log("URSA MAJOR — EMPIRICAL ADVERSARIAL CHALLENGE SUITE (MILESTONE M1)");
  console.log(`Target URL: ${BASE_URL}`);
  console.log("================================================================================\n");

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    // =========================================================================
    // SECTION 1: DOM ANCHOR SECTIONS & EXACT IDs
    // =========================================================================
    console.log("\n--- SUITE 1: DOM Anchor Sections & IDs ---");
    const requiredAnchors = [
      { id: "up", name: "Hero Section" },
      { id: "partners", name: "Resident Partners" },
      { id: "goals", name: "Goals & Objectives" },
      { id: "benefit", name: "Benefits of Participation" },
      { id: "product", name: "Joint Products" },
      { id: "events", name: "Events Showcase" },
      { id: "roadmap", name: "Roadmap Timeline" },
      { id: "team", name: "Board of Directors" },
      { id: "form", name: "Contact Consultation Form" },
    ];

    for (const anchor of requiredAnchors) {
      const el = page.locator(`#${anchor.id}`);
      const count = await el.count();
      const isVis = count > 0 ? await el.first().isVisible() : false;
      assert(count === 1 && isVis, "DOM Anchors", `Section #${anchor.id} (${anchor.name}) exists and is visible in DOM`, `Count: ${count}, Visible: ${isVis}`);
    }

    const header = page.locator("header");
    assert((await header.count()) > 0 && (await header.first().isVisible()), "DOM Anchors", "Header element (<header>) is present and visible");

    const footer = page.locator("footer");
    assert((await footer.count()) > 0 && (await footer.first().isVisible()), "DOM Anchors", "Footer element (<footer>) is present and visible");

    // Check document ordering of anchors
    const anchorOrder = await page.evaluate(() => {
      const ids = ["up", "partners", "goals", "benefit", "product", "events", "roadmap", "team", "form"];
      const positions = ids.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : -1;
      });
      return positions;
    });

    let isStrictlyAscending = true;
    for (let i = 1; i < anchorOrder.length; i++) {
      if (anchorOrder[i] <= anchorOrder[i - 1]) {
        isStrictlyAscending = false;
        break;
      }
    }
    assert(isStrictlyAscending, "DOM Anchors", "Anchor sections are structured in strictly monotonic vertical order", `Positions: ${JSON.stringify(anchorOrder)}`);

    // =========================================================================
    // SECTION 2: VERBATIM COPY & CONTENT FIDELITY
    // =========================================================================
    console.log("\n--- SUITE 2: Verbatim Text & Entity Fidelity ---");

    // 2.1 Hero Texts
    const heroH1 = await page.locator("#up h1").innerText();
    assert(
      heroH1.includes("Равный доступ к лучшим инвестиционным проектам и сделкам"),
      "Verbatim Copy",
      "Hero H1 contains verbatim headline",
      `Received: "${heroH1.trim()}"`
    );

    const heroP = await page.locator("#up p").innerText();
    assert(
      heroP.includes("Вместе создаем и поддерживаем общие стандарты инвестиционного рынка"),
      "Verbatim Copy",
      "Hero subtitle contains verbatim copy",
      `Received: "${heroP.trim()}"`
    );

    const heroEyebrow = await page.locator("#up").innerText();
    assert(
      heroEyebrow.includes("БОЛЬШАЯ МЕДВЕДИЦА"),
      "Verbatim Copy",
      "Hero eyebrow contains association name"
    );

    // 2.2 12 Resident Partners
    console.log("\n  Checking 12 Resident Partner Cards...");
    const expectedResidents = [
      "СОБА",
      "Сибири",
      "ARGENT",
      "FINMUSTER",
      "UNCRN",
      "Центр Сообществ",
      "Pitchleaks",
      "ASB Consulting",
      "ЛАVА",
      "KPD",
      "Finmuster",
      "DocSourcing",
    ];

    const partnersSectionText = await page.locator("#partners").innerText();
    for (const res of expectedResidents) {
      assert(
        partnersSectionText.includes(res),
        "Resident Partners",
        `Resident containing '${res}' is present in #partners`,
        `Found in section text`
      );
    }

    const partnerLogos = await page.locator("#partners img").count();
    assert(
      partnerLogos >= 12,
      "Resident Partners",
      `All 12 resident cards have logo images rendered (found ${partnerLogos})`,
      `Found ${partnerLogos} img tags in #partners`
    );

    // 2.3 9 Goals across 3 Pillars
    console.log("\n  Checking 3 Pillars & 9 Goals...");
    const goalsText = await page.locator("#goals").innerText();
    const expectedPillars = [
      "Рыночный объем и защита прав",
      "Компетенции и единая инфраструктура",
      "Экосистема и региональное развитие",
    ];
    for (const pillar of expectedPillars) {
      assert(goalsText.includes(pillar), "Goals & Pillars", `Pillar '${pillar}' exists in #goals`);
    }

    const expectedGoals = [
      "Увеличение количества инвестиционных сделок",
      "Стимулирование роста количества инвесторов",
      "Защита интересов инвесторов",
      "Повышение квалификации участников рынка",
      "Сформировать единую платформу с инструментами",
      "Выработать единые стандарты экспертизы",
      "Сформировать регулярное взаимодействие между участниками",
      "Выработать бизнес-модель для вновь создаваемых региональных сообществ",
      "Сформировать систему квалификации инвесторов",
    ];
    for (const goal of expectedGoals) {
      assert(goalsText.includes(goal), "Goals & Pillars", `Goal containing '${goal.slice(0, 30)}...' present`);
    }

    // 2.4 7 Strategic Benefits
    console.log("\n  Checking 7 Strategic Benefits...");
    const benefitText = await page.locator("#benefit").innerText();
    const expectedBenefits = [
      "Совместное влияние",
      "Инструмент обмена ресурсами",
      "НЕ ПРОТИВ, а ДЛЯ клубов",
      "Хранение данных и аналитика",
      "Статус участника",
      "Стандартизация практик и процессов",
      "Привлечение инвестиций",
    ];
    for (const ben of expectedBenefits) {
      assert(benefitText.includes(ben), "Benefits", `Benefit containing '${ben}' present in #benefit`);
    }

    // 2.5 5 Joint Products (handling uppercase transformation from Tailwind CSS)
    console.log("\n  Checking 5 Joint Products...");
    const productTextUpper = (await page.locator("#product").innerText()).toUpperCase();
    const expectedProducts = [
      "INVESTMENT CLUB SHOW",
      "ВЕНЧУРНАЯ АКАДЕМИЯ",
      "КОНСАЛТИНГОВАЯ ПОДДЕРЖКА ОТКРЫТИЯ КЛУБОВ ДЛЯ РЕГИОНОВ",
      "СТАРТАП КАФЕ №1",
      "ПЛАТФОРМА ДЛЯ КЛУБОВ",
    ];
    for (const prod of expectedProducts) {
      assert(productTextUpper.includes(prod), "Joint Products", `Product '${prod}' present in #product`);
    }

    // 2.6 5 Roadmap Stages
    console.log("\n  Checking 5 Roadmap Stages...");
    const roadmapText = await page.locator("#roadmap").innerText();
    const expectedStages = [
      "Консолидация экосистемы",
      "Единая стандартизация и скоринг",
      "Региональное масштабирование",
      "Международные мосты",
      "Цифровая платформа синдикатов",
    ];
    for (const stg of expectedStages) {
      assert(roadmapText.includes(stg), "Roadmap", `Roadmap stage '${stg}' present in #roadmap`);
    }

    // 2.7 12 Board Members
    console.log("\n  Checking 12 Board Members...");
    const teamText = await page.locator("#team").innerText();
    const expectedBoard = [
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
    for (const member of expectedBoard) {
      assert(teamText.includes(member), "Board & Team", `Board member '${member}' present in #team`);
    }
    const teamImages = await page.locator("#team img").count();
    assert(teamImages >= 12, "Board & Team", `All 12 board members have portrait photos (found ${teamImages})`);

    // 2.8 Showcase Event
    const eventText = await page.locator("#events").innerText();
    assert(eventText.includes("февраля 2026"), "Events Showcase", "Showcase event date '7 февраля 2026' present in #events");
    assert(eventText.includes("Таиланд"), "Events Showcase", "Showcase location 'Таиланд' present in #events");
    assert(eventText.includes("От неопределённости к прорыву"), "Events Showcase", "Showcase event title present");

    // =========================================================================
    // SECTION 3: MODAL FORMS BEHAVIOR & REQUIRED FIELDS
    // =========================================================================
    console.log("\n--- SUITE 3: Modal Forms Behavior & Validation ---");

    // 3.1 Application Modal (#popup:myform)
    console.log("  Testing Application Modal (#popup:myform)...");
    const heroApplyBtn = page.locator("#up button, #up a").filter({ hasText: /подать заявку/i }).first();
    await heroApplyBtn.click();
    await page.waitForTimeout(300);

    let modalDialog = page.locator('[role="dialog"]');
    assert((await modalDialog.count()) > 0 && (await modalDialog.isVisible()), "Application Modal", "Modal opens on 'ПОДАТЬ ЗАЯВКУ' button click");

    const currentHash = await page.evaluate(() => window.location.hash);
    assert(currentHash === "#popup:myform", "Application Modal", "URL hash updates to #popup:myform when opened");

    // Verify all 9 fields in Application Modal
    const appFields = ["name", "phone", "email", "telegram", "position", "company", "website", "recommendation", "request"];
    for (const field of appFields) {
      const input = modalDialog.locator(`[name="${field}"]`);
      assert((await input.count()) > 0, "Application Modal", `Field [name="${field}"] is present`);
    }

    // Verify required fields
    const appRequiredFields = ["name", "phone", "email", "telegram", "position", "company"];
    for (const field of appRequiredFields) {
      const input = modalDialog.locator(`[name="${field}"]`);
      const isReq = await input.evaluate((el: HTMLInputElement) => el.required);
      assert(isReq, "Application Modal", `Field [name="${field}"] has required attribute`);
    }

    // Test form submit without required fields
    const appSubmitBtn = modalDialog.locator('button[type="submit"]');
    await appSubmitBtn.click();
    await page.waitForTimeout(100);
    const stillOpen = await modalDialog.isVisible();
    assert(stillOpen, "Application Modal", "Empty submit is prevented by HTML5 validation (modal remains open)");

    // Fill valid data and submit
    await modalDialog.locator('[name="name"]').fill("Алексей Тестовый");
    await modalDialog.locator('[name="phone"]').fill("+7 (999) 000-11-22");
    await modalDialog.locator('[name="email"]').fill("alex.test@ursa-major.test");
    await modalDialog.locator('[name="telegram"]').fill("@alextest");
    await modalDialog.locator('[name="position"]').fill("Инвестиционный директор");
    await modalDialog.locator('[name="company"]').fill("Тест Венчур Клуб");
    await appSubmitBtn.click();
    await page.waitForTimeout(400);

    const successDialog = page.locator('[role="dialog"]').filter({ hasText: /Заявка отправлена|Спасибо/i });
    assert((await successDialog.count()) > 0 && (await successDialog.first().isVisible()), "Application Modal", "Valid submission displays confirmation screen");

    // Close modal via Close button
    const closeBtn = successDialog.locator('button:has-text("Закрыть")').first();
    await closeBtn.click();
    await page.waitForTimeout(300);
    assert((await page.locator('[role="dialog"]').count()) === 0, "Application Modal", "Modal closes on 'Закрыть' button click");

    // Test Escape key close
    await heroApplyBtn.click();
    await page.waitForTimeout(300);
    assert((await page.locator('[role="dialog"]').count()) > 0, "Application Modal", "Modal reopened for Escape test");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    assert((await page.locator('[role="dialog"]').count()) === 0, "Application Modal", "Modal closes on Escape key press");

    // 3.2 Event Submission Modal (#popup:event)
    console.log("\n  Testing Event Submission Modal (#popup:event)...");
    const eventBtn = page.locator("#events button").filter({ hasText: /разместить мероприятие/i }).first();
    await eventBtn.click();
    await page.waitForTimeout(300);

    let eventModal = page.locator('[role="dialog"]').filter({ hasText: /разместим мероприятия/i });
    assert((await eventModal.count()) > 0 && (await eventModal.isVisible()), "Event Modal", "Modal opens on 'РАЗМЕСТИТЬ МЕРОПРИЯТИЕ' click");

    const eventHash = await page.evaluate(() => window.location.hash);
    assert(eventHash === "#popup:event", "Event Modal", "URL hash updates to #popup:event");

    const eventFields = ["title", "description", "eventDate", "geo", "website", "company", "name", "telegram", "phone", "email"];
    for (const field of eventFields) {
      const input = eventModal.locator(`[name="${field}"]`);
      assert((await input.count()) > 0, "Event Modal", `Field [name="${field}"] is present`);
    }

    const eventRequiredFields = ["title", "description", "eventDate", "geo", "company", "name", "telegram", "phone", "email"];
    for (const field of eventRequiredFields) {
      const input = eventModal.locator(`[name="${field}"]`);
      const isReq = await input.evaluate((el: HTMLInputElement) => el.required);
      assert(isReq, "Event Modal", `Field [name="${field}"] has required attribute`);
    }

    // Close via close icon (X)
    const eventCloseX = eventModal.locator('button[aria-label="Закрыть"]').first();
    await eventCloseX.click();
    await page.waitForTimeout(300);
    assert((await page.locator('[role="dialog"]').count()) === 0, "Event Modal", "Event modal closes on X button click");

    // 3.3 Privacy Policy Modal (#popup:privacy)
    console.log("\n  Testing Privacy Policy Modal (#popup:privacy)...");
    const privacyBtn = page.locator("footer button").filter({ hasText: /политика конфиденциальности/i }).first();
    await privacyBtn.click();
    await page.waitForTimeout(300);

    const privacyModal = page.locator('[role="dialog"]').filter({ hasText: /политика обработки персональных данных/i });
    assert((await privacyModal.count()) > 0 && (await privacyModal.isVisible()), "Privacy Modal", "Privacy modal opens on footer button click");
    assert((await privacyModal.innerText()).includes("152-ФЗ"), "Privacy Modal", "Privacy modal text references Federal Law 152-FZ");

    const privacyCloseBtn = privacyModal.locator('button:has-text("Понятно")');
    await privacyCloseBtn.click();
    await page.waitForTimeout(300);
    assert((await page.locator('[role="dialog"]').count()) === 0, "Privacy Modal", "Privacy modal closes on 'Понятно' click");

    // 3.4 Direct URL hash routing on page load
    console.log("\n  Testing Direct URL Hash Deep-linking on Page Load...");
    await page.goto(`${BASE_URL}/#popup:myform`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const directAppModal = page.locator('[role="dialog"]').filter({ hasText: /новым резидентам/i });
    assert((await directAppModal.count()) > 0 && (await directAppModal.isVisible()), "Hash Deep-linking", "Direct load with #popup:myform opens Application Modal immediately");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await page.goto(`${BASE_URL}/#popup:event`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const directEventModal = page.locator('[role="dialog"]').filter({ hasText: /разместим мероприятия/i });
    assert((await directEventModal.count()) > 0 && (await directEventModal.isVisible()), "Hash Deep-linking", "Direct load with #popup:event opens Event Modal immediately");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await page.goto(`${BASE_URL}/#popup:privacy`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const directPrivacyModal = page.locator('[role="dialog"]').filter({ hasText: /политика обработки персональных данных/i });
    assert((await directPrivacyModal.count()) > 0 && (await directPrivacyModal.isVisible()), "Hash Deep-linking", "Direct load with #popup:privacy opens Privacy Modal immediately");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // 3.5 Inline Contact Form (#form)
    console.log("\n  Testing Inline Contact Form (#form)...");
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    const inlineForm = page.locator("#form form").first();
    assert((await inlineForm.count()) > 0, "Inline Form", "Contact form exists in #form section");

    const inlineFields = ["name", "phone", "email", "telegram", "request"];
    for (const field of inlineFields) {
      const input = inlineForm.locator(`[name="${field}"]`);
      assert((await input.count()) > 0, "Inline Form", `Field [name="${field}"] exists`);
      const isReq = await input.evaluate((el: HTMLInputElement) => el.required);
      assert(isReq, "Inline Form", `Field [name="${field}"] is required`);
    }

    // Submit valid inline form
    await inlineForm.locator('[name="name"]').fill("Тестов Тест");
    await inlineForm.locator('[name="phone"]').fill("+7 (999) 777-88-99");
    await inlineForm.locator('[name="email"]').fill("test@ursa.test");
    await inlineForm.locator('[name="telegram"]').fill("@testnick");
    await inlineForm.locator('[name="request"]').fill("Запрос на консультацию по синдицированию сделок");
    await inlineForm.locator('button[type="submit"]').click();
    await page.waitForTimeout(400);

    const inlineSuccess = page.locator("#form").filter({ hasText: /Спасибо за обращение/i });
    assert((await inlineSuccess.count()) > 0, "Inline Form", "Submitting inline form renders success confirmation");

    // =========================================================================
    // SECTION 4: RESPONSIVE LAYOUT & HORIZONTAL OVERFLOW STRESS-TEST
    // =========================================================================
    console.log("\n--- SUITE 4: Responsive CSS & Viewport Stress-Testing ---");

    const testViewports = [
      { name: "Mobile Small (iPhone SE)", width: 375, height: 667 },
      { name: "Mobile Modern (iPhone 14)", width: 390, height: 844 },
      { name: "Mobile Large (iPhone 14 Pro Max)", width: 428, height: 926 },
      { name: "Tablet Portrait (iPad)", width: 768, height: 1024 },
      { name: "Tablet Landscape", width: 1024, height: 768 },
      { name: "Desktop Standard (MacBook 13)", width: 1280, height: 800 },
      { name: "Desktop Large (Full HD)", width: 1920, height: 1080 },
    ];

    // Reload page to reset form state
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    // 4.1 Viewport Meta Tag
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute("content");
    assert(
      viewportMeta !== null && viewportMeta.includes("width=device-width"),
      "Responsive",
      "HTML contains valid responsive meta viewport tag",
      `Content: ${viewportMeta}`
    );

    // 4.2 Horizontal Overflow Check across viewports
    for (const vp of testViewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);

      const overflowData = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const bodyWidth = document.body.scrollWidth;
        return {
          docWidth,
          winWidth,
          bodyWidth,
          hasOverflow: docWidth > winWidth || bodyWidth > winWidth,
        };
      });

      assert(
        !overflowData.hasOverflow,
        "Responsive Overflow",
        `Zero horizontal overflow on ${vp.name} (${vp.width}x${vp.height})`,
        `docWidth: ${overflowData.docWidth}, winWidth: ${overflowData.winWidth}`
      );
    }

    // 4.3 Mobile Navigation Drawer
    console.log("\n  Testing Mobile Hamburger Navigation Drawer...");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(200);

    const burgerBtn = page.locator('header button[aria-label="Меню"]').first();
    assert(await burgerBtn.isVisible(), "Mobile Navigation", "Hamburger menu button is visible on mobile (375px)");

    await burgerBtn.click();
    await page.waitForTimeout(300);

    const mobileDrawer = page.locator("header div.fixed").filter({ hasText: /о нас/i }).first();
    assert(await mobileDrawer.isVisible(), "Mobile Navigation", "Mobile drawer opens on burger button click");

    const drawerLinks = ["Цели", "Планы", "Совместные продукты", "Резиденты", "Преимущества", "Правление", "Мероприятия", "Новости"];
    for (const linkText of drawerLinks) {
      const link = mobileDrawer.locator(`a:has-text("${linkText}")`).first();
      assert((await link.count()) > 0, "Mobile Navigation", `Drawer contains anchor link '${linkText}'`);
    }

    // Click Close / Toggle
    await burgerBtn.click();
    await page.waitForTimeout(300);
    assert((await mobileDrawer.isVisible()) === false, "Mobile Navigation", "Mobile drawer closes when toggled off");

    // 4.4 Multi-column Grid Adaptation
    console.log("\n  Testing Grid Column Adaptations...");
    const partnersGrid = page.locator("#partners div.grid").first();
    const partnerGridClass = await partnersGrid.getAttribute("class");
    assert(
      partnerGridClass !== null &&
        partnerGridClass.includes("grid-cols-1") &&
        partnerGridClass.includes("md:grid-cols-2") &&
        partnerGridClass.includes("lg:grid-cols-3"),
      "Responsive Grid",
      "Partners grid has responsive Tailwind columns: cols-1 (mobile) -> cols-2 (tablet) -> cols-3 (desktop)",
      `Classes: ${partnerGridClass}`
    );

    const teamGrid = page.locator("#team div.grid").first();
    const teamGridClass = await teamGrid.getAttribute("class");
    assert(
      teamGridClass !== null &&
        teamGridClass.includes("grid-cols-1") &&
        teamGridClass.includes("sm:grid-cols-2") &&
        teamGridClass.includes("md:grid-cols-3") &&
        teamGridClass.includes("lg:grid-cols-4"),
      "Responsive Grid",
      "Team grid adapts: cols-1 (mobile) -> cols-2 (sm) -> cols-3 (tablet) -> cols-4 (desktop)",
      `Classes: ${teamGridClass}`
    );

    // 4.5 Touch target sizes on mobile
    await page.setViewportSize({ width: 375, height: 812 });
    const heroBtnBox = await heroApplyBtn.boundingBox();
    assert(
      heroBtnBox !== null && heroBtnBox.height >= 44 && heroBtnBox.width >= 44,
      "Accessibility & Touch",
      `Hero CTA button meets minimum touch target >= 44x44px (measured ${heroBtnBox?.width.toFixed(0)}x${heroBtnBox?.height.toFixed(0)}px)`
    );

  } catch (err: any) {
    console.error("FATAL ERROR DURING TEST RUN:", err);
    results.push({ suite: "FATAL", name: "Runner exception", passed: false, error: err.stack || String(err) });
  } finally {
    await browser.close();
  }

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log("\n================================================================================");
  console.log("CHALLENGE EXECUTION SUMMARY");
  console.log("================================================================================");

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Assertions Executed: ${total}`);
  console.log(`Passed:                    ${passed}`);
  console.log(`Failed:                    ${failed}`);
  console.log(`Success Rate:              ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log("\nFAILURES IDENTIFIED:");
    results
      .filter((r) => !r.passed)
      .forEach((r, idx) => {
        console.log(`  ${idx + 1}. [${r.suite}] ${r.name}: ${r.error}`);
      });
  } else {
    console.log("\n🌟 ALL EMPIRICAL CHALLENGES PASSED WITH ZERO FAILURES!");
  }

  const outputPath = path.join(__dirname, "m1-challenge-results.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        total,
        passed,
        failed,
        successRate: `${((passed / total) * 100).toFixed(1)}%`,
        results,
      },
      null,
      2
    )
  );
  console.log(`\nDetailed JSON results saved to: ${outputPath}`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();
