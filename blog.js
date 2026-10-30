// Fills the ブログ section with the newest note posts (from /api/blog)
(async () => {
  const box = document.getElementById("blog");
  if (!box) return;
  try {
    const data = await (await fetch("/api/blog")).json();
    const list = box.querySelector(".blog-list");
    list.innerHTML = data.posts
      .map(
        (p) => `<a class="card blog-card" href="${p.link}" target="_blank" rel="noopener">
  <div class="photo" data-label="note">${p.image ? `<img src="${p.image}" alt="" loading="lazy">` : ""}</div>
  <small>${p.date.replace(/-/g, ".")}</small><h3>${p.title.replace(/</g, "&lt;")}</h3></a>`,
      )
      .join("");
    box.querySelector(".blog-more").href = data.profile;
    if (data.sample) box.querySelector(".blog-sample").hidden = false;
  } catch {
    box.hidden = true;
  }
})();
