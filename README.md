# Sago Made: Personal Portfolio

Portfolio site of Santiago Mejia Mora, a designer based in Toronto. Deployed on Vercel.

Video demo: https://youtu.be/wBHqlOYGtAY

## About the project

My coding journey began with learning front-end development fundamentals through **HTML and CSS**, which enabled me to
transform static designs into web experiences. As I progressed, I developed an interest in creating dynamic, interactive
websites, naturally drawing me toward JavaScript and modern frameworks. This **personal portfolio website** showcases my
skills in a practical, personal way: it demonstrates my technical abilities and presents my professional work, projects
and design philosophy to potential clients and employers.

The site has four parts:

- **Home (`/`)**: a full-screen, endlessly pannable grid of project tiles. Drag, scroll or swipe in any direction;
  click a tile to open the case study. A short typing intro plays once per browser session.
- **Project pages (`/projects/:id`)**: case-study template rendered from `src/data/projectData.json` (overview, vision,
  problem, research, process, solution, impact, images and "deep dive" dialogs). Typography projects also get an
  interactive type playground.
- **About (`/about`)**: links (CV, portfolio, LinkedIn, GitHub) and a "Design Uptime" calendar heatmap of logged
  design sessions from `src/data/designActivities.json`. Hovering a day shows that day's journal entry.
- **Contact (`/contact`)**: contact details and availability (the route exists but is not linked from the nav).

Every in-app navigation runs through a full-screen pixel-dissolve transition (GSAP).

## Tech stack

- [Vite 6](https://vite.dev) + [React 19](https://react.dev) + TypeScript (strict)
- [React Router 7](https://reactrouter.com) with route-level code splitting
- [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite`, plus `tw-animate-css`
- [GSAP](https://gsap.com) (page transition, intro fade), [Motion](https://motion.dev) (typing animation)
- [react-day-picker](https://daypicker.dev) (heatmap), [Headless UI](https://headlessui.com) (dialogs),
  [lucide-react](https://lucide.dev) (icons), shadcn-style `Button`
- [Vercel Analytics](https://vercel.com/docs/analytics) and Speed Insights

## Getting started

Requires Node 20+.

```bash
npm ci
npm run dev        # dev server at http://localhost:5173
```

| Script                 | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server                             |
| `npm run build`        | Type-check (`tsc -b`) and build to `dist/`            |
| `npm run preview`      | Serve the production build locally                    |
| `npm run typecheck`    | Type-check only                                       |
| `npm run lint`         | ESLint                                                |
| `npm run format`       | Format everything with Prettier                       |
| `npm run format:check` | Check formatting without writing                      |
| `npm run check`        | Typecheck, lint and format check (run before pushing) |

## Project structure

```
public/
  fonts/                 Espacio Ideal typeface (used by the type playground)
  optimized/             Home-grid preview images (WebP)
  projects/<slug>/       Case-study images, referenced from projectData.json
scripts/
  optimize-images.sh     ffmpeg helper: public/gifs/*.gif -> public/optimized/*.webp
src/
  main.tsx               Entry point
  App.tsx                Router, lazy routes, Vercel Analytics / Speed Insights
  index.css              Tailwind import, fonts, global styles, CSS variables
  pages/                 One component per route (Home, About, Contact, ProjectPage, NotFound)
  components/
    layout/              Layout (route shell), SiteNavigation, PixelPageTransition
    home/                InfiniteProjectGrid, ProjectCard, LoadingScreen (intro)
    project/             Case-study building blocks, CodeSnippet, TypographyPlayground
    ui/                  Generic primitives: button, image, detail-dialog, calendar-heatmap,
                         typing-animation, progressive-blur, interactive-hover-button
  data/                  Content: projectData.json, designActivities.json, homeProjects.json,
                         homeProjectImages.ts
  lib/                   utils (cn), page-transition (shared transition handle), home-grid (grid math)
  types/                 Types for the JSON content
```

The `@/` import alias points to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

## Editing content

- **Add or edit a case study**: add an entry to `src/data/projectData.json` keyed by its id (see `ProjectDetail` in
  `src/types/index.ts` for the fields; image fields are indexes into `images`). To show it on the home grid, add the same
  id to `src/data/homeProjects.json` and its preview image to `src/data/homeProjectImages.ts`.
- **Log a design session**: append `{ "date": "YYYY-MM-DD", "weight": <hours>, "entry": "..." }` to
  `src/data/designActivities.json`. The most recent entry is shown by default on the About page.

## Deployment

Deployed on Vercel. `vercel.json` rewrites every path to `index.html` so client-side routes work on refresh.
