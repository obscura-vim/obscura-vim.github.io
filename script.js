const chars = ">+*^#1234567890_{[~JxQzLPrOIhVSC=@&";

function scrambleText(el) {
  if (!el) return;
  const original = el.dataset.original || el.textContent;
  el.dataset.original = original;

  const target = original.split("");
  const output = target.map(() => "");
  const order = Array.from({ length: target.length }, (_, i) => i).sort(
    () => Math.random() - 0.5
  );

  let index = 0;
  const revealed = new Set();
  const interval = Math.max(20, Math.min(100, Math.floor(800 / target.length)));

  const timer = setInterval(() => {
    if (index >= target.length) {
      clearInterval(timer);
      el.textContent = original;
      return;
    }

    const pos = order[index];
    revealed.add(pos);
    index += 1;
    output[pos] = target[pos];

    for (let i = 0; i < target.length; i += 1) {
      if (!revealed.has(i)) {
        output[i] = target[i] === " " ? " " : chars[Math.floor(Math.random() * chars.length)];
      }
    }

    el.textContent = output.join("");
  }, interval);
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.visibility = "visible";
  document.body.style.opacity = "1";

  const targets = document.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, a, button, .btn"
  );

  targets.forEach((el) => {
    el.addEventListener("mouseover", () => scrambleText(el));
  });
});
