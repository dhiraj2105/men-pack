const root = document.documentElement;
const themeButton = document.querySelector("#theme-toggle");
const searchInput = document.querySelector("#docs-search");
const searchBox = document.querySelector(".search-box");
const searchResults = document.querySelector("#search-results");
const menuToggle = document.querySelector("#menu-toggle");
const sidebar = document.querySelector("#sidebar");
const backdrop = document.querySelector("#mobile-backdrop");
const scriptUrl = document.querySelector('script[src*="site.js"]')?.src;
const siteRoot = scriptUrl ? new URL("../", scriptUrl) : new URL("./", document.baseURI);

const setTheme = (theme) => {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  themeButton?.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
  );
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#11121a" : "#f7f8fb",
  );
};

setTheme(root.dataset.theme || "light");
themeButton?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("men-pack-theme", next);
  } catch {
    // Theme switching remains available when storage is disabled.
  }
  setTheme(next);
});

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  backdrop.hidden = true;
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
};

menuToggle?.addEventListener("click", () => {
  const opening = !document.body.classList.contains("menu-open");
  document.body.classList.toggle("menu-open", opening);
  backdrop.hidden = !opening;
  menuToggle.setAttribute("aria-expanded", String(opening));
  menuToggle.setAttribute("aria-label", opening ? "Close navigation" : "Open navigation");
});
backdrop?.addEventListener("click", closeMenu);
sidebar?.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    searchResults.hidden = true;
    searchBox?.classList.remove("is-open");
  }
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    searchInput?.focus();
  }
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      const previousText = button.textContent;
      button.textContent = "Copied";
      button.classList.add("is-copied");
      window.setTimeout(() => {
        button.textContent = previousText;
        button.classList.remove("is-copied");
      }, 1500);
    } catch {
      button.textContent = "Copy unavailable";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1600);
    }
  });
});

let searchIndex;
const loadSearchIndex = async () => {
  if (searchIndex) return searchIndex;
  const response = await fetch(new URL("search-index.json", siteRoot));
  if (!response.ok) throw new Error(`Could not load documentation search index (${response.status}).`);
  searchIndex = await response.json();
  return searchIndex;
};

const showSearchResults = (entries, query) => {
  if (!query) {
    searchResults.hidden = true;
    searchResults.replaceChildren();
    return;
  }

  searchResults.hidden = false;
  searchResults.replaceChildren();
  const label = document.createElement("div");
  label.className = "search-result-label";
  label.textContent = entries.length ? `${entries.length} matching pages` : "No matching pages";
  searchResults.append(label);
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "search-empty";
    empty.textContent = "Try another keyword or command.";
    searchResults.append(empty);
    return;
  }

  for (const entry of entries.slice(0, 7)) {
    const link = document.createElement("a");
    link.className = "search-result";
    link.href = new URL(entry.url, siteRoot).href;
    const title = document.createElement("strong");
    title.textContent = entry.title;
    const description = document.createElement("span");
    description.textContent = entry.excerpt;
    link.append(title, description);
    searchResults.append(link);
  }
};

searchInput?.addEventListener("input", async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query.length < 2) {
    showSearchResults([], "");
    return;
  }
  try {
    const index = await loadSearchIndex();
    const terms = query.split(/\s+/);
    const matches = index
      .map((entry) => {
        const title = entry.title.toLowerCase();
        const text = entry.text.toLowerCase();
        const score = terms.reduce((total, term) => {
          if (!`${title} ${text}`.includes(term)) return -Infinity;
          const titleMatches = title.split(term).length - 1;
          const textMatches = text.split(term).length - 1;
          return total + titleMatches * 5 + textMatches;
        }, 0);
        return { ...entry, score };
      })
      .filter((entry) => Number.isFinite(entry.score))
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    showSearchResults(matches, query);
  } catch (error) {
    showSearchResults([], query);
    console.error(error);
  }
});

searchBox?.addEventListener("click", (event) => {
  if (
    window.matchMedia("(max-width: 540px)").matches &&
    !searchBox.classList.contains("is-open")
  ) {
    event.preventDefault();
    searchBox.classList.add("is-open");
    searchInput?.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!searchResults.contains(event.target) && !searchBox?.contains(event.target)) {
    searchResults.hidden = true;
    searchBox?.classList.remove("is-open");
  }
});
