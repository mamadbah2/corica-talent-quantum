/* CORICA Talent Quantum — interactions maquettes (vanilla JS, zéro dépendance) */
(function () {
  "use strict";

  /* --- App shell: rétracter / déployer le rail --- */
  var railToggle = document.querySelector(".rail__toggle");
  if (railToggle) {
    railToggle.addEventListener("click", function () {
      document.querySelector(".app").classList.toggle("is-collapsed");
    });
  }

  /* --- Fiche latérale (drawer) : ouverture au clic sur une ligne --- */
  var drawer = document.getElementById("drawer");
  var drawerScrim = document.getElementById("drawer-scrim");
  if (drawer && drawerScrim) {
    var openDrawer = function () { drawer.classList.add("is-open"); drawerScrim.classList.add("is-open"); };
    var closeDrawer = function () { drawer.classList.remove("is-open"); drawerScrim.classList.remove("is-open"); };
    document.querySelectorAll("[data-open-drawer]").forEach(function (el) {
      el.addEventListener("click", openDrawer);
    });
    drawerScrim.addEventListener("click", closeDrawer);
    var dc = drawer.querySelector(".drawer__close");
    if (dc) dc.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  }

  /* --- Modal (dialogue centré) --- */
  var modalScrim = document.getElementById("modal-scrim");
  if (modalScrim) {
    var openModal = function () { modalScrim.classList.add("is-open"); };
    var closeModal = function () { modalScrim.classList.remove("is-open"); };
    document.querySelectorAll("[data-open-modal]").forEach(function (el) { el.addEventListener("click", openModal); });
    modalScrim.addEventListener("click", function (e) { if (e.target === modalScrim) closeModal(); });
    modalScrim.querySelectorAll(".modal__close").forEach(function (mc) { mc.addEventListener("click", closeModal); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  /* --- Panneau notifications (cloche) --- */
  var notifBtn = document.querySelector(".js-notif");
  var notifPanel = document.getElementById("notif-panel");
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener("click", function (e) { e.stopPropagation(); notifPanel.classList.toggle("is-open"); });
    document.addEventListener("click", function (e) { if (!notifPanel.contains(e.target)) notifPanel.classList.remove("is-open"); });
  }

  /* --- Login: bascule Poste de travail / Kiosque --- */
  var modeBtns = document.querySelectorAll(".modeswitch button");
  if (modeBtns.length) {
    var desktop = document.querySelector(".desktop");
    var kiosk = document.querySelector(".kiosk");
    modeBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        modeBtns.forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        var k = b.dataset.mode === "kiosk";
        if (desktop) desktop.style.display = k ? "none" : "block";
        if (kiosk) kiosk.style.display = k ? "block" : "none";
      });
    });
  }

  /* --- Login kiosque: pavé PIN --- */
  var keypad = document.getElementById("keypad");
  if (keypad) {
    var pin = "";
    var dots = document.querySelectorAll("#pins .pindot");
    var render = function () {
      dots.forEach(function (d, i) { d.classList.toggle("is-filled", i < pin.length); });
    };
    keypad.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var act = btn.dataset.act;
      if (act === "clear") { pin = ""; }
      else if (act === "enter") {
        if (pin.length === 4) { alert("Vérification du code PIN…"); }
        return;
      } else if (pin.length < 4) { pin += btn.textContent.trim(); }
      render();
    });
  }

  /* --- Évaluation: sélection des notes --- */
  document.querySelectorAll("[data-rating]").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      group.querySelectorAll("button").forEach(function (x) { x.classList.remove("is-on"); });
      btn.classList.add("is-on");
    });
  });

  /* --- Filtres à puce (compétences) --- */
  document.querySelectorAll(".toolbar").forEach(function (bar) {
    var chips = bar.querySelectorAll(".chipfilter");
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.classList.remove("is-on"); });
        c.classList.add("is-on");
      });
    });
  });

  /* --- Navigation latérale (état actif au clic, démo) --- */
  document.querySelectorAll(".rail .navitem").forEach(function (item) {
    item.addEventListener("click", function (e) {
      // démo : on laisse les liens réels naviguer s'ils existent
    });
  });
})();
