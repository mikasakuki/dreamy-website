(function () {
  const body = document.body;
  const depth = body.dataset.depth || "";
  const active = body.dataset.active || "";

  const links = [
    { key: "start", href: `${depth}index.html`, label: "Start" },
    { key: "mond", href: `${depth}mond/index.html`, label: "Mond" },
    { key: "glossar", href: `${depth}wissen/glossar/index.html`, label: "Glossar" }
  ];

  const headerTarget = document.getElementById("site-header");
  const footerTarget = document.getElementById("site-footer");

  if (headerTarget) {
    headerTarget.innerHTML = `
      <header class="site-header site-header-minimal">
        <div class="container header-inner">
          <a class="brand" href="${depth}index.html" aria-label="Jume Startseite">
            <span class="brand-mark" aria-hidden="true"></span>
            <span class="brand-text">
              <strong>jume</strong>
            </span>
          </a>
          <nav class="main-nav" aria-label="Hauptnavigation">
            ${links
              .map(
                (link) => `<a href="${link.href}"${active === link.key ? ' class="active"' : ""}>${link.label}</a>`
              )
              .join("")}
          </nav>
        </div>
      </header>
    `;
  }

  if (footerTarget) {
    footerTarget.innerHTML = `
      <footer class="site-footer site-footer-minimal">
        <div class="container">
          <div class="footer-card">
            <div class="footer-links">
              <a href="${depth}impressum.html">Impressum</a>
              <a href="${depth}datenschutz.html">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  const newsletterForm = document.querySelector("[data-newsletter-form]");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : "";

      if (!email) {
        event.preventDefault();
        return;
      }

      const configuredAction = newsletterForm.getAttribute("data-action-url");
      if (!configuredAction) {
        event.preventDefault();
        try {
          localStorage.setItem("jume_newsletter_email", email);
        } catch (error) {
          // ignore storage issues and continue to the fallback page
        }
        window.location.href = `${depth}check-email.html`;
      }
    });
  }

  const emailPreview = document.querySelector("[data-newsletter-email]");
  if (emailPreview) {
    try {
      const storedEmail = localStorage.getItem("jume_newsletter_email");
      if (storedEmail) {
        emailPreview.textContent = storedEmail;
      }
    } catch (error) {
      // ignore storage issues
    }
  }
})();
