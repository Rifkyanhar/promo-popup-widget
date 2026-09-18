/*!
 * NAFA Tech — Floating Promo Popup Widget
 * Repo terpisah dari main site, tinggal di-include lewat <script> tag.
 *
 * Widget ini menampilkan SATU pesan permanen (harga tetap NAFA Tech +
 * ajakan coba lewat langganan bulanan). Tidak lagi berganti-ganti pesan
 * berdasarkan tanggal seperti versi lama.
 *
 * CARA PAKAI:
 * 1. Upload promo-popup.js dan promo-popup-config.json ini ke repo GitHub
 *    (boleh repo terpisah, misal "promo-popup-widget"), aktifkan GitHub Pages.
 * 2. Di index.html nafatech.web.id (dan halaman lain yang ingin ada popup-nya,
 *    KECUALI halaman /promo itu sendiri), tambahkan sebelum tag </body>:
 *
 *    <script src="https://USERNAME.github.io/promo-popup-widget/promo-popup.js" defer></script>
 *
 * 3. ON / OFF POPUP:
 *    Cukup edit file promo-popup-config.json di repo widget ini →
 *    ubah "enabled": true jadi false (atau sebaliknya) → commit & push.
 *    TIDAK perlu sentuh file ini atau redeploy situs utama.
 *    Catatan: GitHub Pages kadang cache beberapa menit, jadi perubahan
 *    tidak selalu instan (biasanya < 10 menit).
 */
