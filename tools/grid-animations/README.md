# Grid animations (projects 11–14)

Code-built, seamlessly looping 30 fps animations for the four playground grid tiles that were stills. Each scene is an
HTML page rendered frame by frame in headless Chrome: frame N is drawn at t = N / 30 s, with seeded noise only, so every
render is identical.

| Scene            | Project | Loop  | Loops because                                                                                |
| ---------------- | ------- | ----- | -------------------------------------------------------------------------------------------- |
| `years.html`     | 13      | 6 s   | Starts and ends fully drawn; each square snaps back to rest only while invisible.            |
| `cube.html`      | 14      | 8 s   | 120° about the white corner's diagonal maps the white and navy faces onto themselves.        |
| `chair.html`     | 12      | 7.5 s | Five chairs, 1.5 s each; the fifth dissolve lands on the Wassily at the loop point.          |
| `catalogue.html` | 11      | 7.5 s | Spreads 0 → 1 → 2 → 0; the cover's motion is whole-loop sine harmonics, all zero at frame 0. |

## Rendering

```sh
npm install                       # three.js, pinned
python3 prep/prepare_assets.py    # writes assets/ from the originals in git (needs Pillow, numpy, scipy)
NODE_PATH=<dir containing playwright> node render.cjs <scene> --frames all --scale 2 --out out/<scene>
```

`render.cjs` serves this folder and drives a Playwright Chrome helper with WebGL (SwiftShader). Set `GRID_PW_HELPER` to
the helper's path if it is not the default. `--query wassily=3d` renders the chair scene with the 3D Wassily in place of
the original pixels, for comparison.

`assets/` is generated (and git-ignored): run the prep step once before rendering.

The site's clips in `public/videos/grid/` were encoded from 2x renders with the same settings as the other grid videos:

```sh
ffmpeg -framerate 30 -i out/<scene>/%04d.png \
  -vf "scale=480:376:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -colorspace bt709 -color_primaries bt709 -color_trc iec61966-2-1 -color_range tv \
  -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -an <name>.webm
# same input and -vf, then:
  -c:v libx264 -profile:v high -preset slow -crf 21 -pix_fmt yuv420p -movflags +faststart \
  -colorspace bt709 -color_primaries bt709 -color_trc iec61966-2-1 -color_range tv -an <name>.mp4
```

Poster: frame 0 scaled to 480x376 (Lanczos), webp q75.

**Tag the transfer as sRGB (`iec61966-2-1`), not `bt709`.** The frames are sRGB pixels put through the BT.709 matrix;
they never pass through a BT.709 transfer curve. Tagged `bt709` (or untagged), Chrome converts the curve and renders the
`#0d0d0d` background as `#090909`, a visibly darker disc against the void. Tagged sRGB it renders `#0d0d0d` exactly. To
fix an existing file without re-encoding: `ffmpeg -i in -c copy -color_trc iec61966-2-1 out` (for mp4 also
`-bsf:v h264_metadata=transfer_characteristics=13`).

## Matching the originals

The originals are the 3000×2351 stills from commit `4378c50`. All scenes work in that pixel space and map it onto the
480×376 frame.

- **Background** `#0d0d0d`. **Grain**: the originals share one print texture of sparse vertical `#0d0d0d` streaks, fixed
  in screen space; `assets/grain.png` is a real patch of it (cube's white face), applied over moving shapes.
- **25 Big Years**: the blue square with its type is cropped from the original. The outline squares were fitted to its
  pixels: centre (1499.5, 1175), stroke centreline half-side 491.5, width ~13.5, at 18/36/54/72°, `#629bb7`.
- **Cube**: flat, unlit `#ffffff` / `#1b426e`. Pose and camera were fitted by least squares to the seven visible corners
  (worst corner 13 px of 3000; vertical fov 36.5° with a principal-point offset).
- **Chair**: ESP and CIO are cropped from the original, with the strokes behind the chair rebuilt from circles fitted to
  the visible edges. The camera was fitted to the Wassily's frame corners (frames 75 cm apart, 58.5 cm deep, arms at 51
  cm). Chairs render at the original's scale through a three-tone stipple filter (`#9d8800`, `#f8f8d8`, `#0d0d0d`).
- **Catalogue**: the cover is cut from the original at corners read off at 6× zoom and flattened. Pages are spreads from
  `public/projects/espacio-ideal-catalogues/espacio-catalogues-2.webp` (column 2; row 2 is the spread the original
  shows) through a page-space print shader (`#ffffff`, `#8b6a2a`, `#0d0d0d`, streaks along the spine).
