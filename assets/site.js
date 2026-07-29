const RETURN_KEY = "mars:return-position";

document.querySelectorAll("[data-project-link]").forEach(link => {
  link.addEventListener("click", () => {
    sessionStorage.setItem(RETURN_KEY, JSON.stringify({
      y: window.scrollY,
      anchor: link.dataset.return || "",
    }));
  });
});

if (new URLSearchParams(location.search).has("return")) {
  const stored = sessionStorage.getItem(RETURN_KEY);
  if (stored) {
    try {
      const position = JSON.parse(stored);
      requestAnimationFrame(() => {
        window.scrollTo({ top: Number(position.y) || 0, behavior: "instant" });
        history.replaceState(null, "", "/");
      });
    } catch {}
  }
}

const sectionLabel = document.querySelector(".section-label");
const sections = [...document.querySelectorAll("[data-section]")];
if (sectionLabel && sections.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) sectionLabel.textContent = visible.target.dataset.section;
  }, { rootMargin: "-28% 0px -56%", threshold: [0, .1, .4, .7] });
  sections.forEach(section => observer.observe(section));
}

const preview = document.querySelector(".archive-preview");
document.querySelectorAll("[data-preview]").forEach(row => {
  const update = () => {
    if (!preview) return;
    const [index, title, meta] = row.dataset.preview.split("|");
    preview.querySelector("span").textContent = index;
    preview.querySelector("strong").textContent = title;
    preview.querySelector("small").textContent = meta;
  };
  row.addEventListener("mouseenter", update);
  row.addEventListener("focusin", update);
});

const dialog = document.querySelector("#contact-layer");
document.querySelectorAll("[data-contact-open]").forEach(button => {
  button.addEventListener("click", () => {
    if (dialog && !dialog.open) dialog.showModal();
  });
});
document.querySelectorAll("[data-contact-close]").forEach(button => {
  button.addEventListener("click", () => dialog?.close());
});
dialog?.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && dialog?.open) dialog.close();
});

document.querySelector("#contact-form")?.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const direction = String(data.get("direction") || "A new project");
  const name = String(data.get("name") || "");
  const email = String(data.get("email") || "");
  const message = String(data.get("message") || "");
  const subject = "MARS enquiry · " + direction;
  const body = [
    "Direction: " + direction,
    "Name: " + name,
    "Email: " + email,
    "",
    message,
  ].join("\n");
  location.href = "mailto:martial.foe@gmail.com?subject=" +
    encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
});

document.querySelectorAll("[data-return-link]").forEach(link => {
  const stored = sessionStorage.getItem(RETURN_KEY);
  if (stored) link.href = "/?return=1";
});

