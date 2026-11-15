// Tubular-steel chair models for the Espacio Ideal scene, built from tube paths.
//
// Units are centimetres. Origin is the floor at the chair's centre; x is across the chair, y is up, +z is the
// front. The Wassily's frame was measured from the original artwork (frames 75 cm apart, 58.5 cm deep, arms at
// 51 cm); the others use catalogue proportions, rounded. They read as the designs, not to the millimetre.
import * as THREE from 'three';

const TUBE_R = 1.25; // 25 mm tube

// A polyline with its corners rounded to `bend` (cm), as a single smooth curve.
export function roundedPath(points, bend = 4, closed = false) {
  const pts = points.map(p => new THREE.Vector3(...p));
  const path = new THREE.CurvePath();
  const n = pts.length;
  const corner = i => {
    const p = pts[i];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const a = prev.clone().sub(p);
    const b = next.clone().sub(p);
    const r = Math.min(bend, a.length() / 2, b.length() / 2);
    return {
      in: p.clone().add(a.normalize().multiplyScalar(r)),
      at: p,
      out: p.clone().add(b.normalize().multiplyScalar(r)),
    };
  };
  const first = closed ? corner(0).out : pts[0];
  let cursor = first;
  const last = closed ? n : n - 1;
  for (let i = 1; i <= last; i++) {
    const idx = i % n;
    if (!closed && idx === n - 1) {
      path.add(new THREE.LineCurve3(cursor, pts[idx]));
      break;
    }
    const c = corner(idx);
    path.add(new THREE.LineCurve3(cursor, c.in));
    path.add(new THREE.QuadraticBezierCurve3(c.in, c.at, c.out));
    cursor = c.out;
  }
  return path;
}

function tube(points, { bend = 4, closed = false, r = TUBE_R } = {}) {
  const path = roundedPath(points, bend, closed);
  const segs = Math.max(32, Math.round(path.getLength() * 1.5));
  return new THREE.Mesh(new THREE.TubeGeometry(path, segs, r, 16, closed), 'metal');
}

// A fabric/leather band: a surface between two edge polylines with the same number of points.
function band(edgeA, edgeB, divisions = 24) {
  const a = roundedPath(edgeA, 3);
  const b = roundedPath(edgeB, 3);
  const pos = [];
  const idx = [];
  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions;
    pos.push(...a.getPointAt(t).toArray(), ...b.getPointAt(t).toArray());
    if (i < divisions) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, 'fabric');
}

function box(w, h, d, x, y, z, bevel = 2) {
  const geo = new THREE.BoxGeometry(w, h, d, 1, 1, 1);
  const m = new THREE.Mesh(geo, 'fabric');
  m.position.set(x, y, z);
  m.userData.bevel = bevel;
  return m;
}

const mirrorX = pts => pts.map(([x, y, z]) => [-x, y, z]);

// --- Wassily (Breuer, 1925) --------------------------------------------------------------------------------------
function wassily() {
  const W = 37.5; // side frames, from the fit
  const D = 29.3;
  const ARM = 51;
  const S = 31; // inner seat/back rails
  const parts = [];
  for (const x of [-W, W]) {
    // Side frame: floor runner, front leg, armrest, back leg.
    parts.push(
      tube(
        [
          [x, 0, -D],
          [x, 0, D],
          [x, ARM, D],
          [x, ARM, -D],
        ],
        { closed: true, bend: 5 }
      )
    );
  }
  // Inner seat/back frame: front cross rail, seat rails sloping back, back uprights, top bar.
  const half = [
    [W, 41, D - 2],
    [S, 41, D - 2],
    [S, 31, -D + 7],
    [S, 72, -D - 2],
  ];
  parts.push(tube([...mirrorX(half).reverse(), ...half], { bend: 4 }));
  // Rear cross rail between the side frames, at seat height.
  parts.push(
    tube(
      [
        [-W, 31, -D],
        [W, 31, -D],
      ],
      { bend: 2 }
    )
  );
  // Seat sling, back band and the two armrest straps.
  parts.push(
    band(
      [
        [-S, 40, D - 3],
        [-S, 31.5, -D + 7],
      ],
      [
        [S, 40, D - 3],
        [S, 31.5, -D + 7],
      ]
    )
  );
  parts.push(
    band(
      [
        [-S, 52, -D + 2.5],
        [S, 52, -D + 2.5],
      ],
      [
        [-S, 70, -D - 1.5],
        [S, 70, -D - 1.5],
      ]
    )
  );
  for (const s of [-1, 1]) {
    parts.push(
      band(
        [
          [s * W, ARM - 1, D - 6],
          [s * W, ARM - 1, -D + 4],
        ],
        [
          [s * S, ARM - 6, D - 6],
          [s * S, ARM - 6, -D + 4],
        ]
      )
    );
  }
  return parts;
}

