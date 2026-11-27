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

  const closeMobileNav = () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka navigasi");
  };
  mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMobileNav));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
      closeMobileNav();
      menuToggle.focus();
    }
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
      hour12: false
    }).format(new Date()) + " WIB";
  } catch {
    localTime.textContent = "UTC+7";
  }
}
updateLocalTime();
window.setInterval(updateLocalTime, 30000);

const commandDialog = document.getElementById("command-dialog");
const commandInput = document.getElementById("command-input");
const commandResults = document.getElementById("command-results");
const commandLinks = commandResults ? [...commandResults.querySelectorAll("a")] : [];
const commandNoResults = document.getElementById("command-no-results");
let lastCommandTrigger = null;
let commandActiveIndex = -1;

function openCommandPalette(trigger = document.activeElement) {
  if (!commandDialog || typeof commandDialog.showModal !== "function") return;
  lastCommandTrigger = trigger instanceof HTMLElement ? trigger : null;
  if (!commandDialog.open) commandDialog.showModal();
  window.setTimeout(() => commandInput?.focus(), 30);
}

document.querySelectorAll("[data-open-command]").forEach((button) => {
  button.addEventListener("click", () => openCommandPalette(button));
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

    commandActiveIndex = -1;
    commandLinks.forEach((link) => {
      link.hidden = !link.textContent.toLowerCase().includes(query);
      link.removeAttribute("aria-current");
    });
    if (commandNoResults) commandNoResults.hidden = commandLinks.some((link) => !link.hidden);
  });

  commandInput.addEventListener("keydown", (event) => {
    const visibleLinks = commandLinks.filter((link) => !link.hidden);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!visibleLinks.length) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      commandActiveIndex = (commandActiveIndex + direction + visibleLinks.length) % visibleLinks.length;
      visibleLinks.forEach((link, index) => {
        if (index === commandActiveIndex) {
          link.setAttribute("aria-current", "true");
          link.scrollIntoView({ block: "nearest" });
        } else link.removeAttribute("aria-current");
      });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = commandActiveIndex >= 0 ? visibleLinks[commandActiveIndex] : visibleLinks[0];
      target?.click();
    }
  });

  commandDialog?.addEventListener("close", () => {
    commandInput.value = "";
    commandActiveIndex = -1;
    commandLinks.forEach((link) => {
      link.hidden = false;
      link.removeAttribute("aria-current");
    });
    if (commandNoResults) commandNoResults.hidden = true;
    if (lastCommandTrigger instanceof HTMLElement) lastCommandTrigger.focus();
  });

  commandLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (commandDialog?.open) commandDialog.close();
    });
  });
}


// Close the command palette by clicking outside its content.
commandDialog?.addEventListener("click", (event) => {
  if (event.target === commandDialog) commandDialog.close();
});

const copyrightYear = document.getElementById("copyright-year");
if (copyrightYear) copyrightYear.textContent = String(new Date().getFullYear());
