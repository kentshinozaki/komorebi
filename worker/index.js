// Serves the static site, plus /api/blog: the newest posts from the shop's note account.
// Set NOTE_USER (the note ID, e.g. "komorebi_cafe") to use real posts; empty = sample posts for the demo.

const SAMPLE = [
  { title: "秋の焼き菓子ギフトを始めました", date: "2026-10-15", image: "/assets/img/tart.jpg", link: "https://note.com/" },
  { title: "焙煎所におじゃましてきました", date: "2026-10-08", image: "/assets/img/roasting.jpg", link: "https://note.com/" },
  { title: "日替わりランチ、今週のスープ", date: "2026-10-01", image: "/assets/img/lunch.jpg", link: "https://note.com/" },
];

function pick(item, tag) {
  const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
}

async function notePosts(user) {
  const res = await fetch(`https://note.com/${encodeURIComponent(user)}/rss`, {
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`note ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 3).map(([, item]) => ({
    title: pick(item, "title"),
    link: pick(item, "link"),
    date: new Date(pick(item, "pubDate")).toISOString().slice(0, 10),
    image: pick(item, "media:thumbnail"),
  }));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/blog") {
      let posts = SAMPLE;
      let sample = true;
      if (env.NOTE_USER) {
        try {
          posts = await notePosts(env.NOTE_USER);
          sample = false;
        } catch {
          posts = [];
        }
      }
      return Response.json(
        { sample, profile: env.NOTE_USER ? `https://note.com/${env.NOTE_USER}` : "https://note.com/", posts },
        { headers: { "cache-control": "public, max-age=600" } },
      );
    }
    return env.ASSETS.fetch(request);
  },
};
