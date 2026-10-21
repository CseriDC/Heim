(function () {
  "use strict";

  // Header: transparent over the dark hero, solid once the page scrolls
  var header = document.querySelector("[data-header]");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 24 && !document.body.classList.contains("nav-open"));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile navigation
  var burger = document.querySelector("[data-burger]");
  var mobileNav = document.getElementById("mobile-nav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") !== "true";
      burger.setAttribute("aria-expanded", String(open));
      mobileNav.hidden = !open;
      document.body.classList.toggle("nav-open", open);
      onScroll();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileNav.hidden) burger.click();
    });
  }

  // Filter chips (projects, jobs) + free-text job search
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var target = document.querySelector(group.getAttribute("data-filter-group"));
    if (!target) return;
    var items = Array.prototype.slice.call(target.querySelectorAll("[data-cat]"));
    var search = document.querySelector(group.getAttribute("data-search") || "#__none");
    var empty = target.parentNode.querySelector("[data-empty]");
    var active = "alle";

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;
      items.forEach(function (el) {
        var cats = el.getAttribute("data-cat").split(" ");
        var okCat = active === "alle" || cats.indexOf(active) !== -1;
        var okText = !q || el.textContent.toLowerCase().indexOf(q) !== -1;
        el.hidden = !(okCat && okText);
        if (!el.hidden) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    }

    group.querySelectorAll("[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        active = chip.getAttribute("data-filter");
        group.querySelectorAll("[data-filter]").forEach(function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);

    // Preselect via #anchor (e.g. karriere.html#technik)
    function fromHash() {
      var hash = (location.hash || "").replace("#", "");
      var pre = hash && group.querySelector('[data-filter="' + hash + '"]');
      if (pre) pre.click();
    }
    window.addEventListener("hashchange", fromHash);
    fromHash();
  });

  // Forms: post to data-endpoint when configured, otherwise explain the e-mail route
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var note = form.querySelector("[data-form-note]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var endpoint = form.getAttribute("data-endpoint");
      var mail = form.getAttribute("data-mail");
      function show(msg) { if (note) { note.textContent = msg; note.hidden = false; } }
      if (!endpoint) {
        show("Vielen Dank. Der Online-Versand wird gerade eingerichtet. Bitte senden Sie Ihre Nachricht bis dahin direkt an " + mail + ".");
        return;
      }
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(String(r.status));
          form.reset();
          show("Vielen Dank. Ihre Nachricht ist bei uns eingegangen, wir melden uns zeitnah bei Ihnen.");
        })
        .catch(function () {
          show("Die Nachricht konnte nicht übermittelt werden. Bitte versuchen Sie es erneut oder schreiben Sie an " + mail + ".");
        })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  });

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());
})();
