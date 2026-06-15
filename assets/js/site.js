(function () {
  const body = document.body;
  const active = body.dataset.active || "";

  const links = [
    { key: "start",   href: "/",                label: "Start" },
    { key: "mond",    href: "/mond/",            label: "Mondimpulse" },
    { key: "wissen",  href: "/wissen/",          label: "Traumwissen" },
    { key: "app",     href: "/app/",             label: "App" },
  ];

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
          <a class="brand" href="/" aria-label="jume Startseite">
            ${logoHtml}
          </a>
          <nav class="main-nav" aria-label="Hauptnavigation">
            ${links
              .map(link => `<a href="${link.href}"${active === link.key ? ' class="active"' : ""}>${link.label}</a>`)
              .join("")}
          </nav>
          <div class="header-cta">
            <a class="btn btn-primary btn-sm" href="/#newsletter">Newsletter</a>
          </div>
          <button class="nav-toggle" aria-label="Menü öffnen" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="mobile-nav" aria-hidden="true">
          ${links
            .map(link => `<a href="${link.href}"${active === link.key ? ' class="active"' : ""}>${link.label}</a>`)
            .join("")}
          <a class="btn btn-primary" href="/#newsletter" style="margin-top:8px;">Newsletter</a>
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
            <nav class="footer-links" aria-label="Footer-Navigation">
              ${links
                .map(link => `<a href="${link.href}">${link.label}</a>`)
                .join("")}
              <a href="/impressum.html">Impressum</a>
              <a href="/datenschutz.html">Datenschutz</a>
              <button onclick="if(window.jumeResetConsent)jumeResetConsent();else{try{localStorage.removeItem('jume_consent')}catch(e){}location.reload();}" style="background:none;border:none;cursor:pointer;font:inherit;font-size:inherit;color:inherit;padding:0;text-decoration:underline;text-underline-offset:2px;">Cookie-Einstellungen</button>
            </nav>
            <p class="footer-copy">© ${new Date().getFullYear()} jume · Träume festhalten, Muster verstehen.</p>
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
