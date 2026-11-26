// The cartridge: a 12-gauge shell you can turn; opening it spills its 200 metal pellets.
// A see-through hull shows what is packed inside: powder, the plastic wad, the shot.
import * as THREE from "three";

const stage = document.getElementById("shell-stage");
const canvas = document.getElementById("shell-canvas");
const openBtn = document.getElementById("shell-open");
const countEl = document.getElementById("shell-count");
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const bn = () => document.documentElement.dataset.lang === "bn";

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { document.getElementById("shell-fallback").hidden = false; openBtn.hidden = true; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.set(0, 1.1, 7.2);
  camera.lookAt(0, .2, 0);

  scene.add(new THREE.HemisphereLight(0xfff1e6, 0x1a0b0b, .9));
  const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(3, 5, 4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); scene.add(key);
  const rim = new THREE.PointLight(0xe0262f, 30, 12); rim.position.set(-3, 1.5, -2.5); scene.add(rim);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.MeshStandardMaterial({ color: 0x140c0b, roughness: .9 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; floor.receiveShadow = true; scene.add(floor);

  // the shell, standing up, slightly tilted toward the viewer
  const shell = new THREE.Group(); scene.add(shell);
  shell.rotation.set(.12, .5, 0);
  const R = .38, HULL = 2.3, BASE = .62, Y0 = -1.3;
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: .95, roughness: .28 });
  const head = new THREE.Mesh(new THREE.CylinderGeometry(R + .02, R + .02, BASE, 64), brass);
  head.position.y = Y0 + BASE / 2; head.castShadow = true; shell.add(head);
  const rimMesh = new THREE.Mesh(new THREE.CylinderGeometry(R + .07, R + .07, .07, 64), brass);
  rimMesh.position.y = Y0 + .035; shell.add(rimMesh);
  const primer = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .02, 32), new THREE.MeshStandardMaterial({ color: 0xb8865a, metalness: .9, roughness: .3 }));
  primer.position.y = Y0 - .005; shell.add(primer);
  const hullMat = new THREE.MeshPhysicalMaterial({ color: 0xc2262d, roughness: .35, transmission: .35, transparent: true, opacity: .5, thickness: .2, side: THREE.DoubleSide });
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(R, R, HULL * .55, 64, 1, true), hullMat);
  lower.position.y = Y0 + BASE + HULL * .275 - .1; shell.add(lower);
  const upper = new THREE.Group(); shell.add(upper);
  const upperHull = new THREE.Mesh(new THREE.CylinderGeometry(R, R, HULL * .45, 64, 1, true), hullMat);
  upperHull.position.y = Y0 + BASE + HULL * .55 + HULL * .225 - .1; upper.add(upperHull);
  const crimp = new THREE.Mesh(new THREE.ConeGeometry(R, .22, 6, 1, true), hullMat);
  crimp.position.y = Y0 + BASE + HULL - .1 + .11; upper.add(crimp);
  // inside: powder, the wad, then the shot
  const powder = new THREE.Mesh(new THREE.CylinderGeometry(R * .9, R * .9, .22, 32), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 1 }));
  powder.position.y = Y0 + BASE + .02; shell.add(powder);
  const wad = new THREE.Mesh(new THREE.CylinderGeometry(R * .93, R * .9, .62, 32), new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: .7 }));
  wad.position.y = Y0 + BASE + .45; shell.add(wad);

  const N = 200, PR = .052;
  const pellets = new THREE.InstancedMesh(new THREE.SphereGeometry(PR, 12, 10), new THREE.MeshStandardMaterial({ color: 0x8e8f93, metalness: .9, roughness: .35 }), N);
  pellets.castShadow = true; scene.add(pellets);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1);
  const P = [];  // positions in the shell's frame while packed, then in the world once they spill
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * (R - PR * 1.4);
    P.push({ local: new THREE.Vector3(Math.cos(a) * rr, Y0 + BASE + .8 + (i / N) * (HULL * .78 - .8), Math.sin(a) * rr), pos: new THREE.Vector3(), vel: new THREE.Vector3(), free: false, landed: false });
  }
  let opened = false, landed = 0, openT = 0;

  function place() {
    shell.updateMatrixWorld();
    P.forEach((o, i) => {
      if (!o.free) o.pos.copy(o.local).applyMatrix4(shell.matrixWorld);
      p.copy(o.pos); m.compose(p, q, s); pellets.setMatrixAt(i, m);
    });
    pellets.instanceMatrix.needsUpdate = true;
  }
  function say() {
    countEl.textContent = opened ? (bn() ? `${landed} / ২০০টি ছররা` : `${landed} of 200 pellets`) : "";
  }
  document.addEventListener("ls-lang", say);

  openBtn.addEventListener("click", () => {
    if (opened) return;
    opened = true; openBtn.disabled = true; openT = performance.now();
    shell.updateMatrixWorld();
    P.forEach((o, i) => {
      o.pos.copy(o.local).applyMatrix4(shell.matrixWorld);
      o.free = true;
      const out = new THREE.Vector3(o.local.x, 0, o.local.z).normalize();
      o.vel.set(out.x * (.6 + Math.random() * 1.4), 1.2 + Math.random() * 2.2, out.z * (.6 + Math.random() * 1.4) + .8);
      o.delay = (i / N) * .5;
      if (calm) { o.pos.set((Math.random() * 2 - 1) * 2.4, -1.6 + PR, (Math.random() * 2 - 1) * 1.6); o.landed = true; }
    });
    if (calm) { landed = N; upper.position.y = 1.2; upper.visible = false; say(); }
  });

  // drag to turn
  let dragging = false, lastX = 0, lastY = 0, spin = .25;
  stage.addEventListener("pointerdown", e => { dragging = true; lastX = e.clientX; lastY = e.clientY; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener("pointermove", e => {
    if (!dragging || opened) return;
    shell.rotation.y += (e.clientX - lastX) * .01; shell.rotation.x = Math.max(-.6, Math.min(.9, shell.rotation.x + (e.clientY - lastY) * .006));
    lastX = e.clientX; lastY = e.clientY; spin = 0;
  });
  stage.addEventListener("pointerup", () => { dragging = false; });

  function size() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(stage); size();

  let visible = false, last = performance.now();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(loop); } }).observe(stage);
  function loop(now) {
    if (!visible) return;
    const dt = Math.min(.033, (now - last) / 1000); last = now;
    if (!opened && !dragging && !calm) shell.rotation.y += spin * dt;
    if (opened && !calm) {
      const t = (now - openT) / 1000;
      upper.position.y = Math.min(1.4, t * 2.5); upper.rotation.z = Math.min(.9, t * 1.2); upperHull.material.opacity = Math.max(.15, .5 - t * .2);
      P.forEach(o => {
        if (o.landed || t < o.delay) return;
        o.vel.y -= 9.8 * dt; o.pos.addScaledVector(o.vel, dt);
        if (o.pos.y < -1.6 + PR) {
          o.pos.y = -1.6 + PR; o.vel.y *= -.28; o.vel.x *= .7; o.vel.z *= .7;
          if (Math.abs(o.vel.y) < .25 && o.vel.lengthSq() < .05) { o.landed = true; landed++; say(); }
        }
        if (o.pos.length() > 6) { o.landed = true; landed++; say(); }
      });
    }
    place();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  place(); renderer.render(scene, camera);
}

if (stage) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); start(); } }, { rootMargin: "300px 0px" }).observe(stage);
