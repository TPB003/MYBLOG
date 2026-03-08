import { store, STORAGE_KEYS } from "./store.js";
import { isLocale } from "./utils.js";

const listeners = new Set();

const translations = {
  zh: {
    "meta.title": "TPBLOG | iOS 椋庢牸涓婚〉",
    "meta.description": "TPBLOG 鐨?iOS 椋庢牸涓汉涓婚〉锛屾敮鎸佷腑鑻卞垏鎹笌鑷姩鏃ュ涓婚銆?,

    "nav.home": "涓婚〉",
    "nav.posts": "鏂囩珷",
    "nav.knowledge": "鐭ヨ瘑搴?,
    "nav.stats": "缁熻",
    "nav.books": "涔﹀崟",

    "locale.switchToEn": "鍒囨崲鍒拌嫳鏂?,
    "locale.switchToZh": "Switch to Chinese",

    "hero.kicker": "PERSONAL HOME",
    "hero.subtitle": "涓€涓洿杞婚噺銆佹洿鍏嬪埗鐨?iOS 椋庢牸宸ヤ綔鍙般€?,
    "hero.roleLabel": "鎴戞鍦ㄩ暱鏈熶笓娉細",
    "hero.text": "鎶婂啓浣溿€佸伐绋嬪拰瀛︿範娌夋穩鍦ㄥ悓涓€涓椤碉紝鍑忓皯涓婁笅鏂囧垏鎹紝寮哄寲闀挎湡浜у嚭銆?,
    "hero.actionPrimary": "鎵撳紑鐭ヨ瘑搴?,
    "hero.actionSecondary": "\u6D4F\u89C8\u4E66\u5355",

    "theme.day": "鐧藉ぉ妯″紡",
    "theme.night": "澶滈棿妯″紡",
    "theme.autoShort": "鑷姩",
    "theme.dayShort": "鐧藉ぉ",
    "theme.nightShort": "榛戝",
    "theme.toggleHintAuto": "褰撳墠鑷姩妯″紡锛岀偣鍑诲垏鎹㈠埌鐧藉ぉ妯″紡",
    "theme.toggleHintDay": "褰撳墠鐧藉ぉ妯″紡锛岀偣鍑诲垏鎹㈠埌榛戝妯″紡",
    "theme.toggleHintNight": "褰撳墠榛戝妯″紡锛岀偣鍑绘仮澶嶈嚜鍔ㄦā寮?,

    "dashboard.nowLabel": "褰撳墠鐘舵€?,
    "dashboard.clockLabel": "鏈湴鏃堕棿",
    "dashboard.focusLabel": "浠婃棩鐒︾偣",
    "dashboard.focusA": "瀹屾垚 1 绡囬珮璐ㄩ噺杈撳嚭",
    "dashboard.focusB": "鐭ヨ瘑鍗″啀娌夋穩 3 鏉?,
    "dashboard.focusC": "淇濇寔鑺傚锛屼笉鍋氬绾跨▼鍒嗗績",
    "dashboard.greetMorning": "鏃╀笂濂斤紝寮€濮嬫帹杩涗富绾夸换鍔?,
    "dashboard.greetAfternoon": "涓嬪崍濂斤紝杩涘叆娣卞害鎵ц鍖洪棿",
    "dashboard.greetEvening": "鏅氫笂濂斤紝閫傚悎鏁寸悊涓庡鐩?,
    "dashboard.greetNight": "澶滈棿鏃舵锛屽缓璁綆璐熻嵎鏀跺熬",
    "dashboard.sceneDay": "DAYLIGHT MODE ACTIVE",
    "dashboard.sceneNight": "NIGHT MODE ACTIVE",

    "intro.line": "鎴戝垎浜?#缂栫▼ #鍐欎綔 #浜у搧 #鐢熸椿銆?br>杩欎簺鍐呭绱鍚稿紩浜?<strong>{count}</strong> 娆￠槄璇汇€?,

    "posts.title": "绮鹃€夋枃绔?,
    "posts.empty": "璇ュ垎绫绘殏鏃惰繕娌℃湁鍐呭銆?,
    "posts.open": "闃呰鍏ㄦ枃",
    "posts.close": "鍏抽棴",
    "posts.readCount": "{count} 娆￠槄璇?,
    "posts.modalTitle": "鏂囩珷锛歿title}",

    "filter.all": "鍏ㄩ儴",
    "filter.tech": "鎶€鏈?,
    "filter.life": "鐢熸椿",
    "filter.notes": "绗旇",

    "knowledge.title": "鐭ヨ瘑搴?,
    "knowledge.sub": "娌夋穩姒傚康銆佹柟娉曘€佹ā鏉匡紝鏀寔妫€绱㈠拰鏍囩绛涢€夈€?,
    "knowledge.searchLabel": "鎼滅储",
    "knowledge.searchPlaceholder": "杈撳叆鍏抽敭璇嶏細姣斿 SSR銆佸鐩樸€佸啓浣滄ā鏉?,
    "knowledge.tagAll": "鍏ㄩ儴",
    "knowledge.open": "闃呰鍏ㄦ枃",
    "knowledge.readCount": "{count} 娆￠槄璇?,
    "knowledge.countPrefix": "鍏?,
    "knowledge.countSuffix": "鏉＄煡璇嗗崱",
    "knowledge.empty": "娌℃湁鎵惧埌鐩稿叧鐭ヨ瘑鍗★紝璇曡瘯鏇寸煭鍏抽敭璇嶆垨鍒囨崲鏍囩銆?,
    "knowledge.updated": "鏇存柊浜?{date}",

    "stats.timeTitle": "鏃堕棿鍒嗛厤",
    "stats.timeDesc": "鏈€杩?90 澶╂垜鐨勭簿鍔涘垎閰嶅涓嬶紝涓昏鏃堕棿鎶曞叆鍦ㄦ妧鏈笌鍐呭銆?,
    "stats.bar.dev": "寮€鍙?,
    "stats.bar.writing": "鍐欎綔",
    "stats.bar.reading": "闃呰",
    "stats.bar.fitness": "杩愬姩",

    "snapshot.title": "绯荤粺蹇収",
    "snapshot.sub": "涓婚〉鍐呭鎸夋ā鍧楃粍缁囷紝杞婚噺浣嗗彲鎸佺画杩唬銆?,
    "snapshot.posts": "鏂囩珷",
    "snapshot.knowledge": "鐭ヨ瘑鍗?,
    "snapshot.books": "涔﹀崟",
    "snapshot.reads": "绱闃呰",

    "books.title": "闃呰娓呭崟",
    "books.sub": "杩囧幓鍑犲勾鎸佺画闃呰锛屼互涓嬫槸杩戞湡楂橀鎺ㄨ崘銆?,

    "now.title": "\u8FD1\u671F\u8FDB\u5EA6",
    "now.sub": "\u53C2\u8003 qzq.at \u7684\u4FE1\u606F\u8282\u594F\uFF0C\u63D0\u4F9B\u5F53\u4E0B\u7684\u8F93\u51FA\u65B9\u5411\u4E0E\u5B9E\u9A8C\u8BB0\u5F55\u3002",
    "now.cardA.kicker": "BUILD",
    "now.cardA.title": "\u4E3B\u7EBF\u5DE5\u7A0B",
    "now.cardA.body": "\u8FED\u4EE3\u535A\u5BA2\u7684\u5185\u5BB9\u7BA1\u7EBF\u4E0E\u53EF\u89C6\u5316\u7BA1\u7406\u529F\u80FD\u3002",
    "now.cardB.kicker": "RESEARCH",
    "now.cardB.title": "\u77E5\u8BC6\u4F53\u7CFB",
    "now.cardB.body": "\u5C06\u6BCF\u5468\u8F93\u5165\u6C89\u6DC0\u4E3A\u53EF\u68C0\u7D22\u3001\u53EF\u590D\u7528\u7684\u77E5\u8BC6\u5361\u3002",
    "now.cardC.kicker": "OUTPUT",
    "now.cardC.title": "\u53D1\u5E03\u8282\u594F",
    "now.cardC.body": "\u4FDD\u6301\u7A33\u5B9A\u53D1\u5E03\uFF1A\u957F\u6587\u3001\u77ED\u7B14\u8BB0\u4E0E\u4E66\u5355\u540C\u6B65\u66F4\u65B0\u3002"
    "contact.text": "鎴戞効鎰忓拰涓嶅悓棰嗗煙鐨勪汉涓€璧峰仛鏈夋剰鎬濈殑椤圭洰銆?br>濡傛灉浣犱篃鍦ㄥ仛闀挎湡鍐呭鎴栦骇鍝侊紝娆㈣繋鑱旂郴鎴戙€?,

    "footer.title": "TPBLOG | iOS 椋庢牸涓汉涓婚〉",
    "footer.github": "GitHub",
    "footer.bilibili": "Bilibili",
    "footer.email": "Email"
  },
  en: {
    "meta.title": "TPBLOG | iOS Style Home",
    "meta.description": "TPBLOG iOS-style personal homepage with bilingual support and auto day/night theme.",

    "nav.home": "Home",
    "nav.posts": "Posts",
    "nav.knowledge": "Knowledge",
    "nav.stats": "Stats",
    "nav.books": "Books",

    "locale.switchToEn": "Switch to English",
    "locale.switchToZh": "鍒囨崲鍒颁腑鏂?,

    "hero.kicker": "PERSONAL HOME",
    "hero.subtitle": "A cleaner iOS-style dashboard for focused work.",
    "hero.roleLabel": "Current long-term focus:",
    "hero.text": "Writing, engineering, and learning are now consolidated into one calm homepage.",
    "hero.actionPrimary": "Open Knowledge Base",
    "hero.actionSecondary": "Browse Reading List",

    "theme.day": "Day Mode",
    "theme.night": "Night Mode",
    "theme.autoShort": "AUTO",
    "theme.dayShort": "DAY",
    "theme.nightShort": "NIGHT",
    "theme.toggleHintAuto": "Auto mode on. Click to switch to day mode.",
    "theme.toggleHintDay": "Day mode on. Click to switch to night mode.",
    "theme.toggleHintNight": "Night mode on. Click to switch back to auto mode.",

    "dashboard.nowLabel": "Current State",
    "dashboard.clockLabel": "Local Time",
    "dashboard.focusLabel": "Today's Focus",
    "dashboard.focusA": "Ship one high-quality post",
    "dashboard.focusB": "Refine three knowledge cards",
    "dashboard.focusC": "Keep single-threaded execution",
    "dashboard.greetMorning": "Good morning, move core tasks first",
    "dashboard.greetAfternoon": "Good afternoon, deep work window is open",
    "dashboard.greetEvening": "Good evening, ideal time for review",
    "dashboard.greetNight": "Night mode: keep the workload light",
    "dashboard.sceneDay": "DAYLIGHT MODE ACTIVE",
    "dashboard.sceneNight": "NIGHT MODE ACTIVE",

    "intro.line": "I share #coding #writing #product #life.<br>These stories have reached <strong>{count}</strong> reads.",

    "posts.title": "Featured Posts",
    "posts.empty": "No content in this category yet.",
    "posts.open": "Read Full Article",
    "posts.close": "Close",
    "posts.readCount": "{count} reads",
    "posts.modalTitle": "Article: {title}",

    "filter.all": "All",
    "filter.tech": "Tech",
    "filter.life": "Life",
    "filter.notes": "Notes",

    "knowledge.title": "Knowledge Base",
    "knowledge.sub": "Concepts, methods, and templates with search and tag filters.",
    "knowledge.searchLabel": "Search",
    "knowledge.searchPlaceholder": "Type keywords: SSR, retrospective, writing template...",
    "knowledge.tagAll": "All",
    "knowledge.open": "Read Full Page",
    "knowledge.readCount": "{count} reads",
    "knowledge.countPrefix": "",
    "knowledge.countSuffix": "knowledge cards",
    "knowledge.empty": "No matching card found. Try shorter keywords or another tag.",
    "knowledge.updated": "Updated {date}",

    "stats.timeTitle": "Time Allocation",
    "stats.timeDesc": "In the last 90 days, most of my energy went to engineering and content.",
    "stats.bar.dev": "Build",
    "stats.bar.writing": "Write",
    "stats.bar.reading": "Read",
    "stats.bar.fitness": "Fitness",

    "snapshot.title": "System Snapshot",
    "snapshot.sub": "The homepage is modular, lightweight, and built to evolve.",
    "snapshot.posts": "Posts",
    "snapshot.knowledge": "Cards",
    "snapshot.books": "Books",
    "snapshot.reads": "Reads",

    "books.title": "Reading List",
    "books.sub": "Books I repeatedly recommend from recent years.",

    "now.title": "Now / Build Notes",
    "now.sub": "Inspired by the rhythm of qzq.at, this block captures current direction and experiments.",
    "now.cardA.kicker": "BUILD",
    "now.cardA.title": "Core Engineering",
    "now.cardA.body": "Iterating content pipelines and visual admin controls for this blog.",
    "now.cardB.kicker": "RESEARCH",
    "now.cardB.title": "Knowledge System",
    "now.cardB.body": "Turning weekly inputs into searchable and reusable knowledge cards.",
    "now.cardC.kicker": "OUTPUT",
    "now.cardC.title": "Publishing Rhythm",
    "now.cardC.body": "Keeping a stable cadence across long posts, short notes, and reading logs."
    "contact.text": "I love collaborating with people from different domains.<br>If you're building long-term content or products, feel free to reach out.",

    "footer.title": "TPBLOG | iOS Style Personal Home",
    "footer.github": "GitHub",
    "footer.bilibili": "Bilibili",
    "footer.email": "Email"
  }
};

