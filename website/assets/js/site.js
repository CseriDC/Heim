(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile navigation
  var burger = document.querySelector("[data-burger]");
  var mobileNav = document.getElementById("mobile-nav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") !== "true";
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      document.body.classList.toggle("nav-open", open);
      if (open) { mobileNav.hidden = false; requestAnimationFrame(function () { mobileNav.classList.add("is-open"); }); }
      else { mobileNav.classList.remove("is-open"); setTimeout(function () { if (!mobileNav.classList.contains("is-open")) mobileNav.hidden = true; }, 300); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !mobileNav.hidden) burger.click(); });
  }

  // Hero film: autoplay only without reduced-motion preference, always pausable
  var film = document.querySelector("[data-film]");
  var toggle = document.querySelector("[data-film-toggle]");
  if (film) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var setState = function (playing) {
      if (!toggle) return;
      toggle.setAttribute("aria-label", playing ? "Film anhalten" : "Film abspielen");
      toggle.querySelector("[data-icon-pause]").hidden = !playing;
      toggle.querySelector("[data-icon-play]").hidden = playing;
    };
    if (!reduce) { var p = film.play(); if (p && p.catch) p.catch(function () { setState(false); }); }
    setState(!reduce);
    film.addEventListener("play", function () { setState(true); });
    film.addEventListener("pause", function () { setState(false); });
    if (toggle) toggle.addEventListener("click", function () { if (film.paused) film.play(); else film.pause(); });
  }

  // Filters (projects, jobs) and free-text job search
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var target = document.querySelector(group.getAttribute("data-filter-group"));
    if (!target) return;
    var items = Array.prototype.slice.call(target.querySelectorAll("[data-cat]"));
    var search = group.getAttribute("data-search") ? document.querySelector(group.getAttribute("data-search")) : null;
    var empty = document.querySelector(group.getAttribute("data-empty") || "#__none");
    var active = "alle";
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;
      items.forEach(function (el) {
        var ok = (active === "alle" || el.getAttribute("data-cat").split(" ").indexOf(active) !== -1) && (!q || el.textContent.toLowerCase().indexOf(q) !== -1);
        el.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    }
    group.querySelectorAll("[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        active = chip.getAttribute("data-filter");
        group.querySelectorAll("[data-filter]").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);
    function fromHash() {
      var h = (location.hash || "").replace("#", "");
      var chip = h && group.querySelector('[data-filter="' + h + '"]');
      if (chip) chip.click();
    }
    window.addEventListener("hashchange", fromHash);
    fromHash();
  });

  // Gallery lightbox
  var box = document.querySelector("[data-lightbox]");
  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-shot]"));
  if (box && shots.length && box.showModal) {
    var img = box.querySelector("img");
    var count = box.querySelector("[data-lb-count]");
    var i = 0;
    var show = function (n) {
      i = (n + shots.length) % shots.length;
      img.src = shots[i].getAttribute("data-shot");
      img.alt = shots[i].querySelector("img").alt;
      count.textContent = (i + 1) + " / " + shots.length;
    };
    shots.forEach(function (b, n) { b.addEventListener("click", function () { show(n); box.showModal(); }); });
    box.querySelector("[data-lb-close]").addEventListener("click", function () { box.close(); });
    box.querySelector("[data-lb-prev]").addEventListener("click", function () { show(i - 1); });
    box.querySelector("[data-lb-next]").addEventListener("click", function () { show(i + 1); });
    box.addEventListener("click", function (e) { if (e.target === box || e.target.classList.contains("lightbox-inner")) box.close(); });
    box.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") show(i - 1); if (e.key === "ArrowRight") show(i + 1); });
  }

  // Forms: post to data-endpoint when configured, otherwise name the e-mail route
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var note = form.querySelector("[data-form-note]");
    function show(msg) { if (note) { note.textContent = msg; note.hidden = false; } }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var endpoint = form.getAttribute("data-endpoint");
      var mail = form.getAttribute("data-mail");
      if (!endpoint) { show("Danke. Der Online-Versand wird gerade eingerichtet. Bitte senden Sie Ihre Nachricht bis dahin an " + mail + "."); return; }
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error(String(r.status)); form.reset(); show("Danke. Ihre Nachricht ist bei uns eingegangen. Wir melden uns persönlich bei Ihnen."); })
        .catch(function () { show("Die Nachricht wurde nicht übertragen. Bitte versuchen Sie es erneut oder schreiben Sie an " + mail + "."); })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  });

  // Scroll reveal: once, when entering the viewport; staggered for lists. Content above the fold stays untouched.
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && "IntersectionObserver" in window) {
    var targets = [];
    document.querySelectorAll("[data-reveal]").forEach(function (el) { targets.push(el); });
    document.querySelectorAll("[data-stagger]").forEach(function (list) {
      Array.prototype.forEach.call(list.children, function (el, i) { el.style.setProperty("--i", String(i % 6)); targets.push(el); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("will-reveal"); io.observe(el); }
    });
  }

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());
})();
