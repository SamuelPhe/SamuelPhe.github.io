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

// Personal Systems Lab: switch the focus shown in the hero console.
const labModes = {
  build: {
    kicker: "CURRENT FOCUS / 01",
    title: "Building useful software.",
    copy: "Eksperimen aplikasi web dan desktop, dari memahami kebutuhan hingga mencoba membangun alur yang bisa dipelajari.",
    tags: ["WEB", "DESKTOP", "PROTOTYPE"]
  },
  systems: {
    kicker: "CURRENT FOCUS / 02",
    title: "Understanding connected systems.",
    copy: "Mempelajari hubungan antara pengguna, proses, data, dan aturan yang membuat sebuah sistem informasi bekerja.",
    tags: ["INFORMATION SYSTEMS", "DATABASE", "WORKFLOW"]
  },
  research: {
    kicker: "CURRENT FOCUS / 03",
    title: "Learning through research.",
    copy: "Mengembangkan cara berpikir terstruktur melalui pengolahan data, metode penelitian, dan kolaborasi akademik.",
    tags: ["DATA", "ROC", "TOPSIS"]
  }
};
const labModeButtons = [...document.querySelectorAll("[data-lab-mode]")];
const labModeKicker = document.getElementById("lab-mode-kicker");
const labModeTitle = document.getElementById("lab-mode-title");
const labModeCopy = document.getElementById("lab-mode-copy");
const labModeTags = document.getElementById("lab-mode-tags");

