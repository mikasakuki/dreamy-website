(function () {
  const body = document.body;
  const active = body.dataset.active || "";
  const lang = (body.dataset.lang === "en") ? "en" : "de";
  const isEn = lang === "en";

  // ── Sprachlogik ─────────────────────────────────────────────────────────
  // Explizite Zuordnung DE-Pfad -> EN-Pfad. NUR Seiten hier eintragen, die
  // wirklich auf Englisch existieren (sonst würde die Auto-Weiterleitung ins
  // Leere zeigen). Wird schrittweise erweitert, während die Seiten übersetzt
  // werden.
  const PAGE_MAP = {
    "/": "/en/",
    "/index.html": "/en/",
    "/mond/": "/en/moon/",
    "/wissen/": "/en/knowledge/",
    "/wissen/traumdeutung/": "/en/knowledge/dream-interpretation/",
    "/wissen/glossar/": "/en/knowledge/glossary/",
    "/wissen/natal-chart/": "/en/knowledge/birth-chart/",
    "/mond/vollmond-im-widder-26-september-2026/": "/en/moon/full-moon-in-aries-september-26-2026/",
    "/mond/neumond-in-jungfrau-11-september-2026/": "/en/moon/new-moon-in-virgo-september-11-2026/",
    "/mond/vollmondnaechte-traumtagebuch/": "/en/moon/full-moon-nights-and-your-dream-journal/",
    "/mond/neumondnaechte-traumtagebuch/": "/en/moon/new-moon-nights-and-your-dream-journal/",
    "/mond/vollmond-in-den-fischen-28-august-2026/": "/en/moon/full-moon-in-pisces-august-28-2026/",
    "/mond/neumond-im-loewe-12-august-2026/": "/en/moon/new-moon-in-leo-august-12-2026/",
    "/mond/vollmond-im-wassermann-29-juli-2026/": "/en/moon/full-moon-in-aquarius-july-29-2026/",
    "/mond/neumond-im-krebs-14-juli-2026/": "/en/moon/new-moon-in-cancer-july-14-2026/",
    "/mond/vollmond-im-steinbock-30-juni-2026/": "/en/moon/full-moon-in-capricorn-june-30-2026/",
    "/mond/neumond-im-zwillinge-15-juni-2026/": "/en/moon/new-moon-in-gemini-june-15-2026/",
    "/mond/vollmond-im-schuetzen-31-mai-2026/": "/en/moon/full-moon-in-sagittarius-may-31-2026/",
    "/mond/vollmond-im-skorpion-1-mai-2026/": "/en/moon/full-moon-in-scorpio-may-1-2026/",
    "/app/": "/en/app/",
    "/faq/": "/en/faq/",
    "/download": "/en/download",
    "/download/": "/en/download/",
    "/impressum.html": "/en/imprint/",
    "/datenschutz.html": "/en/privacy/",
    "/datenschutz-app.html": "/en/app-privacy/",
    "/agb/": "/en/terms/",
    "/konto-loeschen.html": "/en/delete-account/",
    "/daten-loeschen.html": "/en/delete-data/",
  };
  const EN_TO_DE = Object.fromEntries(
    Object.entries(PAGE_MAP).map(([de, en]) => [en, de])
  );

  function normalizePath(p) {
    // "/en/index.html" -> "/en/", "/index.html" -> "/"
    return p.replace(/index\.html$/, "") || "/";
  }
  const path = normalizePath(location.pathname);

  function storedLangPref() {
    try { return localStorage.getItem("jume_lang"); } catch (_) { return null; }
  }
  function setLangPref(v) {
    try { localStorage.setItem("jume_lang", v); } catch (_) {}
  }

  // Auto-Weiterleitung (standortabhängig über Browsersprache), nur wenn eine
  // übersetzte Gegenstück-Seite existiert. Explizite Nutzerwahl gewinnt immer.
  (function autoRedirect() {
    const pref = storedLangPref();
    if (!isEn) {
      const enTarget = PAGE_MAP[path];
      if (!enTarget) return; // kein EN-Gegenstück -> auf DE bleiben
      if (pref === "en") { location.replace(enTarget); return; }
      if (!pref) {
        const nav = (navigator.language || "").toLowerCase();
        if (nav && !nav.startsWith("de")) location.replace(enTarget);
      }
    } else {
      const deTarget = EN_TO_DE[path];
      if (deTarget && pref === "de") location.replace(deTarget);
    }
  })();

  // Gegenstück-Pfad für den Umschalter (null = existiert noch nicht).
  const counterpart = isEn ? (EN_TO_DE[path] || null) : (PAGE_MAP[path] || null);

  const t = isEn
    ? { start: "Home", mond: "Moon", wissen: "Dream knowledge", app: "App",
        newsletter: "Newsletter", langLabel: "DE", langAria: "Auf Deutsch wechseln",
        imprint: "Imprint", privacy: "Privacy", cookie: "Cookie settings",
        imprintHref: "/en/imprint/", privacyHref: "/en/privacy/",
        footerCopy: "Hold on to your dreams, understand the patterns.",
        menuOpen: "Open menu", homeAria: "jume home", footerNav: "Footer navigation",
        mainNav: "Main navigation" }
    : { start: "Start", mond: "Mondimpulse", wissen: "Traumwissen", app: "App",
        newsletter: "Newsletter", langLabel: "EN", langAria: "Switch to English",
        imprint: "Impressum", privacy: "Datenschutz", cookie: "Cookie-Einstellungen",
        imprintHref: "/impressum.html", privacyHref: "/datenschutz.html",
        footerCopy: "Träume festhalten, Muster verstehen.",
        menuOpen: "Menü öffnen", homeAria: "jume Startseite", footerNav: "Footer-Navigation",
        mainNav: "Hauptnavigation" };

  const base = isEn ? "/en/" : "/";
  // EN-Unterseiten, die schon existieren. Solange false, zeigt die EN-Nav auf
  // die deutsche Seite (kein 404). Beim Bauen der EN-Seite hier auf true setzen
  // UND den Pfad in PAGE_MAP oben ergänzen.
  const EN_READY = { start: true, mond: true, wissen: true, app: true };
  const NAV = [
    { key: "start",  de: "/",        en: "/en/",       label: t.start },
    { key: "mond",   de: "/mond/",   en: "/en/moon/",  label: t.mond },
    { key: "wissen", de: "/wissen/", en: "/en/knowledge/", label: t.wissen },
    { key: "app",    de: "/app/",    en: "/en/app/",   label: t.app },
  ];
  const links = NAV.map(function (n) {
    return {
      key: n.key,
      label: n.label,
      href: (isEn && EN_READY[n.key]) ? n.en : n.de,
    };
  });

  // Sprach-Umschalter: zeigt die ANDERE Sprache. Führt zum Gegenstück, sonst
  // (noch nicht übersetzt) auf die jeweilige Startseite. Merkt die Wahl.
  const switchTo = isEn ? "de" : "en";
  const switchHref = counterpart || (isEn ? "/" : "/en/");
  const langToggleHtml =
    `<a class="lang-toggle" href="${switchHref}" aria-label="${t.langAria}" ` +
    `onclick="try{localStorage.setItem('jume_lang','${switchTo}')}catch(e){}" ` +
    `style="font-weight:600;letter-spacing:.02em;">${t.langLabel}</a>`;

  // Logo: tries image first, falls back to styled text
  const depth = body.dataset.depth || "";
  const logoHtml = `
    <img
      src="${depth}assets/images/jume-logo.png"
      alt="jume"
      onerror="this.style.display='none';this.nextElementSibling.style.display='inline';"
    />
    <span class="brand-fallback" style="display:none;">jume</span>
  `;

  const headerTarget = document.getElementById("site-header");
  const footerTarget = document.getElementById("site-footer");

  if (headerTarget) {
    headerTarget.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="${base}" aria-label="${t.homeAria}">
            ${logoHtml}
          </a>
          <nav class="main-nav" aria-label="${t.mainNav}">
            ${links
              .map(link => `<a href="${link.href}"${active === link.key ? ' class="active"' : ""}>${link.label}</a>`)
              .join("")}
          </nav>
          <div class="header-cta" style="display:flex;align-items:center;gap:16px;">
            ${langToggleHtml}
            <a class="btn btn-primary btn-sm" href="${base}#newsletter">${t.newsletter}</a>
          </div>
          <button class="nav-toggle" aria-label="${t.menuOpen}" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="mobile-nav" aria-hidden="true">
          ${links
            .map(link => `<a href="${link.href}"${active === link.key ? ' class="active"' : ""}>${link.label}</a>`)
            .join("")}
          ${langToggleHtml}
          <a class="btn btn-primary" href="${base}#newsletter" style="margin-top:8px;">${t.newsletter}</a>
        </div>
      </header>
    `;

    // Toggle mobile menu
    const toggle = headerTarget.querySelector(".nav-toggle");
    const mobileNav = headerTarget.querySelector(".mobile-nav");
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.classList.toggle("open", !open);
      mobileNav.classList.toggle("open", !open);
      mobileNav.setAttribute("aria-hidden", String(open));
    });
  }

  if (footerTarget) {
    footerTarget.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-inner">
            <div class="footer-brand">
              <img
                src="${depth}assets/images/jume-logo.png"
                alt="jume"
                onerror="this.style.display='none';this.nextElementSibling.style.display='inline';"
              />
              <span style="display:none;">jume</span>
            </div>
            <nav class="footer-links" aria-label="${t.footerNav}">
              ${links
                .map(link => `<a href="${link.href}">${link.label}</a>`)
                .join("")}
              <a href="${t.imprintHref}">${t.imprint}</a>
              <a href="${t.privacyHref}">${t.privacy}</a>
              <a href="https://www.instagram.com/jume.app/" target="_blank" rel="noopener">Instagram</a>
              <button onclick="if(window.jumeResetConsent)jumeResetConsent();else{try{localStorage.removeItem('jume_consent')}catch(e){}location.reload();}" style="background:none;border:none;cursor:pointer;font:inherit;font-size:inherit;color:inherit;padding:0;text-decoration:underline;text-underline-offset:2px;">${t.cookie}</button>
            </nav>
            <p class="footer-copy">© ${new Date().getFullYear()} jume · ${t.footerCopy}</p>
          </div>
        </div>
      </footer>
    `;
  }

  // ── Interne Verlinkung: "Weitere Mondnächte" ────────────────────────────────
  // Verlinkt jeden Mond-Artikel mit allen anderen + dem Hub. Reine On-Page-SEO
  // (interne Links) + bessere Navigation. Läuft für DE (/mond/) und EN (/en/moon/).
  (function relatedMoon() {
    if (!footerTarget) return;
    const MOON = [
      { de: "/mond/vollmond-im-widder-26-september-2026/", en: "/en/moon/full-moon-in-aries-september-26-2026/", emoji: "🐏", deL: "Vollmond im Widder", enL: "Full moon in Aries" },
      { de: "/mond/neumond-in-jungfrau-11-september-2026/", en: "/en/moon/new-moon-in-virgo-september-11-2026/", emoji: "♍", deL: "Neumond in Jungfrau", enL: "New moon in Virgo" },
      { de: "/mond/vollmond-in-den-fischen-28-august-2026/", en: "/en/moon/full-moon-in-pisces-august-28-2026/", emoji: "🐟", deL: "Vollmond in den Fischen", enL: "Full moon in Pisces" },
      { de: "/mond/neumond-im-loewe-12-august-2026/", en: "/en/moon/new-moon-in-leo-august-12-2026/", emoji: "🦁", deL: "Neumond im Löwen", enL: "New moon in Leo" },
      { de: "/mond/vollmond-im-wassermann-29-juli-2026/", en: "/en/moon/full-moon-in-aquarius-july-29-2026/", emoji: "🏺", deL: "Vollmond im Wassermann", enL: "Full moon in Aquarius" },
      { de: "/mond/neumond-im-krebs-14-juli-2026/", en: "/en/moon/new-moon-in-cancer-july-14-2026/", emoji: "🦀", deL: "Neumond im Krebs", enL: "New moon in Cancer" },
      { de: "/mond/vollmond-im-steinbock-30-juni-2026/", en: "/en/moon/full-moon-in-capricorn-june-30-2026/", emoji: "🐐", deL: "Vollmond im Steinbock", enL: "Full moon in Capricorn" },
      { de: "/mond/neumond-im-zwillinge-15-juni-2026/", en: "/en/moon/new-moon-in-gemini-june-15-2026/", emoji: "👯", deL: "Neumond in den Zwillingen", enL: "New moon in Gemini" },
      { de: "/mond/vollmond-im-schuetzen-31-mai-2026/", en: "/en/moon/full-moon-in-sagittarius-may-31-2026/", emoji: "🏹", deL: "Vollmond im Schützen", enL: "Full moon in Sagittarius" },
      { de: "/mond/vollmond-im-skorpion-1-mai-2026/", en: "/en/moon/full-moon-in-scorpio-may-1-2026/", emoji: "🦂", deL: "Vollmond im Skorpion", enL: "Full moon in Scorpio" },
      { de: "/mond/vollmondnaechte-traumtagebuch/", en: "/en/moon/full-moon-nights-and-your-dream-journal/", emoji: "🌕", deL: "Vollmondnächte & Traumtagebuch", enL: "Full moon nights & your journal" },
      { de: "/mond/neumondnaechte-traumtagebuch/", en: "/en/moon/new-moon-nights-and-your-dream-journal/", emoji: "🌑", deL: "Neumondnächte & Traumtagebuch", enL: "New moon nights & your journal" },
    ];
    const cur = path;
    const onArticle = MOON.some((m) => (isEn ? m.en : m.de) === cur);
    if (!onArticle) return;
    const heading = isEn ? "More moon nights" : "Weitere Mondnächte";
    const allLabel = isEn ? "All moon phases →" : "Alle Mondphasen →";
    const hubHref = isEn ? "/en/moon/" : "/mond/";
    const chips = MOON.filter((m) => (isEn ? m.en : m.de) !== cur)
      .map((m) => {
        const href = isEn ? m.en : m.de;
        const label = isEn ? m.enL : m.deL;
        return `<a href="${href}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border:1px solid rgba(120,120,150,.22);border-radius:999px;text-decoration:none;font-size:14px;color:inherit;">${m.emoji} ${label}</a>`;
      })
      .join("");
    const section = document.createElement("section");
    section.setAttribute("aria-label", heading);
    section.style.cssText = "padding:8px 0 40px;";
    section.innerHTML =
      `<div class="container">` +
      `<h2 style="font-size:1.15rem;margin:0 0 14px;">${heading}</h2>` +
      `<div style="display:flex;flex-wrap:wrap;gap:10px;">${chips}</div>` +
      `<p style="margin-top:16px;"><a href="${hubHref}" style="font-weight:600;">${allLabel}</a></p>` +
      `</div>`;
    footerTarget.parentNode.insertBefore(section, footerTarget);
  })();

  // Newsletter form: localStorage email preview
  const emailPreview = document.querySelector("[data-newsletter-email]");
  if (emailPreview) {
    try {
      const storedEmail = localStorage.getItem("jume_newsletter_email");
      if (storedEmail) emailPreview.textContent = storedEmail;
    } catch (_) {}
  }
})();
