const canvas = document.querySelector("#sky");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const colors = ["#ff4f93", "#6ff7ee", "#ffd166", "#a36bff", "#77f7b0"];

let width = 0;
let height = 0;
let stars = [];
let pointer = { x: 0, y: 0, active: false };

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const starCount = Math.min(160, Math.floor((width * height) / 7600));
  stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    hue: colors[Math.floor(Math.random() * colors.length)],
    pulse: Math.random() * Math.PI * 2,
  }));
}

function drawSky() {
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    0,
    width * 0.5,
    height * 0.45,
    Math.max(width, height) * 0.76,
  );
  gradient.addColorStop(0, "rgba(28, 16, 52, 0.34)");
  gradient.addColorStop(1, "rgba(5, 4, 13, 0.96)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  stars.forEach((star, index) => {
    if (!reduceMotion) {
      star.x += star.vx;
      star.y += star.vy;
      star.pulse += 0.025;
    }

    if (star.x < -10) star.x = width + 10;
    if (star.x > width + 10) star.x = -10;
    if (star.y < -10) star.y = height + 10;
    if (star.y > height + 10) star.y = -10;

    const pointerDistance = Math.hypot(star.x - pointer.x, star.y - pointer.y);
    const glow = pointer.active && pointerDistance < 150 ? 1.8 : 1;
    const radius = star.r * (1 + Math.sin(star.pulse) * 0.25) * glow;

    ctx.beginPath();
    ctx.fillStyle = star.hue;
    ctx.globalAlpha = 0.58;
    ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (index % 9 === 0) {
      ctx.beginPath();
      ctx.strokeStyle = star.hue;
      ctx.globalAlpha = 0.08;
      ctx.moveTo(star.x, star.y);
      const next = stars[(index + 7) % stars.length];
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
  });

  ctx.globalAlpha = 1;

  if (!reduceMotion) {
    requestAnimationFrame(drawSky);
  }
}

function makeSpark(x, y, amount = 18) {
  for (let i = 0; i < amount; i += 1) {
    const spark = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 36 + Math.random() * 92;
    spark.className = "spark";
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    spark.style.setProperty("--spark-color", colors[i % colors.length]);
    document.body.appendChild(spark);
    spark.addEventListener("animationend", () => spark.remove());
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setActivePromise(tile) {
  const display = document.querySelector("#messageDisplay");
  document
    .querySelectorAll(".promise-tile")
    .forEach((button) => {
      const isActive = button === tile;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

  display.innerHTML = `
    <p class="display-kicker">${tile.dataset.tone}</p>
    <h3>${tile.dataset.title}</h3>
    <p>${tile.dataset.copy}</p>
  `;
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

document.querySelector("#burstButton").addEventListener("click", (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  makeSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);
  showToast("This is small, but I mean it.");
});

document.querySelector("#heartButton").addEventListener("click", (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  makeSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, 34);
  showToast("I love you. I'm listening.");
});

document.querySelector("#finalButton").addEventListener("click", (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  makeSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
  showToast("No rush. I'm here.");
});

document.querySelectorAll(".promise-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    setActivePromise(tile);
    const rect = tile.getBoundingClientRect();
    makeSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
  });
});

document.querySelectorAll(".constellation button").forEach((button) => {
  button.addEventListener("click", () => {
    const isLit = button.classList.toggle("lit");
    button.setAttribute("aria-pressed", String(isLit));
    const rect = button.getBoundingClientRect();
    makeSpark(rect.left + rect.width / 2, rect.top, 12);

    const lit = document.querySelectorAll(".constellation button.lit").length;
    if (lit === 5) {
      showToast("All five are lit. I mean every one.");
    }
  });
});

resizeCanvas();
drawSky();
