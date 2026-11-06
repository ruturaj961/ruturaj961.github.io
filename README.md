# Ruturaj Desai: portfolio site

A plain HTML/CSS/JS site with no build step. Open `index.html` in a browser to preview it.

## Files

| File | What it is |
|---|---|
| `index.html` | Home page content: hero, stats, about, experience, education, skills, contact |
| `projects.js` | **All projects.** Each entry is one card on the home page and one detail page |
| `mode.js` | Light/dark toggle (the button in the header). Light by default; remembers the visitor's choice |
| `main.js` | Builds the cards and detail pages from `projects.js`. Rarely needs editing |
| `style.css` | Base layout and styling |
| `themes/clean.css`, `themes/editorial.css` | The Editorial theme: fonts, colors and spacing |
| `assets/photo.jpg` | Hero portrait (add one, about 1000x1250). A hatched placeholder shows until it exists |
| `assets/thumbs/` | Project thumbnails (landscape, about 1600x1000) |
| `assets/projects/` | Gallery images for project pages (create the folder when needed) |
| `assets/Ruturaj_Desai_Resume.pdf` | The resume behind every Resume link |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

## Projects

Each project opens at `index.html#/project/<slug>` on the same site. The comment at the top
of `projects.js` lists every field. Only `slug`, `title`, `year` and `summary` are required;
any section without data is hidden. Optional sections:

- `results`: big highlighted numbers
- `specs`: the specification table (role, team, tools)
- `overview` and `highlights`: written description and bullet points
- `video`: a YouTube link, embedded on the page
- `gallery`: images that open in a viewer when clicked
- `links`: reports, code and CAD. Google Drive file links get an inline **Preview** button

Drive files must be shared as "Anyone with the link". Keep images under about 300 KB each.

## Hosting on GitHub Pages

1. Create a public repository named exactly `<your-github-username>.github.io`.
2. Push these files to the `main` branch, with `index.html` at the root of the repository.
3. In the repository, go to Settings > Pages and set Source to "Deploy from a branch", branch `main`, folder `/ (root)`.
4. After a minute or two the site is live at `https://<your-github-username>.github.io`.

## Theme

The site uses the **Editorial** theme. `style.css` is the base layout; `themes/clean.css` and
`themes/editorial.css` sit on top of it and set the fonts, colors and spacing. To change colors,
edit the variables at the top of `themes/editorial.css`: `:root` for light mode and
`:root[data-mode="dark"]` for dark mode.

Light mode is the default. The header button switches to dark mode, and the visitor's choice is remembered.
