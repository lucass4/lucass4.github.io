// Theme toggle. CSS already follows prefers-color-scheme, so this only adds a
// manual override; with JS off the button stays hidden and the OS decides.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function current() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function label() {
    var next = current() === "dark" ? "light" : "dark";
    btn.setAttribute("aria-label", "Switch to " + next + " theme");
  }

  btn.hidden = false;
  label();

  btn.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    label();
  });

  // Follow the OS while the visitor has not chosen for themselves.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    var stored = null;
    try {
      stored = localStorage.getItem("theme");
    } catch (e) {}
    if (!stored) {
      root.removeAttribute("data-theme");
      label();
    }
  });
})();