function setLabMode(mode) {
  const item = labModes[mode];
  if (!item) return;
  labModeButtons.forEach((button) => {
    const active = button.dataset.labMode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (labModeKicker) labModeKicker.textContent = item.kicker;
  if (labModeTitle) labModeTitle.textContent = item.title;
  if (labModeCopy) labModeCopy.textContent = item.copy;
  if (labModeTags) {
    labModeTags.replaceChildren(...item.tags.map((tag) => {
      const chip = document.createElement("span");
      chip.textContent = tag;
      return chip;
    }));
  }
}
labModeButtons.forEach((button) => {
  button.addEventListener("click", () => setLabMode(button.dataset.labMode));
});

// Project detail explorer: concise, factual field notes for each displayed work.
const projectNotes = {
  shiyestore: {
    title: "ShiyeStore",
    context: "PERSONAL PROJECT",
    status: "BUSINESS REVIEW / DEVELOPMENT PAUSED",
    description: "Platform storefront dan top-up digital berbasis Laravel. Pengembangan fitur dijeda sementara untuk menilai kelayakan bisnis berdasarkan ketersediaan produk, harga pemasok, harga jual, biaya pembayaran, dan margin.",
    focus: "Mengevaluasi apakah model penjualan produk digital dapat berjalan dengan margin yang sehat sebelum pengembangan fitur dilanjutkan.",
    role: "Proyek personal. Pengembangan dilakukan bertahap dan saat ini berada pada tahap evaluasi bisnis.",
    tech: ["PHP", "Laravel 12", "Vue 3", "Inertia 2", "TypeScript", "Tailwind CSS", "MySQL"],
    url: ""
  },
  buktiscope: {
    title: "BuktiScope",
    context: "PERSONAL R&D",
    status: "EARLY STAGE",
    description: "Eksperimen local-first untuk memeriksa gambar bukti transfer dan menampilkan sinyal yang layak ditinjau manusia. Tujuannya membantu proses pemeriksaan, bukan memberikan vonis otomatis bahwa sebuah bukti pasti palsu.",
    focus: "Eksplorasi analisis gambar, OCR, dan penyajian sinyal dengan pendekatan yang transparan serta tetap melibatkan peninjauan manusia.",
    role: "Proyek personal / eksperimen R&D tahap awal.",
    tech: ["Python", "OCR", "Image Analysis", "FastAPI"],
    url: "https://github.com/SamuelPhe/BuktiScope"
  },
  krs: {
    title: "KRS Academic System",
    context: "TEAM PROJECT / SEMESTER 4",
    status: "ACADEMIC PROJECT",
    description: "Aplikasi desktop untuk mendukung alur pengajuan KRS mahasiswa, pemilihan jadwal, pemeriksaan bentrok, peninjauan Dosen PA, dan finalisasi oleh Kaprodi.",
    focus: "Memahami alur akademik yang melibatkan beberapa peran serta bagaimana aturan jadwal dan tahapan persetujuan saling terhubung.",
    role: "Proyek tim akademik. Portofolio menampilkan aplikasi dan alur sistem; tidak mengklaim seluruh implementasi dikerjakan sendiri.",
    tech: ["Java", "Java Swing", "MySQL", "JDBC"],
    url: "https://github.com/SamuelPhe/krs_pbo2_semester4"
  },
  ventra: {
    title: "Ventra Inventory",
    context: "TEAM PROJECT / SEMESTER 3",
    status: "ACADEMIC PROJECT",
    description: "Aplikasi inventaris desktop untuk pencatatan produk, penyesuaian stok, barang masuk dan keluar, serta informasi pengiriman.",
    focus: "Mempelajari struktur data inventaris dan hubungan antara perubahan stok, aktivitas barang, serta informasi pengiriman.",
    role: "Proyek tim akademik.",
    tech: ["Java 17", "Java Swing", "MySQL", "Maven"],
    url: "https://github.com/SamuelPhe/ventra-inventaris-pbo-semester3"
  },
  edusched: {
    title: "EduSched",
    context: "TEAM PROJECT / SEMESTER 3",
    status: "ACADEMIC PROJECT",
    description: "Aplikasi web penjadwalan ujian untuk mengatur jadwal, aktivitas guru, berkas soal, manajemen pengguna, dan laporan.",
    focus: "Mengeksplorasi pengelolaan jadwal ujian dan kebutuhan beberapa peran pengguna dalam satu aplikasi web.",
    role: "Proyek tim akademik.",
    tech: ["PHP", "MySQL", "JavaScript", "Bootstrap"],
    url: "https://github.com/SamuelPhe/apsi-semester3"
  },
  pos: {
    title: "Point of Sale",
    context: "COURSE PROJECT / SEMESTER 2",
    status: "ACADEMIC PROJECT",
    description: "Aplikasi kasir berbasis web dengan area admin dan kasir, manajemen produk dan stok, transaksi penjualan, serta riwayat transaksi.",
    focus: "Mengenal alur transaksi penjualan dan pengelolaan produk dalam aplikasi bisnis berbasis web.",
    role: "Proyek tugas kuliah.",
    tech: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
    url: "https://github.com/SamuelPhe/POS-pwd-semester2"
  },
  "roc-topsis": {
    title: "ROC–TOPSIS Decision Support",
    context: "CO-AUTHORED RESEARCH / TECHBUS 2026",
    status: "PUBLISHED",
    description: "Penelitian kolaboratif untuk mengevaluasi alternatif layanan penyimpanan cloud bagi mahasiswa IT melalui pembobotan Rank Order Centroid (ROC) dan pemeringkatan TOPSIS.",
    focus: "Menerapkan metode pengambilan keputusan multikriteria untuk membandingkan alternatif layanan penyimpanan cloud.",
    role: "Co-author dalam publikasi bersama tim.",
    tech: ["Research", "ROC", "TOPSIS", "Decision Support"],
    url: "https://doi.org/10.61245/techbus.v4i1.88"
  }
};

const projectDialog = document.getElementById("project-dialog");
const projectDialogTitle = document.getElementById("project-dialog-title");
const projectDialogContext = document.getElementById("project-dialog-context");
const projectDialogStatus = document.getElementById("project-dialog-status");
const projectDialogDescription = document.getElementById("project-dialog-description");
const projectDialogFocus = document.getElementById("project-dialog-focus");
const projectDialogRole = document.getElementById("project-dialog-role");
const projectDialogTech = document.getElementById("project-dialog-tech");
const projectDialogLink = document.getElementById("project-dialog-link");
let lastProjectTrigger = null;

function openProjectNote(key, trigger) {
  const item = projectNotes[key];
  if (!item || !projectDialog || typeof projectDialog.showModal !== "function") return;
  lastProjectTrigger = trigger instanceof HTMLElement ? trigger : null;
  projectDialogTitle.textContent = item.title;
  projectDialogContext.textContent = item.context;
  projectDialogStatus.textContent = item.status;
  projectDialogDescription.textContent = item.description;
  projectDialogFocus.textContent = item.focus;
  projectDialogRole.textContent = item.role;
  projectDialogTech.replaceChildren(...item.tech.map((name) => {
    const chip = document.createElement("span");
    chip.textContent = name;
    return chip;
  }));
  if (item.url) {
    projectDialogLink.href = item.url;
    projectDialogLink.hidden = false;
  } else {
    projectDialogLink.hidden = true;
    projectDialogLink.removeAttribute("href");
  }
  projectDialog.showModal();
}
document.querySelectorAll("[data-project-open]").forEach((button) => {
  button.addEventListener("click", () => openProjectNote(button.dataset.projectOpen, button));
});
document.querySelector("[data-close-project]")?.addEventListener("click", () => projectDialog?.close());
projectDialog?.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});
projectDialog?.addEventListener("close", () => {
  if (lastProjectTrigger instanceof HTMLElement) lastProjectTrigger.focus();
});