// --- Cesca B32 (Breuer, 1928): cantilever with a U on the floor at the back -------------------------------------
function cesca() {
  const w = 22;
  const side = [
    [w, 0, -22], // floor, back (joined by the rear floor U)
    [w, 0, 16],
    [w, 45, 23], // front leg, leaning forward
    [w, 45, -14], // seat side
    [w, 82, -21], // back upright
  ];
  const parts = [tube([...mirrorX(side).reverse(), ...side], { bend: 6 })];
  // Cane seat and back panels in wooden frames.
  parts.push(box(44, 3, 37, 0, 47, 4, 1.5));
  const back = box(44, 22, 2.5, 0, 70, -19, 1);
  back.rotation.x = -0.18;
  parts.push(back);
  return parts;
}

// --- MR10 (Mies van der Rohe, 1927): cantilever with the big front arc ------------------------------------------
function mr10() {
  const w = 24;
  const R = 22;
  const zc = 8; // arc centre z
  const arc = [];
  for (let i = 0; i <= 16; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 16; // bottom -> front -> top
    arc.push([w, R + R * Math.sin(a), zc + R * Math.cos(a)]);
  }
  const side = [[w, 0, -30], ...arc, [w, 43, -18], [w, 84, -27]];
  const parts = [tube([...mirrorX(side).reverse(), ...side], { bend: 3 })];
  // Leather seat and back slings.
  parts.push(
    band(
      [
        [-w + 1, 43.5, zc],
        [-w + 1, 42, -16],
      ],
      [
        [w - 1, 43.5, zc],
        [w - 1, 42, -16],
      ]
    )
  );
  parts.push(
    band(
      [
        [-w + 1, 60, -21.5],
        [w - 1, 60, -21.5],
      ],
      [
        [-w + 1, 81, -26.5],
        [w - 1, 81, -26.5],
      ]
    )
  );
  return parts;
}

// --- S33 (Stam, 1926): angular cantilever with tight bends -----------------------------------------------------
function s33() {
  const w = 23;
  const side = [
    [w, 0, -22],
    [w, 0, 22],
    [w, 44, 22],
    [w, 44, -19],
    [w, 84, -23],
  ];
  const parts = [tube([...mirrorX(side).reverse(), ...side], { bend: 2.5 })];
  parts.push(
    band(
      [
        [-w + 1, 44.5, 20],
        [-w + 1, 44.5, -17],
      ],
      [
        [w - 1, 44.5, 20],
        [w - 1, 44.5, -17],
      ]
    )
  );
  parts.push(
    band(
      [
        [-w + 1, 58, -20.5],
        [w - 1, 58, -20.5],
      ],
      [
        [-w + 1, 82, -22.7],
        [w - 1, 82, -22.7],
      ]
    )
  );
  return parts;
}

// --- LC2-style (Le Corbusier, Jeanneret, Perriand, 1928): a tube cage holding box cushions ----------------------
function lc2() {
  const X = 38;
  const Z = 34;
  const TOP = 64;
  const BASE = 13;
  const parts = [];
  // Bottom perimeter, top rail around the arms and back, four legs.
  parts.push(
    tube(
      [
        [-X, BASE, -Z],
        [X, BASE, -Z],
        [X, BASE, Z],
        [-X, BASE, Z],
      ],
      { closed: true, bend: 2 }
    )
  );
  parts.push(
    tube(
      [
        [-X, TOP, Z],
        [-X, TOP, -Z],
        [X, TOP, -Z],
        [X, TOP, Z],
      ],
      { bend: 2 }
    )
  );
  for (const [x, z] of [
    [-X, -Z],
    [X, -Z],
    [X, Z],
    [-X, Z],
  ])
    parts.push(
      tube([
        [x, 0, z],
        [x, TOP, z],
      ])
    );
  // Cushions: seat, back, two arms.
  parts.push(box(60, 26, 60, 0, BASE + 14, 3));
  parts.push(box(60, 36, 13, 0, BASE + 32, -Z + 7.5));
  for (const s of [-1, 1]) parts.push(box(13, 49, 66, s * (X - 7.5), BASE + 25.5, 0));
  return parts;
}

export const CHAIRS = [
  { name: 'Wassily', build: wassily, fitted: true }, // already in the fitted floor coordinates
  // The cantilevers are scaled up 15% about their floor centre so they fill the gap between ESP and CIO like the
  // Wassily does.
  { name: 'Cesca B32', build: cesca, scale: 1.15 },
  { name: 'MR10', build: mr10, scale: 1.15 },
  { name: 'S33', build: s33, scale: 1.15 },
  // The LC2 keeps the heavier cushion stipple it had in the first approved version.
  { name: 'LC2', build: lc2, fabric: { noise: 0.4, threshold: 0.45 } },
];

// Builds a chair as a group, giving each mesh the shared metal or fabric material.
export function buildChair(index, materials) {
  const group = new THREE.Group();
  for (const mesh of CHAIRS[index].build()) {
    mesh.material = materials[mesh.material];
    group.add(mesh);
  }
  if (CHAIRS[index].fitted) return group;
  // Stand it on the floor, centred.
  const bounds = new THREE.Box3().setFromObject(group);
  const centre = bounds.getCenter(new THREE.Vector3());
  group.position.set(-centre.x, -bounds.min.y, -centre.z);
  const outer = new THREE.Group();
  outer.add(group);
  outer.scale.setScalar(CHAIRS[index].scale ?? 1);
  return outer;
}
