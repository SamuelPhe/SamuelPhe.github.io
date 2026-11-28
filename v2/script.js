document.documentElement.classList.add("has-js");

let currentLanguage = "id";
let activeProjectKey = null;

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen
      ? (currentLanguage === "en" ? "Open navigation" : "Buka navigasi")
      : (currentLanguage === "en" ? "Close navigation" : "Tutup navigasi"));
    mainNav.classList.toggle("is-open", !isOpen);
  });

  const closeMobileNav = () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", currentLanguage === "en" ? "Open navigation" : "Buka navigasi");
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
    localTime.textContent = new Intl.DateTimeFormat(currentLanguage === "en" ? "en-GB" : "id-ID", {
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
  const localized = currentLanguage === "en" ? labModesEnglish[mode] : item;
  labModeButtons.forEach((button) => {
    const active = button.dataset.labMode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (labModeKicker) labModeKicker.textContent = localized.kicker;
  if (labModeTitle) labModeTitle.textContent = localized.title;
  if (labModeCopy) labModeCopy.textContent = localized.copy;
  if (labModeTags) {
    labModeTags.replaceChildren(...localized.tags.map((tag) => {
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
  const item = currentLanguage === "en" ? projectNotesEnglish[key] : projectNotes[key];
  if (!item || !projectDialog || typeof projectDialog.showModal !== "function") return;
  lastProjectTrigger = trigger instanceof HTMLElement ? trigger : lastProjectTrigger;
  activeProjectKey = key;
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
  if (!projectDialog.open) projectDialog.showModal();
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
  const flowSet = currentLanguage === "en" ? workflowMapsEnglish : workflowMaps;
  const flow = flowSet[activeFlowKey];
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
  const flowSet = currentLanguage === "en" ? workflowMapsEnglish : workflowMaps;
  const flow = flowSet[key];
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

// ---------------------------------------------------------
// Complete Indonesian / English translations for V2
// ---------------------------------------------------------
const translations = {
  id: {
    skipNav: "Lewati navigasi",
    quickSearch: "Buka pencarian cepat",
    chooseLanguage: "Pilih bahasa",
    versionOne: "Kembali ke portofolio versi 1",
    openNavigation: "Buka navigasi",
    mainNavigation: "Navigasi utama",
    navWork: 'Karya <span>01</span>',
    navSystems: 'Systems <span>02</span>',
    navProfile: 'Profil <span>03</span>',
    navToolkit: 'Toolkit <span>04</span>',
    navResearch: 'Riset <span>05</span>',
    navContact: 'Kontak <span>↗</span>',
    heroTitle: 'Mengamati sistem.<br><em>Membangun kemungkinan.</em>',
    heroCopy: "Saya Samuel, mahasiswa Sistem dan Teknologi Informasi di ITBSS. Saya senang memahami bagaimana sebuah sistem bekerja, mengeksplorasi teknologi, dan mengubah ide menjadi proyek yang bisa dipelajari.",
    heroExplore: 'Jelajahi proyek <span>↘</span>',
    heroMap: 'Lihat system map <span>↓</span>',
    studyLabel: "STUDI",
    studyValue: "Sistem dan Teknologi Informasi",
    exploreArea: "AREA EKSPLORASI",
    exploreValue: 'Software <i>×</i> Data <i>×</i> Systems',
    localTime: "WAKTU LOKAL",
    labConsole: "Panel eksplorasi interaktif",
    labModes: "Pilih area eksplorasi",
    currentFocus: "CURRENT FOCUS / 01",
    statusLabel: "STATUS",
    learningStatus: "SEDANG DALAM PROSES BELAJAR",
    summary: "Ringkasan",
    stripFirst: 'AMATI MASALAH — <span>PAHAMI SISTEMNYA.</span>',
    stripSecond: 'PETAKAN / BANGUN / SEMPURNAKAN <span>— ULANGI.</span>',
    workSideNote: "Kumpulan eksperimen dan proyek pilihan",
    workTitle: 'Hal yang pernah<br><em>saya bangun.</em>',
    workIntro: "Mulai dari aplikasi web, sistem desktop, sampai eksplorasi ide. Setiap proyek punya tujuan dan proses belajarnya sendiri.",
    projectFilters: "Filter proyek",
    filterAll: 'Semua <span>07</span>',
    filterWeb: "Web",
    filterDesktop: "Desktop",
    filterResearch: "Riset",
    projectsShown: "PROYEK DITAMPILKAN",
    illustrationNote: "Ilustrasi di setiap kartu adalah visual konseptual yang dibuat untuk portofolio, bukan tangkapan layar aplikasi yang sedang berjalan.",
    projectShiye: "Platform storefront dan top-up digital berbasis Laravel. Pengembangan fitur sedang dijeda untuk menilai kelayakan bisnis melalui harga pemasok, harga jual, biaya pembayaran, margin, dan ketersediaan produk.",
    projectShiyeFoot: "Source code utama bersifat privat; belum ada demo publik yang disiapkan.",
    openProject: "Buka detail proyek",
    openProjectText: 'Buka catatan proyek <span>↗</span>',
    projectBukti: "Eksperimen local-first untuk memeriksa gambar bukti transfer dan menampilkan sinyal yang layak ditinjau manusia. Fokusnya transparansi analisis, bukan klaim deteksi palsu yang pasti.",
    projectKrs: "Aplikasi desktop untuk alur pengajuan KRS, pemilihan jadwal, pemeriksaan bentrok, peninjauan Dosen PA, dan finalisasi oleh Kaprodi.",
    projectVentra: "Aplikasi inventaris desktop untuk pencatatan produk, penyesuaian stok, barang masuk dan keluar, serta informasi pengiriman.",
    projectEdu: "Aplikasi web penjadwalan ujian untuk mengatur jadwal, aktivitas guru, berkas soal, manajemen pengguna, dan laporan.",
    projectPos: "Aplikasi kasir berbasis web dengan area admin dan kasir, manajemen produk dan stok, transaksi penjualan, serta riwayat transaksi.",
    projectResearch: "Penelitian kolaboratif untuk mengevaluasi alternatif layanan penyimpanan cloud bagi mahasiswa IT melalui pembobotan ROC dan pemeringkatan TOPSIS.",
    viewRepository: 'Lihat repository <span>↗</span>',
    readPublication: 'Baca publikasi <span>↗</span>',
    systemSideNote: "Pilih proyek, telusuri alurnya",
    systemsTitle: 'Lihat bagaimana<br><em>sebuah sistem bergerak.</em>',
    systemsIntro: "Setiap proyek memiliki alur dan hubungan antarbagian. Pilih salah satu studi kasus, lalu buka setiap tahap untuk melihat gambaran prosesnya.",
    chooseSystemMap: "Pilih system map",
    flowKrs: "KRS Academic System",
    flowVentra: "Ventra Inventory",
    flowBukti: "BuktiScope",
    interactiveMap: "PETA INTERAKTIF ↗",
    systemStages: "Tahapan alur sistem",
    flowDisclaimer: "Peta ini merupakan ringkasan konseptual berdasarkan deskripsi proyek, bukan rekaman proses aplikasi secara langsung.",
    profileSideNote: "Latar belakang, pendidikan, dan bahasa",
    hello: "HALO, SENANG BERTEMU.",
    aboutTitle: 'Sistem, data,<br><em>dan software.</em>',
    aboutLead: "Saya mahasiswa Sistem dan Teknologi Informasi di Institut Teknologi dan Bisnis Sabda Setia (ITBSS). Saya tertarik memahami bagaimana sistem dirancang, bagaimana data dikelola, dan bagaimana software dapat membantu menyelesaikan masalah praktis.",
    aboutCopy1: "Saya mengembangkan pemahaman melalui perkuliahan, proyek akademik, kerja tim, penelitian, dan eksperimen personal. Area yang sedang saya eksplorasi meliputi software development, basis data, analisis sistem, serta pengalaman pengguna.",
    aboutCopy2: "Di luar kampus, pengalaman kerja memberi saya konteks tentang alur operasional, dokumentasi, pengelolaan data, dan koordinasi antarbagian. Saya membawa sudut pandang tersebut saat mempelajari bagaimana sistem informasi bisa mendukung proses nyata.",
    aboutCopy3: "Saya masih dalam proses membangun kompetensi. Karena itu, portofolio ini berusaha membedakan pengalaman kerja, proyek tim, dan eksperimen pribadi secara jujur.",
    programLabel: "PROGRAM STUDI",
    areasLabel: "AREA EKSPLORASI",
    locationLabel: "LOKASI",
    learningLabel: "CARA BELAJAR",
    areaValue: "Aplikasi web, desktop, dan sistem informasi",
    learningValue: "Proyek, eksperimen, dan penelitian",
    educationTitle: "Riwayat pendidikan",
    educationDegree: "Sarjana · Sistem dan Teknologi Informasi",
    educationEstimate: "Perkiraan selesai: September 2028",
    highSchoolMajor: "Ilmu Pengetahuan Sosial (IPS)",
    languagesTitle: "Bahasa",
    languageIndonesian: "Bahasa Indonesia",
    languageEnglish: "Bahasa Inggris",
    languageJapanese: "Bahasa Jepang",
    languageMandarin: "Bahasa Mandarin",
    englishNote: "Bahasa Inggris tercantum sebagai Limited Working di LinkedIn; hasil Pearson 3 Skills yang pernah kamu bagikan adalah B1+.",
    membershipTitle: "Keanggotaan",
    membershipName: "Member Resmi IMPHNEN",
    membershipNote: "Dicantumkan sebagai keanggotaan, bukan sertifikasi kompetensi teknis.",
    experienceSideNote: "PT Dangau Selaras · Kubu Raya",
    experienceTitle: 'Belajar dari proses<br><em>di dunia nyata.</em>',
    experienceIntro: "Pengalaman profesional di PT Dangau Selaras memperkenalkan saya pada alur operasional, dokumentasi, pengelolaan data, dan koordinasi antarbagian. Bagian ini melengkapi perjalanan akademik saya di bidang Sistem dan Teknologi Informasi.",
    experienceRole: "Accounting",
    experienceIndustry: "Industri perhotelan · Kubu Raya, Kalimantan Barat",
    operationsFinanceTitle: "Keuangan & perbankan",
    operationsFinanceCopy: "Menyusun rekap penggajian berdasarkan hari kerja dan potongan dari HRD; menyiapkan dokumen pembayaran melalui Qlola atau teller; memantau transaksi dan saldo rekening, serta mengunduh dan memeriksa rekening koran. Sesekali melakukan input transaksi sebagai Maker sesuai hak akses.",
    operationsArTitle: "Accounts receivable",
    operationsArCopy: "Mencatat dan memantau piutang, berkoordinasi dengan Marketing untuk tindak lanjut pembayaran tamu instansi, memeriksa bukti pembayaran, dan menyampaikan invoice kepada pihak terkait.",
    operationsProcurementTitle: "Pengadaan & INAPROC",
    operationsProcurementCopy: "Menyusun daftar produk, memproses pembelian, dan mengunggah dokumen pendukung melalui e-Katalog v6 / INAPROC. Juga mengurus pembelian Tanda Tangan Elektronik (TTE) dan e-Meterai.",
    operationsBpjsTitle: "Administrasi kepegawaian & BPJS",
    operationsBpjsCopy: "Mendaftarkan karyawan baru, menonaktifkan kepesertaan karyawan yang berhenti, memperbarui data karyawan dan gaji, mengelola administrasi iuran, serta memeriksa status BPJS Ketenagakerjaan melalui SIPP dan BPJS Kesehatan melalui EDABU.",
    toolkitSideNote: "Yang pernah saya gunakan",
    toolkitTitle: 'Toolkit <em>yang terus tumbuh.</em>',
    toolkitIntro: "Teknologi dan tools dari proyek akademik, pekerjaan, dan eksplorasi personal. Tingkat pengalaman tiap alat tidak sama.",
    exploreByArea: "JELAJAHI BERDASARKAN AREA",
    skillFilterNote: "Pilih kelompok untuk melihat tools yang pernah saya gunakan",
    skillFilters: "Filter kelompok tools",
    skillAll: "Semua",
    skillWeb: "Web",
    skillDesktop: "Desktop",
    skillData: "Data & workflow",
    skillVisual: "Visual",
    skillProgramming: "Programming & desktop",
    skillProgrammingCopy: "Dipakai dalam latihan pemrograman dan tugas kuliah.",
    skillDatabase: "Database & workflow",
    skillDatabaseCopy: "Pengelolaan data dan alur kerja aplikasi.",
    skillOffice: "Office & data",
    skillOfficeCopy: "Tools yang digunakan pada pekerjaan administrasi dan tugas akademik.",
    skillVisualHeading: "3D & visual exploration",
    skillVisualCopy: "Tools kreatif yang pernah digunakan untuk eksplorasi visual dan pemodelan.",
    toolkitNote: "Daftar ini menunjukkan pengalaman penggunaan, bukan klaim bahwa saya telah menguasai semua tools pada tingkat profesional.",
    researchSideNote: "Satu catatan yang dipublikasikan",
    researchArtBottom: 'ROC × TOPSIS<br>PENDUKUNG KEPUTUSAN',
    researchCopy: "Penelitian kolaboratif mengenai pemilihan layanan penyimpanan cloud untuk mahasiswa IT, menggunakan pembobotan ROC dan pemeringkatan alternatif TOPSIS.",
    contactSideNote: "Terbuka untuk percakapan dan kolaborasi",
    contactGreeting: "SAMPAI JUMPA DI INTERNET.",
    contactTitle: 'Punya ide?<br><em>Mari terhubung.</em>',
    contactCopy: "Saya senang bertukar pikiran tentang teknologi, proyek, pembelajaran, dan hal-hal yang sedang dibangun.",
    footerCopy: "Dirancang dan dirawat dengan rasa ingin tahu.",
    backTop: "Kembali ke atas",
    closeProject: "Tutup detail proyek",
    focusLabel: "FOKUS",
    contextLabel: "KONTEKS",
    toolsLabel: "TOOLS & TEKNOLOGI",
    openProjectLink: "Buka proyek ↗",
    searchInput: "Cari bagian halaman",
    searchPlaceholder: "Cari bagian halaman...",
    quickNavigation: "NAVIGASI CEPAT",
    commandWork: '<span>01</span> Karya dan proyek <kbd>↵</kbd>',
    commandSystems: '<span>02</span> System map <kbd>↵</kbd>',
    commandProfile: '<span>03</span> Profil akademik <kbd>↵</kbd>',
    commandExperience: '<span>04</span> Pengalaman profesional <kbd>↵</kbd>',
    commandToolkit: '<span>05</span> Toolkit <kbd>↵</kbd>',
    commandResearch: '<span>06</span> Riset dan publikasi <kbd>↵</kbd>',
    commandContact: '<span>07</span> Kontak <kbd>↵</kbd>',
    commandGithub: '<span>↗</span> GitHub profile <kbd>↵</kbd>',
    noResults: "Tidak ada bagian yang cocok. Coba kata kunci lain.",
    shortcutTip: "TIP: TEKAN CTRL + K KAPAN SAJA",
    escapeTip: "ESC UNTUK MENUTUP",
    researchArtKicker: "RISET / 2026",
    researchOverline: "PENULIS BERSAMA · TECHBUS VOL. 4 NO. 1",
    experiencePeriod: "MEI 2024 — SEKARANG",
    educationEyebrow: "PENDIDIKAN / 01",
    academicLabel: "AKADEMIK",
    languagesEyebrow: "BAHASA / 02",
    communicationLabel: "KOMUNIKASI",
    communityEyebrow: "KOMUNITAS / 03",
    membershipLabel: "KEANGGOTAAN",
    skillWebHeading: "Web development",
    skillWebCopy: "Digunakan dalam proyek web dan aplikasi personal."
  },
  en: {
    skipNav: "Skip navigation",
    quickSearch: "Open quick search",
    chooseLanguage: "Choose language",
    versionOne: "Return to portfolio version 1",
    openNavigation: "Open navigation",
    mainNavigation: "Main navigation",
    navWork: 'Work <span>01</span>',
    navSystems: 'Systems <span>02</span>',
    navProfile: 'Profile <span>03</span>',
    navToolkit: 'Toolkit <span>04</span>',
    navResearch: 'Research <span>05</span>',
    navContact: 'Contact <span>↗</span>',
    heroTitle: 'Observing systems.<br><em>Building possibilities.</em>',
    heroCopy: "I'm Samuel, an Information Systems and Technology student at ITBSS. I enjoy understanding how systems work, exploring technology, and turning ideas into projects I can learn from.",
    heroExplore: 'Explore projects <span>↘</span>',
    heroMap: 'Explore the system map <span>↓</span>',
    studyLabel: "STUDY",
    studyValue: "Information Systems and Technology",
    exploreArea: "AREAS OF INTEREST",
    exploreValue: 'Software <i>×</i> Data <i>×</i> Systems',
    localTime: "LOCAL TIME",
    labConsole: "Interactive exploration panel",
    labModes: "Choose an exploration area",
    currentFocus: "CURRENT FOCUS / 01",
    statusLabel: "STATUS",
    learningStatus: "LEARNING IN PROGRESS",
    summary: "Overview",
    stripFirst: 'OBSERVE THE PROBLEM — <span>UNDERSTAND THE SYSTEM.</span>',
    stripSecond: 'MAP / BUILD / REFINE <span>— REPEAT.</span>',
    workSideNote: "A selection of projects and experiments",
    workTitle: 'Things I have<br><em>built so far.</em>',
    workIntro: "From web applications and desktop systems to early-stage experiments. Each project has its own purpose and learning process.",
    projectFilters: "Project filters",
    filterAll: 'All <span>07</span>',
    filterWeb: "Web",
    filterDesktop: "Desktop",
    filterResearch: "Research",
    projectsShown: "PROJECTS SHOWN",
    illustrationNote: "The visuals on these cards are conceptual illustrations created for this portfolio, not screenshots of running applications.",
    projectShiye: "A Laravel-based digital storefront and top-up platform. Feature development is paused while business viability is assessed through supplier prices, selling prices, payment costs, margins, and product availability.",
    projectShiyeFoot: "The main source code is private; no public demo is currently available.",
    openProject: "Open project details",
    openProjectText: 'Open project notes <span>↗</span>',
    projectBukti: "A local-first experiment for reviewing transfer receipt images and surfacing signals for human review. It focuses on transparent analysis rather than claiming to prove that a receipt is fake.",
    projectKrs: "A desktop application supporting the course registration workflow, schedule selection, conflict checks, academic advisor review, and final approval by the program head.",
    projectVentra: "A desktop inventory application for recording products, adjusting stock, tracking incoming and outgoing items, and maintaining delivery information.",
    projectEdu: "A web-based exam scheduling application for managing schedules, teacher activities, question files, user access, and reports.",
    projectPos: "A web-based point-of-sale application with admin and cashier areas, product and stock management, sales transactions, and transaction history.",
    projectResearch: "Collaborative research evaluating cloud storage alternatives for IT students using Rank Order Centroid (ROC) weighting and TOPSIS ranking.",
    viewRepository: 'View repository <span>↗</span>',
    readPublication: 'Read publication <span>↗</span>',
    systemSideNote: "Choose a project and explore its workflow",
    systemsTitle: 'See how<br><em>a system moves.</em>',
    systemsIntro: "Every project has its own workflow and relationships between components. Choose a case study, then select each stage to explore how the process is structured.",
    chooseSystemMap: "Choose a system map",
    flowKrs: "KRS Academic System",
    flowVentra: "Ventra Inventory",
    flowBukti: "BuktiScope",
    interactiveMap: "INTERACTIVE MAP ↗",
    systemStages: "System workflow stages",
    flowDisclaimer: "This is a conceptual summary based on the project description, not a live recording of the application.",
    profileSideNote: "Background, education, and languages",
    hello: "HELLO, NICE TO MEET YOU.",
    aboutTitle: 'Systems, data,<br><em>and software.</em>',
    aboutLead: "I'm an Information Systems and Technology student at Institut Teknologi dan Bisnis Sabda Setia (ITBSS). I'm interested in how systems are designed, how data is managed, and how software can help solve practical problems.",
    aboutCopy1: "I develop my understanding through coursework, academic projects, teamwork, research, and personal experiments. My current areas of exploration include software development, databases, systems analysis, and user experience.",
    aboutCopy2: "Outside university, my work experience gives me context about operational workflows, documentation, data management, and coordination between teams. I bring that perspective into my learning about how information systems can support real processes.",
    aboutCopy3: "I'm still developing my skills. This portfolio aims to distinguish work experience, team projects, and personal experiments honestly.",
    programLabel: "PROGRAM",
    areasLabel: "AREAS OF EXPLORATION",
    locationLabel: "LOCATION",
    learningLabel: "LEARNING APPROACH",
    areaValue: "Web apps, desktop apps, and information systems",
    learningValue: "Projects, experiments, and research",
    educationTitle: "Education",
    educationDegree: "Bachelor's · Information Systems and Technology",
    educationEstimate: "Expected completion: September 2028",
    highSchoolMajor: "Social Sciences",
    languagesTitle: "Languages",
    languageIndonesian: "Indonesian",
    languageEnglish: "English",
    languageJapanese: "Japanese",
    languageMandarin: "Mandarin Chinese",
    englishNote: "LinkedIn lists my English as Limited Working; the Pearson 3 Skills result I shared was B1+.",
    membershipTitle: "Membership",
    membershipName: "Official IMPHNEN Member",
    membershipNote: "Listed as a membership, not a technical competency certification.",
    experienceSideNote: "PT Dangau Selaras · Kubu Raya",
    experienceTitle: 'Learning from processes<br><em>in the real world.</em>',
    experienceIntro: "My professional experience at PT Dangau Selaras introduced me to operational workflows, documentation, data management, and cross-team coordination. It complements my academic journey in Information Systems and Technology.",
    experienceRole: "Accounting",
    experienceIndustry: "Hospitality industry · Kubu Raya, West Kalimantan",
    operationsFinanceTitle: "Finance & banking operations",
    operationsFinanceCopy: "Prepare payroll summaries based on working days and HR-provided deductions; prepare payment files through Qlola or bank tellers; monitor incoming transactions and balances across company accounts; and download and review bank statements. Occasionally enter transactions as a Maker within assigned permissions.",
    operationsArTitle: "Accounts receivable",
    operationsArCopy: "Record and monitor receivables, coordinate with Marketing on institutional guest payments, review payment evidence, and deliver invoices to the relevant parties.",
    operationsProcurementTitle: "Procurement & INAPROC",
    operationsProcurementCopy: "Maintain product listings, process purchases, and upload supporting documents through e-Katalog v6 / INAPROC. Also arrange purchases of electronic signatures (TTE) and electronic stamp duty.",
    operationsBpjsTitle: "Employee administration & BPJS",
    operationsBpjsCopy: "Register new employees, deactivate coverage for former employees, update employee and salary data, manage contribution administration, and check BPJS Employment status through SIPP and BPJS Health status through EDABU.",
    toolkitSideNote: "Tools I have used",
    toolkitTitle: 'A toolkit <em>that keeps growing.</em>',
    toolkitIntro: "Technologies and tools from academic projects, work, and personal exploration. My level of experience varies across them.",
    exploreByArea: "EXPLORE BY AREA",
    skillFilterNote: "Choose a group to see tools I have used",
    skillFilters: "Filter tool groups",
    skillAll: "All",
    skillWeb: "Web",
    skillDesktop: "Desktop",
    skillData: "Data & workflow",
    skillVisual: "Visual",
    skillProgramming: "Programming & desktop",
    skillProgrammingCopy: "Used in programming exercises and university assignments.",
    skillDatabase: "Database & workflow",
    skillDatabaseCopy: "Working with data and application workflows.",
    skillOffice: "Office & data",
    skillOfficeCopy: "Tools used in administrative work and academic assignments.",
    skillVisualHeading: "3D & visual exploration",
    skillVisualCopy: "Creative tools I have used for visual exploration and modelling.",
    toolkitNote: "This list shows tools I have used; it does not claim professional-level mastery of every item.",
    researchSideNote: "A published research paper",
    researchArtBottom: 'ROC × TOPSIS<br>DECISION SUPPORT',
    researchCopy: "Collaborative research on selecting cloud storage services for IT students, using ROC weighting and TOPSIS to rank alternatives.",
    contactSideNote: "Open to conversations and collaboration",
    contactGreeting: "SEE YOU AROUND THE INTERNET.",
    contactTitle: "Have an idea?<br><em>Let's connect.</em>",
    contactCopy: "I enjoy exchanging ideas about technology, projects, learning, and things currently being built.",
    footerCopy: "Designed and maintained with curiosity.",
    backTop: "Back to top",
    closeProject: "Close project details",
    focusLabel: "FOCUS",
    contextLabel: "CONTEXT",
    toolsLabel: "TOOLS & TECHNOLOGIES",
    openProjectLink: "Open project ↗",
    searchInput: "Search page sections",
    searchPlaceholder: "Search page sections...",
    quickNavigation: "QUICK NAVIGATION",
    commandWork: '<span>01</span> Projects and work <kbd>↵</kbd>',
    commandSystems: '<span>02</span> System map <kbd>↵</kbd>',
    commandProfile: '<span>03</span> Academic profile <kbd>↵</kbd>',
    commandExperience: '<span>04</span> Professional experience <kbd>↵</kbd>',
    commandToolkit: '<span>05</span> Toolkit <kbd>↵</kbd>',
    commandResearch: '<span>06</span> Research and publication <kbd>↵</kbd>',
    commandContact: '<span>07</span> Contact <kbd>↵</kbd>',
    commandGithub: '<span>↗</span> GitHub profile <kbd>↵</kbd>',
    noResults: "No matching sections. Try another keyword.",
    shortcutTip: "TIP: PRESS CTRL + K ANYTIME",
    escapeTip: "ESC TO CLOSE",
    researchArtKicker: "RESEARCH / 2026",
    researchOverline: "CO-AUTHOR · TECHBUS VOL. 4 NO. 1",
    experiencePeriod: "MAY 2024 — PRESENT",
    educationEyebrow: "EDUCATION / 01",
    academicLabel: "ACADEMIC",
    languagesEyebrow: "LANGUAGES / 02",
    communicationLabel: "COMMUNICATION",
    communityEyebrow: "COMMUNITY / 03",
    membershipLabel: "MEMBERSHIP",
    skillWebHeading: "Web development",
    skillWebCopy: "Used in web projects and personal applications."
  }
};

const labModesEnglish = {
  build: {
    kicker: "CURRENT FOCUS / 01",
    title: "Building useful software.",
    copy: "Web and desktop application experiments, from understanding a need to shaping a workflow that people can use.",
    tags: ["WEB", "DESKTOP", "PROTOTYPES"]
  },
  systems: {
    kicker: "CURRENT FOCUS / 02",
    title: "Understanding connected systems.",
    copy: "Exploring how users, processes, data, and rules connect to make an information system work.",
    tags: ["INFORMATION SYSTEMS", "DATABASES", "WORKFLOWS"]
  },
  research: {
    kicker: "CURRENT FOCUS / 03",
    title: "Learning through research.",
    copy: "Developing structured thinking through data, research methods, and academic collaboration.",
    tags: ["DATA", "ROC", "TOPSIS"]
  }
};

const projectNotesEnglish = {
  shiyestore: {
    title: "ShiyeStore", context: "PERSONAL PROJECT", status: "BUSINESS REVIEW / DEVELOPMENT PAUSED",
    description: "A Laravel-based digital storefront and top-up platform. Feature development is paused while business viability is assessed through product availability, supplier prices, selling prices, payment costs, and margins.",
    focus: "Assessing whether the digital product sales model can sustain healthy margins before feature development resumes.",
    role: "Personal project. Development has been iterative and is currently at the business evaluation stage.",
    tech: ["PHP", "Laravel 12", "Vue 3", "Inertia 2", "TypeScript", "Tailwind CSS", "MySQL"], url: ""
  },
  buktiscope: {
    title: "BuktiScope", context: "PERSONAL R&D", status: "EARLY STAGE",
    description: "A local-first experiment for reviewing transfer receipt images and surfacing signals for human review. It aims to support checking, not to issue an automatic verdict that a receipt is fake.",
    focus: "Exploring image analysis, OCR, and transparent signals while keeping a human reviewer involved.",
    role: "Personal project / early-stage R&D experiment.",
    tech: ["Python", "OCR", "Image Analysis", "FastAPI"], url: "https://github.com/SamuelPhe/BuktiScope"
  },
  krs: {
    title: "KRS Academic System", context: "TEAM PROJECT / SEMESTER 4", status: "ACADEMIC PROJECT",
    description: "A desktop application supporting student course registration, schedule selection, conflict checks, academic advisor review, and final approval by the program head.",
    focus: "Understanding an academic workflow involving multiple roles and the way schedule rules and approval stages are connected.",
    role: "Academic team project. This portfolio describes the application and its workflow; it does not claim that I implemented the entire project alone.",
    tech: ["Java", "Java Swing", "MySQL", "JDBC"], url: "https://github.com/SamuelPhe/krs_pbo2_semester4"
  },
  ventra: {
    title: "Ventra Inventory", context: "TEAM PROJECT / SEMESTER 3", status: "ACADEMIC PROJECT",
    description: "A desktop inventory application for recording products, adjusting stock, tracking incoming and outgoing items, and maintaining delivery information.",
    focus: "Learning about inventory data structures and the relationship between stock changes, item movements, and delivery information.",
    role: "Academic team project.",
    tech: ["Java 17", "Java Swing", "MySQL", "Maven"], url: "https://github.com/SamuelPhe/ventra-inventaris-pbo-semester3"
  },
  edusched: {
    title: "EduSched", context: "TEAM PROJECT / SEMESTER 3", status: "ACADEMIC PROJECT",
    description: "A web-based exam scheduling application for managing schedules, teacher activities, question files, user management, and reports.",
    focus: "Exploring exam scheduling and the needs of multiple user roles in one web application.",
    role: "Academic team project.",
    tech: ["PHP", "MySQL", "JavaScript", "Bootstrap"], url: "https://github.com/SamuelPhe/apsi-semester3"
  },
  pos: {
    title: "Point of Sale", context: "COURSE PROJECT / SEMESTER 2", status: "ACADEMIC PROJECT",
    description: "A web-based point-of-sale application with admin and cashier areas, product and stock management, sales transactions, and transaction history.",
    focus: "Learning the sales transaction workflow and product management in a business web application.",
    role: "University coursework project.",
    tech: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"], url: "https://github.com/SamuelPhe/POS-pwd-semester2"
  },
  "roc-topsis": {
    title: "ROC–TOPSIS Decision Support", context: "CO-AUTHORED RESEARCH / TECHBUS 2026", status: "PUBLISHED",
    description: "Collaborative research evaluating cloud storage alternatives for IT students using Rank Order Centroid (ROC) weighting and TOPSIS ranking.",
    focus: "Applying a multi-criteria decision-making method to compare cloud storage service alternatives.",
    role: "Co-author of a research publication with a team.",
    tech: ["Research", "ROC", "TOPSIS", "Decision Support"], url: "https://doi.org/10.61245/techbus.v4i1.88"
  }
};

const workflowMapsEnglish = {
  krs: {
    label: "KRS / ACADEMIC WORKFLOW",
    stages: [
      { title: "Course registration request", type: "INPUT", actor: "STUDENT", copy: "A student submits a study plan and selects course schedules for the semester." },
      { title: "Schedule validation", type: "VALIDATION", actor: "SYSTEM", copy: "The selected schedules are checked to help identify conflicts before the request proceeds." },
      { title: "Academic advisor review", type: "REVIEW", actor: "ACADEMIC ADVISOR", copy: "The academic advisor reviews the student's study plan before it moves to the next stage." },
      { title: "Program head approval", type: "FINALIZATION", actor: "PROGRAM HEAD", copy: "The program head completes the final approval so the KRS request can be completed and archived." }
    ]
  },
  ventra: {
    label: "VENTRA / INVENTORY WORKFLOW",
    stages: [
      { title: "Product records", type: "DATA INPUT", actor: "INVENTORY STAFF", copy: "Product information is recorded as the foundation for inventory management." },
      { title: "Stock movements", type: "STOCK ACTIVITY", actor: "INVENTORY STAFF", copy: "Incoming and outgoing items are recorded so stock changes can be traced." },
      { title: "Stock adjustment", type: "UPDATE", actor: "INVENTORY SYSTEM", copy: "Stock information is updated and linked to the available delivery information." }
    ]
  },
  buktiscope: {
    label: "BUKTISCOPE / IMAGE REVIEW",
    stages: [
      { title: "Image input", type: "INPUT", actor: "USER", copy: "A transfer receipt image is submitted as the material to be reviewed." },
      { title: "Signal analysis", type: "IMAGE ANALYSIS", actor: "TOOLS", copy: "The experiment checks image and text characteristics to surface relevant signals." },
      { title: "Human review", type: "HUMAN REVIEW", actor: "REVIEWER", copy: "Signals are shown as supporting information. The final decision still requires human inspection." }
    ]
  }
};

// Apply translations to static content and refresh open, data-driven panels.
function applyLanguage(language) {
  currentLanguage = language === "en" ? "en" : "id";
  const dictionary = translations[currentLanguage];
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const value = dictionary[element.dataset.i18nHtml];
    if (typeof value === "string") element.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const value = dictionary[element.dataset.i18nAria];
    if (typeof value === "string") element.setAttribute("aria-label", value);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const value = dictionary[element.dataset.i18nPlaceholder];
    if (typeof value === "string") element.setAttribute("placeholder", value);
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    const active = button.dataset.language === currentLanguage;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const menuOpen = menuToggle?.getAttribute("aria-expanded") === "true";
  if (menuToggle) {
    menuToggle.setAttribute("aria-label", menuOpen
      ? (currentLanguage === "en" ? "Close navigation" : "Tutup navigasi")
      : dictionary.openNavigation);
  }
  if (localTime) updateLocalTime();
  const activeMode = document.querySelector("[data-lab-mode].is-active")?.dataset.labMode || "build";
  setLabMode(activeMode);
  renderFlow(activeFlowKey);
  if (projectDialog?.open && activeProjectKey) {
    openProjectNote(activeProjectKey, lastProjectTrigger);
  }
  if (commandInput?.value) commandInput.dispatchEvent(new Event("input"));

  document.title = currentLanguage === "en"
    ? "Samuel Phe — Personal Systems Lab"
    : "Samuel Phe — Personal Systems Lab";
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = currentLanguage === "en"
    ? "Samuel Phe's Personal Systems Lab, an Information Systems and Technology student portfolio. Explore software projects, system maps, experiments, and research."
    : "Personal Systems Lab milik Samuel Phe, mahasiswa Sistem dan Teknologi Informasi. Jelajahi proyek software, system map, eksperimen, dan riset.";

  try { localStorage.setItem("portfolio-language", currentLanguage); } catch { /* Storage can be unavailable in private browsing. */ }
}

window.setPortfolioLanguage = applyLanguage;

let preferredLanguage = "id";
try {
  const savedLanguage = localStorage.getItem("portfolio-language");
  if (savedLanguage === "en" || savedLanguage === "id") preferredLanguage = savedLanguage;
} catch { /* Keep Indonesian as the default when storage is unavailable. */ }
applyLanguage(preferredLanguage);

