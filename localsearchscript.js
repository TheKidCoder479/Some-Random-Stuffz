async function loadDatabase() {
  const res = await fetch("database.txt");
  const text = await res.text();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const sites = [];
  for (let i = 0; i < lines.length; i += 2) {
    sites.push({ url: lines[i], title: lines[i + 1] || "", snippet: "" });
  }
  return sites;
}

function cleanText(text) {
  return text.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
}

async function runSearch() {
  const qRaw = document.getElementById("searchBox").value.trim();
  const q = cleanText(qRaw);
  const words = q.split(/\s+/).filter(Boolean);

  const resultsDiv = document.querySelector(".results");
  const sites = await loadDatabase();

  const scored = sites.map(site => {
    const titleClean = cleanText(site.title);
    const urlClean = cleanText(site.url);

    let score = 0;

    words.forEach(word => {
      if (titleClean.includes(word)) score += 3;
      if (urlClean.includes(word)) score += 2;
      if (site.title.includes(word) || site.url.includes(word)) score += 5; // case-sensitive bonus
    });

    return { ...site, score };
  });

  const filtered = scored.filter(s => s.score > 0);

  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.title.localeCompare(b.title);
  });

  resultsDiv.innerHTML = filtered.length
    ? filtered.map(r => `
      <div class="resultblock">
        <a href="${r.url}" target="_blank" class="resultlink">${r.title}</a>
        <p class="resulttext">(${r.url}) — First 2 sentences or up to 500 characters will go here later.</p>
      </div>
    `).join("")
    : `<p>No Results :(</p>`;
}

document.getElementById("searchBtn").addEventListener("click", runSearch);
document.getElementById("searchBox").addEventListener("keypress", e => {
  if (e.key === "Enter") runSearch();
});
