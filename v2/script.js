document.documentElement.classList.add("has-js");

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Buka navigasi" : "Tutup navigasi");
    mainNav.classList.toggle("is-open", !isOpen);
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Buka navigasi");
    });
  });
}

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const projectCards = [...document.querySelectorAll(".project-card[data-category]")];
const visibleCount = document.getElementById("visible-count");
const emptyState = document.getElementById("empty-state");

function applyProjectFilter(filter) {
  let visible = 0;

  projectCards.forEach((card) => {
    const shouldShow = filter === "all" || card.dataset.category === filter;
    card.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });

  if (visibleCount) visibleCount.textContent = String(visible).padStart(2, "0");
  if (emptyState) emptyState.hidden = visible !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    if (filter === "research") {
      document.querySelector("#notes")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    applyProjectFilter(filter);
  });
});

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const localTime = document.getElementById("local-time");
function updateLocalTime() {
  if (!localTime) return;
  try {
    localTime.textContent = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Pontianak",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date()) + " WIB";
  } catch {
    localTime.textContent = "UTC+7";
  }
}
updateLocalTime();
window.setInterval(updateLocalTime, 1000);

const commandDialog = document.getElementById("command-dialog");
const commandInput = document.getElementById("command-input");
const commandResults = document.getElementById("command-results");
const commandLinks = commandResults ? [...commandResults.querySelectorAll("a")] : [];

function openCommandPalette() {
  if (!commandDialog || typeof commandDialog.showModal !== "function") return;
  if (!commandDialog.open) commandDialog.showModal();
  window.setTimeout(() => commandInput?.focus(), 30);
}

document.querySelectorAll("[data-open-command]").forEach((button) => {
  button.addEventListener("click", openCommandPalette);
});

document.addEventListener("keydown", (event) => {
  const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
  if (isShortcut) {
    event.preventDefault();
    openCommandPalette();
  }
});

if (commandInput && commandLinks.length) {
  commandInput.addEventListener("input", () => {
    const query = commandInput.value.trim().toLowerCase();

    commandLinks.forEach((link) => {
      link.hidden = !link.textContent.toLowerCase().includes(query);
    });
  });

  commandInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const firstVisible = commandLinks.find((link) => !link.hidden);
    if (firstVisible) firstVisible.click();
  });

  commandDialog?.addEventListener("close", () => {
    commandInput.value = "";
    commandLinks.forEach((link) => { link.hidden = false; });
  });

  commandLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (commandDialog?.open) commandDialog.close();
    });
  });
}
