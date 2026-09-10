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
    "/app/": "/en/app/",
    "/download": "/en/download",
    "/download/": "/en/download/",
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
        footerCopy: "Hold on to your dreams, understand the patterns.",
        menuOpen: "Open menu", homeAria: "jume home", footerNav: "Footer navigation",
        mainNav: "Main navigation" }
    : { start: "Start", mond: "Mondimpulse", wissen: "Traumwissen", app: "App",
        newsletter: "Newsletter", langLabel: "EN", langAria: "Switch to English",
        imprint: "Impressum", privacy: "Datenschutz", cookie: "Cookie-Einstellungen",
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
              <a href="/impressum.html">${t.imprint}</a>
              <a href="/datenschutz.html">${t.privacy}</a>
              <a href="https://www.instagram.com/jume.app/" target="_blank" rel="noopener">Instagram</a>
              <button onclick="if(window.jumeResetConsent)jumeResetConsent();else{try{localStorage.removeItem('jume_consent')}catch(e){}location.reload();}" style="background:none;border:none;cursor:pointer;font:inherit;font-size:inherit;color:inherit;padding:0;text-decoration:underline;text-underline-offset:2px;">${t.cookie}</button>
            </nav>
            <p class="footer-copy">© ${new Date().getFullYear()} jume · ${t.footerCopy}</p>
          </div>
        </div>
      </footer>
    `;
  }

  // Newsletter form: localStorage email preview
  const emailPreview = document.querySelector("[data-newsletter-email]");
  if (emailPreview) {
    try {
      const storedEmail = localStorage.getItem("jume_newsletter_email");
      if (storedEmail) emailPreview.textContent = storedEmail;
    } catch (_) {}
  }
})();
