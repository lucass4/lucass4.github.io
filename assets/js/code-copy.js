// Adds a copy button to each highlighted code block. No-ops when the page has
// no code, and when the Clipboard API is unavailable.
(function () {
  if (!navigator.clipboard) return;
  var blocks = document.querySelectorAll(".prose .highlight");
  if (!blocks.length) return;

  Array.prototype.forEach.call(blocks, function (block) {
    var code = block.querySelector("pre > code");
    if (!code) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-code mono";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code to clipboard");

    var reset;
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(code.innerText).then(
        function () {
          btn.textContent = "Copied";
          clearTimeout(reset);
          reset = setTimeout(function () {
            btn.textContent = "Copy";
          }, 2000);
        },
        function () {
          btn.textContent = "Failed";
        }
      );
    });

    block.appendChild(btn);
  });
})();