(function () {
  "use strict";

  // ========================= KONFIGURASI DASAR =========================
  var CONFIG = {
    // Tampilkan popup setelah X milidetik sejak halaman dibuka
    delayMs: 15000,

    // Path config.json — otomatis dicari di folder yang sama dengan file ini
    configFileName: "promo-popup-config.json",

    // Jangan tampilkan popup lagi di tab/sesi yang sama setelah ditutup
    sessionStorageKey: "nftp_promo_dismissed",
  };

  // ==== ISI PESAN — edit teks di sini kalau ada perubahan harga/redaksi ====
  // GANTI_HARGA: samakan angka di bawah ini dengan harga resmi terbaru di
  // halaman /promo (index.html) dan pesan.html.
  var VARIANT = {
    eyebrow: "💬 Harga Resmi NAFA Tech",
    title: "Absensi Digital & Resto QR, <span>Harga Tetap</span>",
    desc: "Absensi Guru & Absensi Digital Instansi Rp550.000, Sistem Pesan Menu Resto QR Rp700.000 — sudah termasuk domain & maintenance 1 tahun. Belum yakin? Coba dulu lewat langganan bulanan, bisa upgrade kapan saja.",
    linkUrl: "https://nafatech.web.id/promo",
    linkLabel: "Lihat Detail Harga",
  };
  // =======================================================================

  function getConfigUrl() {
    var thisScript = document.currentScript;
    if (thisScript && thisScript.src) {
      return thisScript.src.replace(/promo-popup\.js(\?.*)?$/, CONFIG.configFileName);
    }
    return CONFIG.configFileName;
  }

  function alreadyDismissedThisSession() {
    try {
      return sessionStorage.getItem(CONFIG.sessionStorageKey) === "1";
    } catch (e) {
      return false;
    }
  }

  function markDismissed() {
    try {
      sessionStorage.setItem(CONFIG.sessionStorageKey, "1");
    } catch (e) {}
  }

  function isOnPromoPage() {
    return /\/promo\/?($|[?#])/.test(window.location.pathname);
  }

  function injectStyles() {
    if (document.getElementById("nftp-style")) return;
    var css = "" +
      "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');" +
      ".nftp-popup{position:fixed;z-index:99999;right:20px;bottom:20px;width:340px;max-width:calc(100vw - 32px);" +
        "background:linear-gradient(160deg,#12183B 0%,#0A0E24 100%);color:#F5F1E6;border-radius:20px;" +
        "border:1px solid rgba(242,169,59,.35);box-shadow:0 24px 60px -12px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.04);" +
        "font-family:'Inter',sans-serif;overflow:hidden;transform:translateY(24px) scale(.96);opacity:0;" +
        "pointer-events:none;transition:transform .5s cubic-bezier(.22,.9,.3,1),opacity .5s ease;}" +
      ".nftp-popup.nftp-show{transform:translateY(0) scale(1);opacity:1;pointer-events:auto;}" +
      ".nftp-glow{position:absolute;top:-40px;right:-40px;width:140px;height:140px;border-radius:50%;" +
        "background:radial-gradient(circle,rgba(51,198,176,.35),transparent 70%);pointer-events:none;}" +
      ".nftp-close{position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;" +
        "background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#F5F1E6;font-size:14px;" +
        "cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;z-index:2;}" +
      ".nftp-close:hover{background:rgba(255,255,255,.16);}" +
      ".nftp-body{padding:20px 20px 18px;position:relative;z-index:1;}" +
      ".nftp-eyebrow{display:inline-flex;align-items:center;gap:6px;font-family:'Space Grotesk',sans-serif;" +
        "font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#33C6B0;" +
        "background:rgba(51,198,176,.12);border:1px solid rgba(51,198,176,.3);padding:5px 10px;border-radius:999px;}" +
      ".nftp-title{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;line-height:1.2;" +
        "margin:12px 0 8px;color:#F5F1E6;}" +
      ".nftp-title span{color:#F2A93B;}" +
      ".nftp-desc{font-size:13px;line-height:1.6;color:#A7AED0;margin-bottom:6px;}" +
      ".nftp-countdown{font-size:12px;color:#F2A93B;font-weight:600;margin-bottom:14px;}" +
      ".nftp-ctas{display:flex;gap:8px;flex-wrap:wrap;}" +
      ".nftp-btn{flex:1 1 auto;text-align:center;font-family:'Space Grotesk',sans-serif;font-weight:600;" +
        "font-size:13px;padding:11px 14px;border-radius:999px;text-decoration:none;cursor:pointer;border:none;" +
        "transition:transform .15s,box-shadow .15s;white-space:nowrap;}" +
      ".nftp-btn:active{transform:scale(.97);}" +
      ".nftp-btn-primary{background:#F2A93B;color:#0A0E24;box-shadow:0 8px 20px -6px rgba(242,169,59,.5);}" +
      ".nftp-btn-ghost{background:transparent;color:#A7AED0;border:1px solid rgba(255,255,255,.16);}" +
      "@media (max-width:480px){.nftp-popup{left:16px;right:16px;bottom:16px;width:auto;}}";
    var style = document.createElement("style");
    style.id = "nftp-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildPopup() {
    var wrap = document.createElement("div");
    wrap.className = "nftp-popup";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Info NAFA Tech");

    wrap.innerHTML =
      '<div class="nftp-glow"></div>' +
      '<button class="nftp-close" aria-label="Tutup">✕</button>' +
      '<div class="nftp-body">' +
        '<span class="nftp-eyebrow">' + VARIANT.eyebrow + '</span>' +
        '<div class="nftp-title">' + VARIANT.title + '</div>' +
        '<div class="nftp-desc">' + VARIANT.desc + '</div>' +
        '<div class="nftp-ctas">' +
          '<a class="nftp-btn nftp-btn-primary" href="' + VARIANT.linkUrl + '" target="_blank" rel="noopener">' + VARIANT.linkLabel + '</a>' +
          '<button class="nftp-btn nftp-btn-ghost" data-nftp-dismiss>Nanti Saja</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    function close() {
      wrap.classList.remove("nftp-show");
      markDismissed();
      setTimeout(function () { wrap.remove(); }, 400);
    }
    wrap.querySelector(".nftp-close").addEventListener("click", close);
    wrap.querySelector("[data-nftp-dismiss]").addEventListener("click", close);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { wrap.classList.add("nftp-show"); });
    });
  }

  function init(remoteEnabled) {
    if (remoteEnabled === false) return;      // dimatikan lewat config.json
    if (isOnPromoPage()) return;               // jangan tampil di halaman /promo sendiri
    if (alreadyDismissedThisSession()) return;

    injectStyles();
    setTimeout(buildPopup, CONFIG.delayMs);
  }

  // Ambil status ON/OFF dari promo-popup-config.json. Kalau fetch gagal
  // (misal CORS/offline), fallback ke enabled=true supaya popup tetap
  // berfungsi.
  fetch(getConfigUrl(), { cache: "no-store" })
    .then(function (res) { return res.json(); })
    .then(function (cfg) { init(cfg && cfg.enabled !== false); })
    .catch(function () { init(true); });
})();
