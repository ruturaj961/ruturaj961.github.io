// Light/dark mode. Light is the default; the header toggle switches to dark and the
// choice is remembered. Loaded in <head> (not deferred) so there is no flash.
(function () {
  var KEY = "rd-mode";

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(m) { try { localStorage.setItem(KEY, m); } catch (e) {} }
  function apply(m) { document.documentElement.dataset.mode = m; }

  apply(saved() === "dark" ? "dark" : "light");

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".mode-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = document.documentElement.dataset.mode === "dark" ? "light" : "dark";
      save(next);
      apply(next);
    });
  });
})();
