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

  const demoVideo = document.querySelector(".demo-video");
  if (demoVideo) {
    const videoInner = demoVideo.closest(".video-inner");
    if (videoInner && demoVideo.paused) {
      videoInner.classList.add("is-paused");
    }

    demoVideo.addEventListener("play", () => {
      if (videoInner) {
        videoInner.classList.remove("is-paused");
      }
    });

    demoVideo.addEventListener("pause", () => {
      if (videoInner) {
        videoInner.classList.add("is-paused");
      }
    });

    demoVideo.addEventListener("click", () => {
      if (demoVideo.paused) {
        demoVideo.play();
      } else {
        demoVideo.pause();
      }
    });
  }

  const renderAsciiChart = (data) => {
    const lines = [];
    const barChar = "#";
    const padLabel = Math.max(...data.systems.map((name) => name.length), 8);

    data.metrics.forEach((metric, index) => {
      const entries = data.systems.map((name) => ({
        name,
        value: metric.values[name],
      }));
      const values = entries
        .map((entry) => entry.value)
        .filter((v) => Number.isFinite(v));
      const max = Math.max(...values);
      const min = Math.min(...values);
      const range = Math.max(max - min, 1);

      lines.push(`${metric.label}`);
      entries.forEach((entry) => {
        const rawValue = Number.isFinite(entry.value) ? entry.value : 0;
        const normalized = metric.lowerIsBetter
          ? (max - rawValue) / range
          : (rawValue - min) / range;
        const barLength = Math.max(1, Math.round(normalized * data.width));
        const bar = barChar.repeat(barLength).padEnd(data.width, " ");
        const label = entry.name.padEnd(padLabel, " ");
        lines.push(`${label} |${bar}| ${rawValue}${metric.unit}`);
      });
      if (index < data.metrics.length - 1) {
        lines.push("");
      }
    });

    return lines.join("\n");
  };

  const baseSystems = [
    "ObscuraVim",
    "clickstat.nvim",
    "LazyNvim",
    "AstroNvim",
    "NvChad",
    "LunarVim",
    "Kickstart.nvim",
  ];

  const perfDataLightweight = {
    width: 28,
    systems: baseSystems,
    metrics: [
      {
        label: "Idle RAM (MB)",
        unit: "MB",
        lowerIsBetter: true,
        values: {
          ObscuraVim: 52,
          "clickstat.nvim": 110,
          LazyNvim: 160,
          AstroNvim: 190,
          NvChad: 150,
          LunarVim: 175,
          "Kickstart.nvim": 105,
        },
      },
    ],
  };

  const perfDataFast = {
    width: 28,
    systems: baseSystems,
    metrics: [
      {
        label: "Startup (ms)",
        unit: "ms",
        lowerIsBetter: true,
        values: {
          ObscuraVim: 48,
          "clickstat.nvim": 95,
          LazyNvim: 130,
          AstroNvim: 170,
          NvChad: 140,
          LunarVim: 160,
          "Kickstart.nvim": 85,
        },
      },
    ],
  };

  const perfChartLightweight = document.querySelector("#perf-chart-lightweight");
  if (perfChartLightweight) {
    perfChartLightweight.textContent = renderAsciiChart(perfDataLightweight);
  }

  const perfChartFast = document.querySelector("#perf-chart-fast");
  if (perfChartFast) {
    perfChartFast.textContent = renderAsciiChart(perfDataFast);
  }
});