// System map explorer: conceptual workflows based on each project's published description.
const workflowMaps = {
  krs: {
    label: "KRS / ACADEMIC WORKFLOW",
    stages: [
      { title: "Pengajuan KRS", type: "INPUT", actor: "MAHASISWA", copy: "Mahasiswa mengajukan rencana studi dan memilih jadwal mata kuliah untuk satu semester." },
      { title: "Pemeriksaan jadwal", type: "VALIDATION", actor: "SISTEM", copy: "Pilihan jadwal diperiksa untuk membantu mengenali bentrok sebelum pengajuan diteruskan." },
      { title: "Peninjauan Dosen PA", type: "REVIEW", actor: "DOSEN PA", copy: "Dosen Pembimbing Akademik meninjau rencana studi mahasiswa sebelum proses dilanjutkan." },
      { title: "Finalisasi Kaprodi", type: "FINALIZATION", actor: "KAPRODI", copy: "Kaprodi melakukan tahap finalisasi sehingga pengajuan KRS dapat diselesaikan dan diarsipkan." }
    ]
  },
  ventra: {
    label: "VENTRA / INVENTORY WORKFLOW",
    stages: [
      { title: "Pencatatan produk", type: "DATA INPUT", actor: "PENGELOLA INVENTARIS", copy: "Data produk dicatat sebagai dasar pengelolaan inventaris." },
      { title: "Barang masuk & keluar", type: "STOCK ACTIVITY", actor: "PENGELOLA INVENTARIS", copy: "Aktivitas barang masuk dan keluar dicatat agar perubahan persediaan dapat ditelusuri." },
      { title: "Penyesuaian stok", type: "UPDATE", actor: "SISTEM INVENTARIS", copy: "Informasi stok diperbarui dan dikaitkan dengan informasi pengiriman yang tersedia." }
    ]
  },
  buktiscope: {
    label: "BUKTISCOPE / IMAGE REVIEW",
    stages: [
      { title: "Input gambar", type: "INPUT", actor: "PENGGUNA", copy: "Gambar bukti transfer dimasukkan sebagai bahan pemeriksaan." },
      { title: "Analisis sinyal", type: "IMAGE ANALYSIS", actor: "TOOLS", copy: "Eksperimen memeriksa karakteristik gambar dan teks untuk menampilkan sinyal yang relevan." },
      { title: "Tinjauan manusia", type: "HUMAN REVIEW", actor: "PENINJAU", copy: "Sinyal ditampilkan sebagai bahan pertimbangan. Keputusan akhir tetap membutuhkan pemeriksaan manusia." }
    ]
  }
};
const flowProjectButtons = [...document.querySelectorAll("[data-flow-project]")];
const flowStageList = document.getElementById("flow-stage-list");
const flowProjectLabel = document.getElementById("flow-project-label");
const flowStageLabel = document.getElementById("flow-stage-label");
const flowStageTitle = document.getElementById("flow-stage-title");
const flowStageCopy = document.getElementById("flow-stage-copy");
const flowStageNote = document.getElementById("flow-stage-note");
const flowInspectorMark = document.querySelector(".flow-inspector-mark");
let activeFlowKey = "krs";

function showFlowStage(index) {
  const flow = workflowMaps[activeFlowKey];
  const stage = flow?.stages[index];
  if (!stage) return;
  [...flowStageList.querySelectorAll("[data-flow-stage]")].forEach((button) => {
    const active = Number(button.dataset.flowStage) === index;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  flowStageLabel.textContent = "TAHAP " + String(index + 1).padStart(2, "0") + " / " + stage.type;
  flowStageTitle.textContent = stage.title;
  flowStageCopy.textContent = stage.copy;
  flowStageNote.textContent = "AKTOR UTAMA · " + stage.actor;
  flowInspectorMark.textContent = String(index + 1).padStart(2, "0");
}

function renderFlow(key) {
  const flow = workflowMaps[key];
  if (!flow || !flowStageList) return;
  activeFlowKey = key;
  flowProjectButtons.forEach((button) => {
    const active = button.dataset.flowProject === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  flowProjectLabel.textContent = flow.label;
  flowStageList.replaceChildren(...flow.stages.map((stage, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "flow-stage" + (index === 0 ? " is-active" : "");
    button.dataset.flowStage = String(index);
    button.setAttribute("aria-pressed", String(index === 0));
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const title = document.createElement("b");
    title.textContent = stage.title;
    const arrow = document.createElement("i");
    arrow.textContent = index === flow.stages.length - 1 ? "↗" : "→";
    button.append(number, title, arrow);
    button.addEventListener("click", () => showFlowStage(index));
    return button;
  }));
  showFlowStage(0);
}
flowProjectButtons.forEach((button) => {
  button.addEventListener("click", () => renderFlow(button.dataset.flowProject));
});
renderFlow("krs");

// Skill explorer: filter tools by the kind of work they supported.
const skillFilterButtons = [...document.querySelectorAll("[data-skill-filter]")];
const skillCards = [...document.querySelectorAll(".toolkit-card[data-skill-group]")];
skillFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.skillFilter;
    skillFilterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    skillCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.skillGroup !== filter;
    });
  });
});

