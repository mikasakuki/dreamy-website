/**
 * jume Cookie Consent
 * DSGVO-konformes Consent-Management für Google Fonts & externe Dienste.
 * Kein Tracking, kein Analytics — nur das Nötigste.
 */
(function () {
  var KEY = 'jume_consent';
  var stored = null;

  try { stored = localStorage.getItem(KEY); } catch (e) {}

  /* ── Externe Ressourcen laden ── */
  function loadGoogleFonts() {
    if (document.getElementById('jume-gfonts')) return;
    var pc1 = document.createElement('link');
    pc1.rel = 'preconnect'; pc1.href = 'https://fonts.googleapis.com';
    var pc2 = document.createElement('link');
    pc2.rel = 'preconnect'; pc2.href = 'https://fonts.gstatic.com'; pc2.crossOrigin = 'anonymous';
    var link = document.createElement('link');
    link.id = 'jume-gfonts'; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap';
    document.head.appendChild(pc1);
    document.head.appendChild(pc2);
    document.head.appendChild(link);
  }

  /* ── Bereits Einwilligung gegeben ── */
  if (stored === 'all') {
    loadGoogleFonts();
    exposeReset();
    return;
  }

  /* ── Bereits abgelehnt ── */
  if (stored === 'essential') {
    exposeReset();
    return;
  }

  /* ── Noch keine Entscheidung → Banner anzeigen ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }

  function showBanner() {
    if (document.getElementById('cookie-banner')) return;

    var el = document.createElement('div');
    el.id = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie-Einstellungen');
    el.innerHTML =
      '<div class="cb-inner">' +
        '<div class="cb-icon">🍪</div>' +
        '<div class="cb-text">' +
          '<strong class="cb-title">Cookies &amp; externe Dienste</strong>' +
          '<p class="cb-body">Wir verwenden Google Fonts (Schriftdarstellung) und Brevo (Newsletter). ' +
          'Dabei können Daten an Serverstandorte der Anbieter übermittelt werden. ' +
          '<a href="/datenschutz.html" class="cb-link">Datenschutzerklärung</a></p>' +
        '</div>' +
        '<div class="cb-actions">' +
          '<button id="cb-reject" class="cb-btn cb-btn-secondary">Nur notwendige</button>' +
          '<button id="cb-accept" class="cb-btn cb-btn-primary">Alle akzeptieren</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(el);

    // Transition in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('cb-visible'); });
    });

    function dismiss(el) {
      el.classList.remove('cb-visible');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
    }

    document.getElementById('cb-accept').addEventListener('click', function () {
      try { localStorage.setItem(KEY, 'all'); } catch (e) {}
      loadGoogleFonts();
      dismiss(el);
    });

    document.getElementById('cb-reject').addEventListener('click', function () {
      try { localStorage.setItem(KEY, 'essential'); } catch (e) {}
      dismiss(el);
    });
  }

  function exposeReset() {
    /** Aufrufbar aus Datenschutz-Seite / Footer: setzt Einwilligung zurück */
    window.jumeResetConsent = function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      location.reload();
    };
  }

  exposeReset();
})();