const field = document.querySelector("[data-field]");
if (field instanceof HTMLCanvasElement) {
  const context = field.getContext("2d");
  const hero = field.closest(".hero");
  const reading = document.querySelector("[data-field-reading]");
  const labels = ["SOUND / FIELD", "PLACE / TRACE", "SPACE / LISTENING"];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: .56, y: .48 };
  let width = 0;
  let height = 0;
  let ratio = 1;
  let mode = 0;
  let targetMode = 0;
  let active = true;
  let lastFrame = 0;

  const nodes = Array.from({ length: 23 }, (_, index) => ({
    x: ((index * 47) % 97) / 100,
    y: ((index * 71 + 19) % 89) / 100,
    weight: 1 + (index % 4),
  }));

  function resizeField() {
    const bounds = field.getBoundingClientRect();
    ratio = Math.min(devicePixelRatio || 1, 1.5);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    field.width = Math.round(width * ratio);
    field.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawSound(alpha, phase) {
    const x = pointer.x * width;
    const y = pointer.y * height;
    context.save();
    context.globalAlpha = alpha * .58;
    context.strokeStyle = "#263784";
    context.lineWidth = .75;
    for (let ring = 1; ring <= 15; ring += 1) {
      const radius = ring * Math.min(width, height) * .032;
      context.beginPath();
      for (let point = 0; point <= 90; point += 1) {
        const angle = point / 90 * Math.PI * 2;
        const wave = Math.sin(angle * (3 + ring % 5) + phase * .00045 + ring) * (4 + ring * .22);
        const px = x + Math.cos(angle) * (radius + wave);
        const py = y + Math.sin(angle) * (radius * .72 + wave);
        if (point === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.stroke();
    }
    context.restore();
  }

  function drawPlace(alpha, phase) {
    context.save();
    context.globalAlpha = alpha * .62;
    context.strokeStyle = "#1a493d";
    context.fillStyle = "#1a493d";
    context.lineWidth = .8;
    for (let path = 0; path < 8; path += 1) {
      context.beginPath();
      for (let step = 0; step <= 24; step += 1) {
        const progress = step / 24;
        const px = progress * width;
        const base = (.16 + path * .095) * height;
        const bend = Math.sin(progress * Math.PI * (1.2 + path % 3) + path + phase * .00012) * height * .07;
        const attraction = (pointer.y * height - base) * Math.exp(-Math.pow(progress - pointer.x, 2) * 18) * .22;
        const py = base + bend + attraction;
        if (step === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.stroke();
    }
    [4, 9, 15, 20].forEach((step, index) => {
      const px = step / 24 * width;
      const py = (.25 + index * .14) * height +
        Math.sin(step + phase * .00012) * height * .06;
      context.fillRect(px - 2.5, py - 2.5, 5, 5);
      context.strokeRect(px - 10, py - 10, 20, 20);
    });
    context.restore();
  }

  function drawSignal(alpha, phase) {
    context.save();
    context.globalAlpha = alpha * .7;
    const positions = nodes.map((node, index) => {
      const pulse = Math.sin(phase * .00035 + index) * 4;
      return {
        x: node.x * width + pulse,
        y: node.y * height + Math.cos(phase * .00028 + index) * 4,
        weight: node.weight,
      };
    });
    context.lineWidth = .65;
    positions.forEach((node, index) => {
      positions.slice(index + 1).forEach(other => {
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance > Math.min(width, height) * .28) return;
        context.strokeStyle = "rgba(35,44,115," + (.14 + (1 - distance / (width * .28)) * .32) + ")";
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      });
    });
    positions.forEach(node => {
      const distance = Math.hypot(node.x - pointer.x * width, node.y - pointer.y * height);
      context.fillStyle = distance < 90 ? "#243990" : "#625f70";
      context.beginPath();
      context.arc(node.x, node.y, 1.2 + node.weight * .45, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();
  }

  function render(time = 0) {
    if (!context || !width || !height) return;
    if (!reducedMotion) mode += (targetMode - mode) * .045;
    else mode = targetMode;
    context.clearRect(0, 0, width, height);
    const soundAlpha = Math.max(0, 1 - Math.abs(mode - 0));
    const placeAlpha = Math.max(0, 1 - Math.abs(mode - 1));
    const signalAlpha = Math.max(0, 1 - Math.abs(mode - 2));
    drawSound(soundAlpha, time);
    drawPlace(placeAlpha, time);
    drawSignal(signalAlpha, time);
    if (reading) reading.textContent = labels[Math.round(mode)];
  }

  function loop(time) {
    if (active && (time - lastFrame > 32 || reducedMotion)) {
      render(time);
      lastFrame = time;
    }
    if (!reducedMotion) requestAnimationFrame(loop);
  }

  hero?.addEventListener("pointermove", event => {
    const bounds = hero.getBoundingClientRect();
    pointer.x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    pointer.y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    targetMode = Math.min(2, Math.floor(pointer.x * 3));
  });

  document.querySelectorAll("[data-field-mode]").forEach(element => {
    const nextMode = ["sound", "place", "room"].indexOf(element.dataset.fieldMode);
    element.addEventListener("pointerenter", () => {
      targetMode = Math.max(0, nextMode);
      pointer.x = [.32, .5, .68][Math.max(0, nextMode)];
    });
  });

  new IntersectionObserver(entries => {
    active = entries[0]?.isIntersecting ?? true;
  }).observe(hero);
  new ResizeObserver(resizeField).observe(field);
  resizeField();
  render(0);
  if (!reducedMotion) requestAnimationFrame(loop);
}
