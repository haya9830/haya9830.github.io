(() => {
  const navigation = [...document.querySelectorAll('nav a[href^="#"]')];
  const sections = navigation
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            navigation.forEach((link) => {
              if (link.hash === `#${entry.target.id}`)
                link.setAttribute("aria-current", "location");
              else link.removeAttribute("aria-current");
            });
        }
      },
      { rootMargin: "-10% 0px -65% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting)
          navigation.forEach((link) => link.removeAttribute("aria-current"));
      },
      { threshold: 0.3 },
    ).observe(document.getElementById("top"));
  }

  // Copy the deployed location, so moving this folder never keeps an old host.
  // For a file opened directly, use the public URL rather than a local Mac path.
  const canonicalUrl = document.querySelector('link[rel="canonical"]').href;
  const currentUrl = new URL(window.location.href);
  currentUrl.hash = "";
  currentUrl.search = "";
  if (currentUrl.pathname.endsWith("/index.html")) {
    currentUrl.pathname = currentUrl.pathname.slice(0, -"index.html".length);
  }
  const siteUrl = /^https?:$/.test(currentUrl.protocol)
    ? currentUrl.href
    : canonicalUrl;
  const status = document.getElementById("toast");
  let toastTimer;
  const notify = (message) => {
    clearTimeout(toastTimer);
    status.textContent = message;
    status.classList.add("visible");
    toastTimer = setTimeout(() => status.classList.remove("visible"), 3800);
  };
  const copy = async (text, message) => {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      notify(message);
    } catch {
      const dialog = document.getElementById("copy-dialog");
      const field = document.getElementById("copy-fallback");
      field.value = text;
      dialog.showModal();
      field.focus();
      field.select();
    }
  };
  document.querySelectorAll("[data-copy-url]").forEach((button) => {
    button.addEventListener("click", () => {
      const anchor = button.dataset.copyUrl;
      const url = new URL(siteUrl);
      if (anchor) url.hash = anchor;
      copy(
        url.href,
        anchor
          ? "制作物のリンクをコピーしました。"
          : "サイトのURLをコピーしました。",
      );
    });
  });
  document.getElementById("copy-markdown").addEventListener("click", () => {
    copy(
      `[Portfolio — 中山 駿](${siteUrl})`,
      "GitHubのREADMEに貼れるリンクをコピーしました。",
    );
  });
  document
    .getElementById("print-profile")
    .addEventListener("click", () => window.print());
})();
