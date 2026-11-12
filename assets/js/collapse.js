// Collapses the table of contents and the case study factsheet on narrow
// screens. Both ship with `open` in the HTML so that without JavaScript the
// content is all visible, which is the behaviour this replaced. Above the
// sidebar breakpoint CSS hides the summaries and both stay expanded.
(function () {
  var targets = [
    { el: document.getElementById("toc-details"), query: "(min-width: 72rem)" },
    { el: document.querySelector(".factsheet-wrap"), query: "(min-width: 48rem)" },
  ];

  targets.forEach(function (t) {
    if (!t.el) return;
    var mq = window.matchMedia(t.query);

    function apply() {
      t.el.open = mq.matches;
    }

    apply();
    mq.addEventListener("change", apply);
  });
})();
