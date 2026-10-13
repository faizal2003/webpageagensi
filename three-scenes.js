import * as THREE from 'three';

// ── Motion state ──────────────────────────────────────────────────────────────
function isMotionDisabled() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = false;
  try { paused = localStorage.getItem('eschanyx-motion') === 'paused'; } catch {}
  return reduced || paused;
}
let motionOff = isMotionDisabled();
window.addEventListener('storage', () => { motionOff = isMotionDisabled(); });
new MutationObserver(() => {
  motionOff = document.documentElement.classList.contains('motion-paused') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  dark:     0x0e0d0b,
  darkRule: 0x2a2724,
  muted:    0x5a5550,
  paper:    0xf5f2ec,
  accent:   0xd4520a,
  focus:    0xff7030,
  gold:     0xc8922a,
  dim:      0x3a3734,
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1 — Hero: Obsidian-style node graph of Eschanyx services
// ─────────────────────────────────────────────────────────────────────────────
function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(C.dark, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 300);
  camera.position.set(0, 0, 28);
  camera.lookAt(0, 0, 0);

  // ── Lights ────────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.06));
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(10, 15, 10);
  scene.add(key);

  // ── Node graph data ───────────────────────────────────────────────────────
  // tier: 0=hub, 1=main service, 2=sub-service
  // color: node dot colour, radius: sphere size
  const GRAPH = [
    // ── Hub ──
    { id: 0, label: 'Eschanyx',          tier: 0, x:  0,     y:  0,    z: 0,
      color: C.accent, radius: 0.95,
      subtitle: 'Your digital partner',
      detail: 'We build custom software, smarter systems and a stronger online presence for small businesses ready for their next chapter.' },

    // ── Main services ──
    { id: 1, label: 'Custom Software',   tier: 1, x: -7.5,  y:  3.5,  z:-1,
      color: C.paper, radius: 0.60,
      subtitle: 'Bespoke tools for how you work',
      detail: 'We design and build software around your team\'s real workflow — not the other way around. Less time on workarounds, more time on the work.' },
    { id: 2, label: 'Websites',          tier: 1, x:  6.5,  y:  4,    z: 1,
      color: C.paper, radius: 0.60,
      subtitle: 'Online presence that converts',
      detail: 'Fast, responsive websites designed around your brand and your customers — from first click to getting in touch or placing an order.' },
    { id: 3, label: 'Automation',        tier: 1, x:  7,    y: -3.5,  z:-1,
      color: C.gold,  radius: 0.60,
      subtitle: 'Less repetition, more flow',
      detail: 'Connect the tools you already use and take repetitive tasks off your plate — keeping information moving between sales, ops and delivery.' },
    { id: 4, label: 'Digital Strategy',  tier: 1, x: -6.5,  y: -4,    z: 1,
      color: C.gold,  radius: 0.60,
      subtitle: 'A clear path forward',
      detail: 'We help you map a practical route from paper and spreadsheets to a fully connected digital business, starting with changes that matter most.' },

    // ── Custom Software children ──
    { id: 5,  label: 'Internal Tools',     tier: 2, x:-12,   y:  6,   z:-2,  color: C.muted, radius: 0.32,
      subtitle: 'Tools your team actually use', detail: 'Custom dashboards, admin panels and internal apps built around your operations.' },
    { id: 6,  label: 'Inventory & Orders', tier: 2, x:-11,   y:  2,   z: 1,  color: C.muted, radius: 0.32,
      subtitle: 'Stock and order clarity',       detail: 'Track what you have, what\'s been ordered and what\'s on the way — in one place.' },
    { id: 7,  label: 'Customer Mgmt',      tier: 2, x:-13.5, y:  4.5, z: 0,  color: C.muted, radius: 0.32,
      subtitle: 'Your clients, organised',       detail: 'A single view of every customer: history, notes, jobs and communication.' },

    // ── Websites children ──
    { id: 8,  label: 'E-commerce',   tier: 2, x: 9.5,  y:  7,   z: 2,  color: C.muted, radius: 0.32,
      subtitle: 'Sell online with confidence', detail: 'Product pages, checkout, inventory sync and order tracking built for your catalogue.' },
    { id: 9,  label: 'Booking',      tier: 2, x: 12,   y:  4,   z:-1,  color: C.muted, radius: 0.32,
      subtitle: 'Appointments made easy',      detail: 'Online booking flows that match your service calendar and confirm automatically.' },
    { id: 10, label: 'Brand & UX',   tier: 2, x:  9,   y:  1.5, z: 2,  color: C.muted, radius: 0.32,
      subtitle: 'Designed to be remembered',   detail: 'Typography, colour and layout decisions that make your business look as good as it is.' },

    // ── Automation children ──
    { id: 11, label: 'CRM Sync',         tier: 2, x: 12.5, y: -1.5, z: 0,  color: C.muted, radius: 0.32,
      subtitle: 'Your CRM, always current',       detail: 'Contacts, deals and notes flow between your forms, email and CRM without manual entry.' },
    { id: 12, label: 'Invoice Triggers', tier: 2, x: 11,   y: -5.5, z: 1,  color: C.muted, radius: 0.32,
      subtitle: 'Get paid faster',                detail: 'Invoices generated and sent automatically when a job is completed or a milestone reached.' },
    { id: 13, label: 'Email Workflows',  tier: 2, x:  8.5, y: -7,   z:-1,  color: C.muted, radius: 0.32,
      subtitle: 'Follow-ups on autopilot',        detail: 'Sequences, reminders and confirmations go out at the right time without anyone pressing send.' },
    { id: 14, label: 'Reporting',        tier: 2, x: 13,   y: -4,   z:-2,  color: C.muted, radius: 0.32,
      subtitle: 'Numbers that mean something',    detail: 'Automated reports land in your inbox — no spreadsheet wrangling, just the numbers you need.' },

    // ── Digital Strategy children ──
    { id: 15, label: 'Process Mapping', tier: 2, x: -9,    y: -7,   z: 0,  color: C.muted, radius: 0.32,
      subtitle: 'See how work really flows', detail: 'We document your current process, find the friction and agree on where digital changes make the biggest difference.' },
    { id: 16, label: 'Digital Roadmap', tier: 2, x:-12,    y: -5.5, z:-1,  color: C.muted, radius: 0.32,
      subtitle: 'Know what comes next',      detail: 'A prioritised plan of digital changes phased to your budget and capacity — not a wishlist.' },
    { id: 17, label: 'Team Onboarding', tier: 2, x:-13,    y: -2.5, z: 2,  color: C.muted, radius: 0.32,
      subtitle: 'People first, then tools',  detail: 'We prepare your team for new systems with clear guides, walkthroughs and a handover that actually sticks.' },
  ];

  // ── Edges ─────────────────────────────────────────────────────────────────
  const EDGES = [
    [0,1],[0,2],[0,3],[0,4],        // hub → main
    [1,5],[1,6],[1,7],              // software children
    [2,8],[2,9],[2,10],             // website children
    [3,11],[3,12],[3,13],[3,14],    // automation children
    [4,15],[4,16],[4,17],           // strategy children
    // cross-links (the "knowledge graph" feel)
    [1,3],[2,3],[3,4],[1,4],
    [8,12],[11,6],[13,9],[15,5],
  ];

  // ── Build node meshes ─────────────────────────────────────────────────────
  const nodeGroup = new THREE.Group();
  scene.add(nodeGroup);

  const nodeMeshes  = [];
  const nodeLights  = [];
  const nodeClickable = [];

  GRAPH.forEach(nd => {
    // Glow halo (additive blending, slightly larger sphere)
    const haloMat = new THREE.MeshBasicMaterial({
      color: nd.color,
      transparent: true,
      opacity: nd.tier === 0 ? 0.18 : nd.tier === 1 ? 0.12 : 0.06,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(nd.radius * 2.2, 16, 16),
      haloMat
    );
    halo.position.set(nd.x, nd.y, nd.z);
    nodeGroup.add(halo);

    // Solid node
    const mat = new THREE.MeshStandardMaterial({
      color: nd.color,
      emissive: nd.color,
      emissiveIntensity: nd.tier === 0 ? 0.55 : nd.tier === 1 ? 0.3 : 0.12,
      roughness: 0.3,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(nd.radius, 32, 32), mat);
    mesh.position.set(nd.x, nd.y, nd.z);
    mesh.userData = { nodeId: nd.id };
    nodeGroup.add(mesh);
    nodeMeshes.push({ mesh, halo, nd });
    nodeClickable.push(mesh);

    // Point light on hub and main nodes
    if (nd.tier <= 1) {
      const light = new THREE.PointLight(nd.color, nd.tier === 0 ? 2.5 : 1.0, nd.tier === 0 ? 12 : 7);
      light.position.set(nd.x, nd.y, nd.z);
      scene.add(light);
      nodeLights.push({ light, nd });
    }
  });

  // ── Build edges ───────────────────────────────────────────────────────────
  const edgeGroup = new THREE.Group();
  scene.add(edgeGroup);

  EDGES.forEach(([a, b]) => {
    const nA = GRAPH[a], nB = GRAPH[b];
    const isCross = a > 0 && b > 0 && GRAPH[a].tier === GRAPH[b].tier;
    const points = [
      new THREE.Vector3(nA.x, nA.y, nA.z),
      new THREE.Vector3(nB.x, nB.y, nB.z),
    ];
    const geo  = new THREE.BufferGeometry().setFromPoints(points);
    const mat  = new THREE.LineBasicMaterial({
      color: isCross ? 0x4a4540 : 0x2e2b28,
      transparent: true,
      opacity: isCross ? 0.45 : 0.65,
    });
    edgeGroup.add(new THREE.Line(geo, mat));
  });

  // ── Particles flowing along edges ─────────────────────────────────────────
  // Only on hub→main edges for clarity
  const FLOW_EDGES = [[0,1],[0,2],[0,3],[0,4]];
  const flowParticles = [];
  const particleMat = new THREE.MeshBasicMaterial({ color: C.accent, transparent: true });
  FLOW_EDGES.forEach(([a, b]) => {
    const nA = GRAPH[a], nB = GRAPH[b];
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(nA.x, nA.y, nA.z),
      new THREE.Vector3(nB.x, nB.y, nB.z)
    );
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), particleMat.clone());
      scene.add(m);
      flowParticles.push({ curve, t: i / 3, speed: 0.004 + Math.random() * 0.002, mesh: m });
    }
  });

  // ── HTML info card ────────────────────────────────────────────────────────
  const card = document.createElement('div');
  card.style.cssText = `
    position:absolute; pointer-events:none;
    bottom:24px; right:24px;
    background:rgba(14,13,11,0.92);
    border:1px solid rgba(212,82,10,0.4);
    border-top:3px solid #d4520a;
    border-radius:6px;
    padding:16px 20px 14px;
    color:#f5f2ec;
    font-family:'Space Grotesk',system-ui,sans-serif;
    width:240px;
    opacity:0;
    transition:opacity 220ms cubic-bezier(.22,1,.36,1), transform 220ms cubic-bezier(.22,1,.36,1);
    transform:translateY(6px);
    z-index:3;
    backdrop-filter:blur(6px);
    -webkit-backdrop-filter:blur(6px);
  `;
  card.innerHTML = `
    <p style="font-size:8px;letter-spacing:2px;color:#d4520a;margin:0 0 5px" class="c-ey"></p>
    <p style="font-size:14px;font-weight:600;letter-spacing:-.3px;margin:0 0 7px" class="c-ti"></p>
    <p style="font-size:11px;color:#9e9a94;line-height:1.65;margin:0" class="c-de"></p>
    <p style="font-size:9px;color:#3a3734;margin:10px 0 0;letter-spacing:.5px">ESC or click away to close</p>
  `;
  canvas.parentElement.appendChild(card);

  // Hint
  const hint = document.createElement('div');
  hint.style.cssText = `
    position:absolute; bottom:22px; left:50%; transform:translateX(-50%);
    font-size:9px; letter-spacing:1.6px; color:#2e2b28;
    font-family:'Geist',system-ui,sans-serif;
    pointer-events:none; z-index:3; transition:opacity 200ms;
    white-space:nowrap;
  `;
  hint.textContent = 'CLICK ANY NODE TO EXPLORE';
  canvas.parentElement.appendChild(hint);

  // Node labels (small text sprites for tier-1 nodes)
  function makeTextSprite(text, tier) {
    const W = tier === 0 ? 280 : tier === 1 ? 220 : 160;
    const H = tier === 0 ? 44  : tier === 1 ? 36  : 28;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = tier === 0 ? '#d4520a' : tier === 1 ? '#f5f2ec' : '#9e9a94';
    ctx.font = `${tier === 0 ? 600 : tier === 1 ? 500 : 400} ${tier === 0 ? 22 : tier === 1 ? 18 : 14}px "Space Grotesk",system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H / 2);
    const tex = new THREE.CanvasTexture(cv);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    const scale = tier === 0 ? 3.5 : tier === 1 ? 2.8 : 2.0;
    sprite.scale.set(scale, scale * (H / W), 1);
    return sprite;
  }

  GRAPH.forEach(nd => {
    const sprite = makeTextSprite(nd.label, nd.tier);
    const yOff = nd.radius + (nd.tier === 0 ? 1.25 : nd.tier === 1 ? 0.95 : 0.7);
    sprite.position.set(nd.x, nd.y + yOff, nd.z);
    scene.add(sprite);
  });

  // ── Camera state ──────────────────────────────────────────────────────────
  const camDefault = { x: 0, y: 0, z: 28 };
  const camTarget  = { ...camDefault };
  const lookTarget  = new THREE.Vector3(0, 0, 0);
  const lookCurrent = new THREE.Vector3(0, 0, 0);
  let selectedId = -1;

  function showCard(nd) {
    card.querySelector('.c-ey').textContent = nd.label.toUpperCase();
    card.querySelector('.c-ti').textContent = nd.subtitle;
    card.querySelector('.c-de').textContent = nd.detail;
    card.style.opacity   = '1';
    card.style.transform = 'translateY(0)';
    hint.style.opacity   = '0';
  }
  function hideCard() {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(6px)';
    hint.style.opacity   = '1';
  }

  function selectNode(nd) {
    selectedId = nd.id;
    // Zoom toward node
    const zOff = nd.tier === 0 ? 14 : nd.tier === 1 ? 10 : 8;
    camTarget.x = nd.x * 0.55;
    camTarget.y = nd.y * 0.55;
    camTarget.z = nd.z + zOff;
    lookTarget.set(nd.x, nd.y, nd.z);
    showCard(nd);
  }
  function deselect() {
    selectedId = -1;
    camTarget.x = camDefault.x;
    camTarget.y = camDefault.y;
    camTarget.z = camDefault.z;
    lookTarget.set(0, 0, 0);
    hideCard();
  }

  // ── Raycaster ─────────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.3;
  const pointer = new THREE.Vector2();
  let mx = 0, my = 0;

  function toNDC(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
    pointer.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
    mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
    my = ((e.clientY - r.top)  / r.height - 0.5) * 2;
  }

  canvas.addEventListener('mousemove', e => {
    toNDC(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(nodeClickable);
    canvas.style.cursor = hits.length > 0 ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', e => {
    toNDC(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(nodeClickable);
    if (hits.length > 0) {
      const id = hits[0].object.userData.nodeId;
      if (selectedId === id) deselect();
      else selectNode(GRAPH[id]);
    } else {
      deselect();
    }
  });

  window.addEventListener('keydown', e => { if (e.key === 'Escape') deselect(); });

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    const w = canvas.parentElement.clientWidth  || 600;
    const h = canvas.parentElement.clientHeight || 500;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  // ── Animate ───────────────────────────────────────────────────────────────
  let t = 0;
  // Slow drift for the whole graph (Obsidian's gentle breathing)
  const graphGroup = new THREE.Group();
  graphGroup.add(nodeGroup);
  graphGroup.add(edgeGroup);
  scene.add(graphGroup);

  function animate() {
    requestAnimationFrame(animate);

    if (!motionOff) {
      t += 0.008;

      // Gentle graph drift
      graphGroup.rotation.y = Math.sin(t * 0.18) * 0.04;
      graphGroup.rotation.x = Math.sin(t * 0.12) * 0.025;

      // Camera smooth lerp
      const lerpS = 0.05;
      const parallaxX = selectedId === -1 ? mx * 1.8 : 0;
      const parallaxY = selectedId === -1 ? my * -1.2 : 0;
      camera.position.x += (camTarget.x + parallaxX - camera.position.x) * lerpS;
      camera.position.y += (camTarget.y + parallaxY - camera.position.y) * lerpS;
      camera.position.z += (camTarget.z - camera.position.z) * lerpS;
      lookCurrent.lerp(lookTarget, lerpS);
      camera.lookAt(lookCurrent);

      // Node pulse / breathe
      nodeMeshes.forEach(({ mesh, halo, nd }) => {
        const isSelected = nd.id === selectedId;
        const breathe = Math.sin(t * (nd.tier === 0 ? 1.8 : 1.2) + nd.id * 0.7) * 0.5 + 0.5;
        const baseEmissive = nd.tier === 0 ? 0.45 : nd.tier === 1 ? 0.22 : 0.08;
        mesh.material.emissiveIntensity = baseEmissive + breathe * (nd.tier === 0 ? 0.25 : 0.12) + (isSelected ? 0.25 : 0);
        halo.material.opacity = (nd.tier === 0 ? 0.12 : nd.tier === 1 ? 0.08 : 0.04) + breathe * 0.06 + (isSelected ? 0.1 : 0);
        const targetScale = isSelected ? 1.18 : 1.0;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
      });

      // Point lights breathe
      nodeLights.forEach(({ light, nd }) => {
        const breathe = Math.sin(t * 1.4 + nd.id * 0.9) * 0.5 + 0.5;
        const base = nd.tier === 0 ? 2.0 : 0.7;
        light.intensity = base + breathe * (nd.tier === 0 ? 1.2 : 0.5);
      });

      // Flow particles along hub edges
      flowParticles.forEach(fp => {
        fp.t = (fp.t + fp.speed) % 1;
        const pos = fp.curve.getPoint(fp.t);
        fp.mesh.position.copy(pos);
        const bright = Math.sin(fp.t * Math.PI);
        fp.mesh.material.opacity = 0.2 + bright * 0.8;
        fp.mesh.scale.setScalar(0.5 + bright * 0.8);
      });
    }

    renderer.render(scene, camera);
  }
  animate();
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — About: Orbiting Core ("The Engine")
//   A solid orange core with 3 armillary rings at different tilts,
//   small satellite spheres riding each ring, gentle mouse parallax.
// ─────────────────────────────────────────────────────────────────────────────
function initAboutScene() {
  const canvas = document.getElementById('about-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0e0d0b, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  camera.lookAt(0, 0, 0);

  // ── Lights ──────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.08));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(6, 10, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x442200, 0.6);
  rim.position.set(-6, -4, -6);
  scene.add(rim);
  // Core glow light
  const coreLight = new THREE.PointLight(0xd4520a, 3.5, 10);
  coreLight.position.set(0, 0, 0);
  scene.add(coreLight);

  // ── Core sphere ──────────────────────────────────────────────────────────
  const coreMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 48, 48),
    new THREE.MeshStandardMaterial({
      color: 0xd4520a,
      emissive: 0xd4520a,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.2,
    })
  );
  scene.add(coreMesh);

  // Core halo (additive glow)
  const haloMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xd4520a,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    })
  );
  scene.add(haloMesh);

  // ── Armillary rings + satellites ─────────────────────────────────────────
  // Three rings, each at a different tilt — armillary sphere style
  const RINGS = [
    { tiltX: 0,   tiltZ: 0,              speed: 0.008,  radius: 3.0, tubeR: 0.022, color: 0x9e9a94, satColor: 0xf5f2ec, satCount: 2 },
    { tiltX: 1.1, tiltZ: 0.4,            speed: -0.005, radius: 3.6, tubeR: 0.018, color: 0x5a5550, satColor: 0xd4520a, satCount: 1 },
    { tiltX: 0.5, tiltZ: -Math.PI / 2.2, speed: 0.006,  radius: 2.6, tubeR: 0.016, color: 0x3a3734, satColor: 0xc8922a, satCount: 3 },
  ];

  const ringGroups = [];

  RINGS.forEach(rd => {
    // Container group holds the tilt; inner group rotates for the orbit
    const outer = new THREE.Group();
    outer.rotation.x = rd.tiltX;
    outer.rotation.z = rd.tiltZ;
    scene.add(outer);

    const inner = new THREE.Group();
    outer.add(inner);

    // Ring torus
    inner.add(new THREE.Mesh(
      new THREE.TorusGeometry(rd.radius, rd.tubeR, 8, 128),
      new THREE.MeshStandardMaterial({
        color: rd.color,
        emissive: rd.color,
        emissiveIntensity: 0.15,
        roughness: 0.6,
        metalness: 0.4,
        transparent: true,
        opacity: 0.75,
      })
    ));

    // Satellites riding this ring
    const sats = [];
    for (let i = 0; i < rd.satCount; i++) {
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.10, 12, 12),
        new THREE.MeshStandardMaterial({
          color: rd.satColor,
          emissive: rd.satColor,
          emissiveIntensity: rd.satColor === 0xd4520a ? 0.7 : 0.35,
          roughness: 0.2,
          metalness: 0.1,
        })
      );
      // Place evenly spaced around ring
      const angle = (i / rd.satCount) * Math.PI * 2;
      sat.position.set(Math.cos(angle) * rd.radius, 0, Math.sin(angle) * rd.radius);
      inner.add(sat);

      // Tiny glow halo on each satellite
      const sHalo = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 8),
        new THREE.MeshBasicMaterial({
          color: rd.satColor,
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
        })
      );
      sHalo.position.copy(sat.position);
      inner.add(sHalo);

      sats.push({ sat, sHalo });
    }

    ringGroups.push({ outer, inner, sats, rd });
  });

  // ── Mouse parallax ────────────────────────────────────────────────────────
  let mx = 0, my = 0;
  const aboutVisual = canvas.closest('.about-visual');
  if (aboutVisual) {
    aboutVisual.addEventListener('mousemove', e => {
      const r = aboutVisual.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      my = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    });
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    const w = canvas.parentElement.clientWidth  || 280;
    const h = canvas.parentElement.clientHeight || 260;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  // ── Animate ───────────────────────────────────────────────────────────────
  let time = 0;
  // Overall scene group for gentle parallax tilt
  const sceneGroup = new THREE.Group();
  ringGroups.forEach(rg => {
    scene.remove(rg.outer);
    sceneGroup.add(rg.outer);
  });
  scene.remove(coreMesh);
  scene.remove(haloMesh);
  sceneGroup.add(coreMesh);
  sceneGroup.add(haloMesh);
  scene.add(sceneGroup);

  function animate() {
    requestAnimationFrame(animate);

    if (!motionOff) {
      time += 0.01;

      // Core pulse
      const pulse = Math.sin(time * 1.6) * 0.5 + 0.5;
      coreMesh.material.emissiveIntensity = 0.45 + pulse * 0.3;
      haloMesh.material.opacity = 0.05 + pulse * 0.08;
      coreLight.intensity = 2.8 + pulse * 1.8;

      // Ring orbits
      ringGroups.forEach(rg => {
        rg.inner.rotation.y += rg.rd.speed;

        // Satellite halos match positions (they're children so auto-follow)
        // Satellite pulse
        rg.sats.forEach(({ sat, sHalo }, si) => {
          const p = Math.sin(time * 2.2 + si * 1.4) * 0.5 + 0.5;
          sat.material.emissiveIntensity = (rg.rd.satColor === 0xd4520a ? 0.5 : 0.2) + p * 0.35;
          sHalo.material.opacity = 0.06 + p * 0.12;
        });
      });

      // Scene tilt — mouse parallax
      sceneGroup.rotation.y  += (mx * 0.25 - sceneGroup.rotation.y)  * 0.04;
      sceneGroup.rotation.x  += (my * -0.18 - sceneGroup.rotation.x) * 0.04;

      // Core slow self-rotation
      coreMesh.rotation.y += 0.004;
      coreMesh.rotation.x += 0.002;
    }

    renderer.render(scene, camera);
  }
  animate();
}

initHeroScene();
initAboutScene();
