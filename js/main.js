/* ==========================================================
   EDIT THIS FIRST: your name and links are used on every page.
   ========================================================== */
const SITE = {
  name: "David Yu",
  initials: "DY",
  email: "day023@ucsd.edu",
  github: "https://github.com/OppedRawen",
  linkedin: "https://www.linkedin.com/in/dawei-yu-578138227",
  location: "San Diego, CA",
};

const PAGES = [
  { href: "index.html", label: "Home" },
  { href: "journey.html", label: "Journey" },
  { href: "hobbies.html", label: "Off the clock" },
  { href: "resume.html", label: "Resume" },
  { href: "contact.html", label: "Contact" },
];

/* ---------- Header + footer (shared by every page) ---------- */
function renderChrome() {
  const current = location.pathname.split("/").pop() || "index.html";
  const header = document.querySelector("[data-header]");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <nav class="wrap nav" aria-label="Main">
        <a class="monogram" href="index.html" aria-label="Home">${SITE.initials}</a>
        <ul class="nav-pill" id="nav-pill">
          ${PAGES.map((p) => `<li><a href="${p.href}"${p.href === current ? ' aria-current="page"' : ""}>${p.label}</a></li>`).join("")}
          <li><a href="${SITE.github}" target="_blank" rel="noopener">GitHub ↗</a></li>
        </ul>
        <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="nav-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </nav>`;
    const btn = header.querySelector(".menu-btn");
    const pill = header.querySelector(".nav-pill");
    btn.addEventListener("click", () => btn.setAttribute("aria-expanded", String(pill.classList.toggle("open"))));

    // Monogram turns dark once you scroll past the dark hero / header band.
    const top = document.querySelector(".hero, .page-head");
    const onScroll = () => {
      const limit = top ? top.offsetHeight - 40 : 0;
      header.classList.toggle("scrolled", window.scrollY > limit);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  const footer = document.querySelector("[data-footer]");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="wrap">
        <h2>Let's connect</h2>
        <div class="btn-row">
          <a class="btn btn-dark" href="mailto:${SITE.email}">${SITE.email}</a>
          <a class="btn" href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
          <a class="btn" href="${SITE.github}" target="_blank" rel="noopener">GitHub</a>
          <a class="btn" href="resume.html">Resume</a>
        </div>
        <small>© ${new Date().getFullYear()} ${SITE.name} · ${SITE.location}</small>
      </div>`;
  }

  // Fill any element marked data-site="name" / "email" / etc.
  document.querySelectorAll("[data-site]").forEach((el) => {
    const key = el.dataset.site;
    if (!(key in SITE)) return;
    if (el.tagName === "A") {
      el.href = key === "email" ? `mailto:${SITE.email}` : SITE[key];
      if (!el.dataset.keepText) el.textContent = SITE[key].replace(/^https?:\/\/(www\.)?/, "");
    } else {
      el.textContent = SITE[key];
    }
  });
}

/* ---------- Missing photos/videos show a labeled placeholder ---------- */
function initMediaFallbacks() {
  const swap = (el) => {
    const src = el.getAttribute("src") || el.querySelector("source")?.getAttribute("src") || "";
    const ph = document.createElement("div");
    ph.className = "media-placeholder" + (el.classList.contains("portrait") ? " portrait" : "");
    ph.textContent = "Add " + src;
    el.replaceWith(ph);
  };
  document.querySelectorAll("img.portrait, .media-main img, .thumbs img, .mosaic img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) swap(img);
    else img.addEventListener("error", () => swap(img));
  });
  document.querySelectorAll(".media-main video").forEach((v) => {
    // The 404 may already have happened before this script ran, so check now too.
    if (v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) return swap(v);
    const source = v.querySelector("source");
    (source || v).addEventListener("error", () => swap(v));
  });
}

/* ---------- Click a photo to enlarge ---------- */
function initLightbox() {
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = '<img alt="">';
  document.body.appendChild(box);
  const big = box.querySelector("img");
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".thumbs img, .media-main img, .stop-media img");
    if (!img) return;
    big.src = img.src;
    big.alt = img.alt;
    box.classList.add("open");
  });
  box.addEventListener("click", () => box.classList.remove("open"));
  document.addEventListener("keydown", (e) => e.key === "Escape" && box.classList.remove("open"));
}

/* ---------- Sticky section nav highlights the section you're in ---------- */
function initSubnav() {
  const links = [...document.querySelectorAll(".subnav a[href^='#']")];
  if (!links.length) return;
  const targets = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
      }),
    { rootMargin: "-30% 0px -60% 0px" }
  );
  targets.forEach((t) => io.observe(t));
}

/* ---------- Resume: click a skill to highlight where you used it ---------- */
function initSkills() {
  const skills = document.querySelectorAll(".skill[data-skill]");
  if (!skills.length) return;
  const entries = document.querySelectorAll(".entry[data-skills]");
  skills.forEach((btn) =>
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") !== "true";
      skills.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", String(on));
      entries.forEach((en) => {
        const has = en.dataset.skills.split(",").map((s) => s.trim()).includes(btn.dataset.skill);
        en.classList.toggle("hit", on && has);
        en.classList.toggle("dim", on && !has);
      });
    })
  );
}

/* ---------- Fade sections in as you scroll ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("in"));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      }),
    { threshold: 0.08 }
  );
  els.forEach((e) => io.observe(e));
}

/* ---------- Contact form (opens the visitor's email app) ---------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const err = form.querySelector(`[data-error-for="${field.id}"]`);
      const bad = !field.value.trim() || (field.type === "email" && !/^\S+@\S+\.\S+$/.test(field.value));
      err?.classList.toggle("show", bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    const name = form.name.value.trim();
    const subject = `${form.topic.value} — from ${name}`;
    const body = `${form.message.value.trim()}\n\n— ${name} (${form.email.value.trim()})`;
    location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  form.querySelectorAll("input, textarea").forEach((f) =>
    f.addEventListener("input", () => form.querySelector(`[data-error-for="${f.id}"]`)?.classList.remove("show"))
  );
}

/* ---------- Looping clips respect "reduce motion" ---------- */
function initAutoplay() {
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("video[autoplay]").forEach((v) => {
    v.pause();
    v.removeAttribute("autoplay");
    v.controls = true;
  });
}

renderChrome();
initAutoplay();
initMediaFallbacks();
initLightbox();
initSubnav();
initSkills();
initReveal();
initContactForm();
