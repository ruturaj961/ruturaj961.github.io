// Renders project cards and project detail pages from PROJECTS (projects.js).
// Detail pages use hash routes (#/project/<slug>), so the site needs no server
// configuration and works both on GitHub Pages and when index.html is opened directly.

// ---------- tiny DOM helper ----------
function h(tag, attrs, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

const pad = (n) => String(n).padStart(2, "0");
const has = (arr) => Array.isArray(arr) && arr.length > 0;

function drivePreviewUrl(url) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
}

function youtubeEmbedUrl(url) {
  const m = (url || "").match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

function figure(project, index, className) {
  const label = `FIG. ${pad(index + 1)}`;
  const frame = h("div", { class: `figure ${className || ""}` });
  if (project.thumbnail) {
    frame.append(h("img", { src: project.thumbnail, alt: project.title, loading: "lazy" }));
  } else {
    frame.classList.add("hatched");
  }
  frame.append(h("span", { class: "fig-label" }, label));
  return frame;
}

// ---------- home: project cards ----------
function renderCards() {
  const grid = document.getElementById("project-grid");
  PROJECTS.forEach((p, i) => {
    grid.append(
      h("a", { class: "card", href: `#/project/${p.slug}`, id: `card-${p.slug}` },
        figure(p, i, "card-figure"),
        h("div", { class: "card-body" },
          h("p", { class: "card-meta mono" }, p.year),
          h("h3", { class: "card-title" }, p.title),
          h("p", { class: "card-summary" }, p.summary),
          has(p.tags) && h("ul", { class: "tags" }, p.tags.map((t) => h("li", null, t))),
          h("span", { class: "card-cta mono" }, "View project", h("span", { "aria-hidden": "true" }, " →"))
        )
      )
    );
  });
}

// ---------- detail page ----------
function sectionHead(num, title) {
  return h("h2", { class: "section-head" }, h("span", { class: "num" }, num), title);
}

function renderProject(index) {
  const p = PROJECTS[index];
  const view = document.getElementById("project-view");
  view.replaceChildren();

  const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  let n = 0;
  const num = () => `${pad(index + 1)}.${++n}`;

  const video = youtubeEmbedUrl(p.video);

  const parts = [
    h("a", { class: "back mono", href: "#projects" }, "← All projects"),

    h("header", { class: "project-head" },
      h("p", { class: "eyebrow mono" }, h("span", { class: "fig-ref" }, `FIG. ${pad(index + 1)} / `), p.year),
      h("h1", { class: "project-title" }, p.title),
      h("p", { class: "lead" }, p.summary),
      has(p.tags) && h("ul", { class: "tags" }, p.tags.map((t) => h("li", null, t)))
    ),

    figure(p, index, "project-hero"),

    has(p.results) && h("dl", { class: "results" },
      p.results.map((r) => h("div", null, h("dt", null, r.value), h("dd", { class: "mono" }, r.label)))
    ),

    (has(p.overview) || has(p.highlights) || has(p.specs)) &&
      h("section", { class: "project-body" },
        h("div", null,
          (has(p.overview) || has(p.highlights)) && sectionHead(num(), "Overview"),
          has(p.overview) && p.overview.map((para) => h("p", null, para)),
          has(p.highlights) && h("ul", { class: "highlights" }, p.highlights.map((x) => h("li", null, x)))
        ),
        has(p.specs) && h("aside", { class: "spec" },
          h("p", { class: "spec-title mono" }, "Specification"),
          h("table", null, h("tbody", null,
            p.specs.map((s) => h("tr", null, h("th", { scope: "row", class: "mono" }, s.label), h("td", null, s.value)))
          ))
        )
      ),

    video && h("section", null,
      sectionHead(num(), "Video"),
      h("div", { class: "video" },
        h("iframe", {
          src: video, title: `${p.title} video`, loading: "lazy", allowfullscreen: "",
          allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture",
        })
      )
    ),

    has(p.gallery) && h("section", null,
      sectionHead(num(), "Gallery"),
      h("div", { class: "gallery" },
        p.gallery.map((g, gi) =>
          h("button", { class: "gallery-item", type: "button", "data-src": g.src, "data-caption": g.caption || "" },
            h("img", { src: g.src, alt: g.caption || `${p.title} image ${gi + 1}`, loading: "lazy" }),
            g.caption && h("span", { class: "mono" }, g.caption)
          )
        )
      )
    ),

    has(p.links) && h("section", null,
      sectionHead(num(), "Documents and links"),
      h("ol", { class: "docs" },
        p.links.map((l, li) => {
          const preview = drivePreviewUrl(l.url);
          const row = h("div", { class: "doc-row" },
            h("span", { class: "doc-id mono" }, `DOC-${pad(li + 1)}`),
            h("span", { class: "doc-label" }, l.label),
            h("span", { class: "doc-actions mono" },
              preview && h("button", { type: "button", class: "doc-preview", "aria-expanded": "false" }, "Preview"),
              h("a", { href: l.url, target: "_blank", rel: "noopener" }, "Open ↗")
            )
          );
          const item = h("li", null, row);
          if (preview) item.dataset.preview = preview;
          return item;
        })
      )
    ),

    h("nav", { class: "pager", "aria-label": "More projects" },
      h("a", { href: `#/project/${prev.slug}` }, h("span", { class: "mono" }, "← Previous"), prev.title),
      h("a", { href: `#/project/${next.slug}`, class: "next" }, h("span", { class: "mono" }, "Next →"), next.title)
    ),
  ];
  // Optional sections evaluate to false/null when their data is missing; drop them.
  view.append(...parts.filter(Boolean));

  document.title = `${p.title} | Ruturaj Desai`;
}

// Inline PDF preview toggle (iframe is created only when first opened).
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".doc-preview");
  if (btn) {
    const li = btn.closest("li");
    let frame = li.querySelector(".doc-frame");
    if (!frame) {
      frame = h("div", { class: "doc-frame" },
        h("iframe", { src: li.dataset.preview, title: "Document preview", loading: "lazy", allow: "autoplay" })
      );
      li.append(frame);
    } else {
      frame.hidden = !frame.hidden;
    }
    const open = !frame.hidden;
    btn.textContent = open ? "Hide" : "Preview";
    btn.setAttribute("aria-expanded", String(open));
    return;
  }

  const item = e.target.closest(".gallery-item");
  if (item) {
    const box = document.getElementById("lightbox");
    box.querySelector("img").src = item.dataset.src;
    box.querySelector("img").alt = item.dataset.caption;
    box.querySelector("p").textContent = item.dataset.caption;
    box.showModal();
    return;
  }

  if (e.target.id === "lightbox" || e.target.closest(".lightbox-close")) {
    document.getElementById("lightbox").close();
  }
});

// ---------- router ----------
let lastProjectSlug = null;

function route() {
  const home = document.getElementById("home");
  const view = document.getElementById("project-view");
  const match = location.hash.match(/^#\/project\/([\w-]+)/);
  const index = match ? PROJECTS.findIndex((p) => p.slug === match[1]) : -1;

  if (index >= 0) {
    home.hidden = true;
    view.hidden = false;
    renderProject(index);
    lastProjectSlug = PROJECTS[index].slug;
    window.scrollTo(0, 0);
    return;
  }

  const comingBack = !view.hidden;
  view.hidden = true;
  home.hidden = false;
  document.title = "Ruturaj Desai | Mechanical Engineer";

  // Scroll manually: the browser could not scroll to an anchor while home was hidden.
  const target =
    comingBack && location.hash === "#projects" && lastProjectSlug
      ? document.getElementById(`card-${lastProjectSlug}`)
      : location.hash.length > 1 && document.getElementById(location.hash.slice(1));
  if (target) target.scrollIntoView({ block: comingBack && target.classList.contains("card") ? "center" : "start" });
  else if (comingBack) window.scrollTo(0, 0);
}

document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  document.getElementById("project-count").textContent = pad(PROJECTS.length);
  route();
});
window.addEventListener("hashchange", route);