function interpolate(template, params) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{${key}}`;
  });
}

export function t(key, params = {}) {
  const current = translations[store.locale] || translations.zh;
  const fallback = translations.zh;
  const source = Object.prototype.hasOwnProperty.call(current, key)
    ? current[key]
    : Object.prototype.hasOwnProperty.call(fallback, key)
      ? fallback[key]
      : key;

  return interpolate(source, params);
}

export function getLocale() {
  return store.locale;
}

export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-html]").forEach((node) => {
    node.innerHTML = t(node.dataset.i18nHtml);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });

  root.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });

  document.title = t("meta.title");
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", t("meta.description"));
  }
}

function saveLocale(nextLocale) {
  try {
    localStorage.setItem(STORAGE_KEYS.locale, nextLocale);
  } catch {
    // ignore storage write failure
  }
}

function readStoredLocale() {
  try {
    return localStorage.getItem(STORAGE_KEYS.locale);
  } catch {
    return null;
  }
}

function detectBrowserLocale() {
  const raw = (navigator.language || "zh").toLowerCase();
  return raw.startsWith("zh") ? "zh" : "en";
}

function updateToggleButton(button) {
  if (!button) return;

  if (store.locale === "zh") {
    button.textContent = "EN";
    button.setAttribute("aria-label", t("locale.switchToEn"));
  } else {
    button.textContent = "涓?;
    button.setAttribute("aria-label", t("locale.switchToZh"));
  }
}

export function onLocaleChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function setLocale(nextLocale, options = {}) {
  if (!isLocale(nextLocale) || store.locale === nextLocale) {
    return;
  }

  store.locale = nextLocale;
  document.documentElement.lang = nextLocale === "zh" ? "zh-CN" : "en";
  saveLocale(nextLocale);
  applyI18n();

  if (!options.silent) {
    listeners.forEach((listener) => listener(nextLocale));
  }
}

export function initI18n(button) {
  const stored = readStoredLocale();
  const locale = isLocale(stored) ? stored : detectBrowserLocale();

  store.locale = locale;
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  applyI18n();

  if (button) {
    updateToggleButton(button);

    button.addEventListener("click", () => {
      const nextLocale = store.locale === "zh" ? "en" : "zh";
      setLocale(nextLocale);
      updateToggleButton(button);
    });

    onLocaleChange(() => {
      updateToggleButton(button);
    });
  }
}


