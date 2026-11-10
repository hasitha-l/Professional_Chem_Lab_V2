import * as THREE from 'three';
import { Item3DState } from './types3d';

// Shared Materials Cache for High Performance
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.05,
  roughness: 0.1,
  transmission: 0.92,
  transparent: true,
  opacity: 0.75,
  ior: 1.5,
  reflectivity: 0.9,
  side: THREE.DoubleSide,
  depthWrite: false
});

const graduationMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.6
});

const metalMaterial = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  metalness: 0.85,
  roughness: 0.25
});

const darkCastIronMaterial = new THREE.MeshStandardMaterial({
  color: 0x334155,
  metalness: 0.7,
  roughness: 0.45
});

const brassMaterial = new THREE.MeshStandardMaterial({
  color: 0xd97706,
  metalness: 0.7,
  roughness: 0.3
});

const porcelainMaterial = new THREE.MeshStandardMaterial({
  color: 0xf8fafc,
  roughness: 0.15,
  metalness: 0.05
});

const plasticBottleMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf1f5f9,
  roughness: 0.3,
  transmission: 0.7,
  transparent: true,
  opacity: 0.85
});

/**
 * Helper to create a liquid mesh inside glassware
 */
function createLiquidMesh(
  radiusBottom: number,
  radiusTop: number,
  maxHeight: number,
  fraction: number,
  colorHex: string,
  yOffset: number = 0.02,
  isBoiling: boolean = false
): THREE.Group {
  const group = new THREE.Group();
  if (fraction <= 0.01) return group;

  const currentHeight = Math.max(0.04, maxHeight * fraction);
  const currentTopRadius = radiusBottom + (radiusTop - radiusBottom) * fraction;

  // Liquid body cylinder
  const liquidGeo = new THREE.CylinderGeometry(
    currentTopRadius,
    radiusBottom,
    currentHeight,
    24,
    1,
    false
  );
  const liquidMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.82
  });

  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.position.y = yOffset + currentHeight / 2;
  group.add(liquidMesh);

  // Top Meniscus surface disc
  const meniscusGeo = new THREE.CircleGeometry(currentTopRadius, 24);
  const meniscusMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.1,
    transparent: true,
    opacity: 0.95
  });
  const meniscus = new THREE.Mesh(meniscusGeo, meniscusMat);
  meniscus.rotation.x = -Math.PI / 2;
  meniscus.position.y = yOffset + currentHeight;
  group.add(meniscus);

  // Boiling Bubbles & Steam Effect
  if (isBoiling) {
    const steamGroup = new THREE.Group();
    steamGroup.name = 'steam';
    steamGroup.position.set(0, yOffset + currentHeight, 0);

    for (let b = 0; b < 6; b++) {
      const bubbleGeo = new THREE.SphereGeometry(0.03 + Math.random() * 0.02, 8, 8);
      const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      bubble.position.set((Math.random() - 0.5) * currentTopRadius * 1.2, Math.random() * 0.4, (Math.random() - 0.5) * currentTopRadius * 1.2);
      steamGroup.add(bubble);
    }
    group.add(steamGroup);
  }

  return group;
}

/**
 * 250mL Glass Beaker
 */
export function createBeakerMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const radius = 0.45;
  const height = 1.1;

  // Glass Wall Cylinder
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
  const body = new THREE.Mesh(bodyGeo, glassMaterial);
  body.position.y = height / 2;
  body.castShadow = true;
  group.add(body);

  // Bottom Base Glass Disc
  const baseGeo = new THREE.CylinderGeometry(radius, radius, 0.03, 32);
  const base = new THREE.Mesh(baseGeo, glassMaterial);
  base.position.y = 0.015;
  group.add(base);

  // Lip / Rim Torus
  const rimGeo = new THREE.TorusGeometry(radius, 0.02, 16, 32);
  const rim = new THREE.Mesh(rimGeo, glassMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = height;
  group.add(rim);

  // Spout Pouring V-notch
  const spoutGeo = new THREE.ConeGeometry(0.08, 0.12, 4);
  const spout = new THREE.Mesh(spoutGeo, glassMaterial);
  spout.rotation.z = Math.PI / 3;
  spout.position.set(radius + 0.02, height, 0);
  group.add(spout);

  // Volume graduation lines
  for (let i = 1; i <= 4; i++) {
    const lineGeo = new THREE.RingGeometry(radius - 0.01, radius + 0.01, 16, 1, 0, Math.PI / 3);
    const line = new THREE.Mesh(lineGeo, graduationMaterial);
    line.rotation.x = Math.PI / 2;
    line.position.y = 0.2 + (height * 0.7 * (i / 4));
    group.add(line);
  }

  // Liquid if present
  if (item.liquid && item.liquid.volumeMl > 0) {
    const fraction = Math.min(1.0, item.liquid.volumeMl / (item.liquid.maxVolumeMl || 250));
    const isBoiling = item.liquid.temperatureC >= 85 || item.liquid.isBoiling;
    const liquid = createLiquidMesh(radius * 0.94, radius * 0.94, height * 0.9, fraction, item.liquid.color, 0.02, isBoiling);
    group.add(liquid);

    // Magnetic stir bar if active
    if (item.isActive) {
      const stirBarGeo = new THREE.CapsuleGeometry(0.04, 0.2, 8, 16);
      const stirBarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const stirBar = new THREE.Mesh(stirBarGeo, stirBarMat);
      stirBar.rotation.z = Math.PI / 2;
      stirBar.position.y = 0.05;
      stirBar.name = 'stirBar';
      group.add(stirBar);
    }
  }

  return group;
}

/**
 * Conical (Erlenmeyer) Flask
 */
export function createConicalFlaskMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const bottomRadius = 0.65;
  const neckRadius = 0.22;
  const bodyHeight = 1.0;
  const neckHeight = 0.5;

  const bodyGeo = new THREE.CylinderGeometry(neckRadius, bottomRadius, bodyHeight, 32, 1, true);
  const body = new THREE.Mesh(bodyGeo, glassMaterial);
  body.position.y = bodyHeight / 2;
  group.add(body);

  const baseGeo = new THREE.CylinderGeometry(bottomRadius, bottomRadius, 0.03, 32);
  const base = new THREE.Mesh(baseGeo, glassMaterial);
  base.position.y = 0.015;
  group.add(base);

  const neckGeo = new THREE.CylinderGeometry(neckRadius, neckRadius, neckHeight, 32, 1, true);
  const neck = new THREE.Mesh(neckGeo, glassMaterial);
  neck.position.y = bodyHeight + neckHeight / 2;
  group.add(neck);

  const rimGeo = new THREE.TorusGeometry(neckRadius, 0.025, 16, 32);
  const rim = new THREE.Mesh(rimGeo, glassMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = bodyHeight + neckHeight;
  group.add(rim);

  if (item.liquid && item.liquid.volumeMl > 0) {
    const fraction = Math.min(1.0, item.liquid.volumeMl / (item.liquid.maxVolumeMl || 250));
    const isBoiling = item.liquid.temperatureC >= 85 || item.liquid.isBoiling;
    const liquid = createLiquidMesh(bottomRadius * 0.94, neckRadius * 0.95, bodyHeight * 0.85, fraction, item.liquid.color, 0.02, isBoiling);
    group.add(liquid);
  }

  return group;
}

/**
 * Borosilicate Test Tube
 */
export function createTestTubeMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const radius = 0.16;
  const tubeHeight = 1.3;

  const bodyGeo = new THREE.CylinderGeometry(radius, radius, tubeHeight, 24, 1, true);
  const body = new THREE.Mesh(bodyGeo, glassMaterial);
  body.position.y = tubeHeight / 2 + radius;
  group.add(body);

  const bottomGeo = new THREE.SphereGeometry(radius, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const bottom = new THREE.Mesh(bottomGeo, glassMaterial);
  bottom.position.y = radius;
  group.add(bottom);

  const rimGeo = new THREE.TorusGeometry(radius, 0.02, 16, 24);
  const rim = new THREE.Mesh(rimGeo, glassMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = tubeHeight + radius;
  group.add(rim);

  // If not placed in a rack, provide a small stability foot
  if (!item.snappedToId) {
    const standGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.15, 16);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = 0.075;
    group.add(stand);
  }

  if (item.liquid && item.liquid.volumeMl > 0) {
    const fraction = Math.min(1.0, item.liquid.volumeMl / (item.liquid.maxVolumeMl || 30));
    const liquid = createLiquidMesh(radius * 0.9, radius * 0.9, tubeHeight * 0.85, fraction, item.liquid.color, radius);
    group.add(liquid);
  }

  return group;
}

/**
 * Graduated Measuring Cylinder
 */
export function createMeasuringCylinderMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const radius = 0.25;
  const height = 1.8;

  const baseGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.08, 6);
  const base = new THREE.Mesh(baseGeo, glassMaterial);
  base.position.y = 0.04;
  group.add(base);

  const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
  const body = new THREE.Mesh(bodyGeo, glassMaterial);
  body.position.y = 0.08 + height / 2;
  group.add(body);

  const rimGeo = new THREE.TorusGeometry(radius, 0.025, 16, 32);
  const rim = new THREE.Mesh(rimGeo, glassMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.08 + height;
  group.add(rim);

  for (let i = 1; i <= 8; i++) {
    const lineGeo = new THREE.RingGeometry(radius - 0.01, radius + 0.01, 16, 1, 0, Math.PI / 2);
    const line = new THREE.Mesh(lineGeo, graduationMaterial);
    line.rotation.x = Math.PI / 2;
    line.position.y = 0.15 + (height * 0.85 * (i / 8));
    group.add(line);
  }

  if (item.liquid && item.liquid.volumeMl > 0) {
    const fraction = Math.min(1.0, item.liquid.volumeMl / (item.liquid.maxVolumeMl || 100));
    const liquid = createLiquidMesh(radius * 0.92, radius * 0.92, height * 0.9, fraction, item.liquid.color, 0.08);
    group.add(liquid);
  }

  return group;
}

/**
 * Tripod Stand for Heating Apparatus
 * Top ring sits at Y = 1.35 with 3 legs angled outwards
 */
export function createTripodStandMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const ringRadius = 0.65;
  const ringThickness = 0.08;
  const standHeight = 1.35;

  // Top circular cast iron ring
  const ringGeo = new THREE.TorusGeometry(ringRadius, ringThickness / 2, 16, 32);
  const ring = new THREE.Mesh(ringGeo, darkCastIronMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = standHeight;
  ring.castShadow = true;
  group.add(ring);

  // 3 steel legs angled outward
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3;
    const legLength = Math.sqrt(standHeight * standHeight + 0.25 * 0.25);
    const legGeo = new THREE.CylinderGeometry(0.045, 0.045, legLength, 16);
    const leg = new THREE.Mesh(legGeo, metalMaterial);

    const legRadiusTop = ringRadius * 0.95;
    const legRadiusBottom = ringRadius * 1.35;

    const startX = Math.cos(angle) * legRadiusTop;
    const startZ = Math.sin(angle) * legRadiusTop;
    const endX = Math.cos(angle) * legRadiusBottom;
    const endZ = Math.sin(angle) * legRadiusBottom;

    leg.position.set((startX + endX) / 2, standHeight / 2, (startZ + endZ) / 2);

    // Orient leg
    const dir = new THREE.Vector3(endX - startX, -standHeight, endZ - startZ).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    leg.quaternion.setFromUnitVectors(up, dir.negate());

    leg.castShadow = true;
    group.add(leg);

    // Rubber / foot pad
    const footGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.04, 12);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const foot = new THREE.Mesh(footGeo, footMat);
    foot.position.set(endX, 0.02, endZ);
    group.add(foot);
  }

  return group;
}

/**
 * Wire Gauze with Ceramic Center
 * Can be positioned on top of Tripod Stand or on the bench
 */
export function createWireGauzeMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const size = 1.3;
  const thickness = 0.025;

  // Outer wire mesh frame
  const frameGeo = new THREE.BoxGeometry(size, thickness, size);
  const wireMeshMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.85,
    roughness: 0.4,
    wireframe: false
  });
  const meshFrame = new THREE.Mesh(frameGeo, wireMeshMat);
  meshFrame.position.y = thickness / 2;
  meshFrame.castShadow = true;
  group.add(meshFrame);

  // Folded safety sheet metal edges
  const edgeT = 0.03;
  for (let side = 0; side < 4; side++) {
    const isX = side % 2 === 0;
    const edgeGeo = new THREE.BoxGeometry(isX ? size : edgeT, edgeT, isX ? edgeT : size);
    const edge = new THREE.Mesh(edgeGeo, metalMaterial);
    const offset = (size / 2) * (side < 2 ? 1 : -1);
    if (isX) edge.position.set(0, thickness / 2, offset);
    else edge.position.set(offset, thickness / 2, 0);
    group.add(edge);
  }

  // Circular Ceramic Heat-Diffusing Center Pad
  const ceramicRadius = 0.42;
  const ceramicGeo = new THREE.CylinderGeometry(ceramicRadius, ceramicRadius, 0.035, 32);

  // If heated by burner underneath, glows hot orange-red!
  const isGlowing = item.isGauzeGlowing || item.isActive;
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: isGlowing ? 0xf97316 : 0xf8fafc,
    roughness: 0.7,
    emissive: isGlowing ? new THREE.Color(0xef4444) : new THREE.Color(0x000000),
    emissiveIntensity: isGlowing ? 0.85 : 0.0
  });

  const ceramicPad = new THREE.Mesh(ceramicGeo, ceramicMat);
  ceramicPad.position.y = thickness / 2 + 0.005;
  group.add(ceramicPad);

  if (isGlowing) {
    const heatGlow = new THREE.PointLight(0xf97316, 1.8, 2.5);
    heatGlow.position.set(0, 0.2, 0);
    group.add(heatGlow);
  }

  return group;
}

/**
 * Porcelain Evaporating Dish
 */
export function createEvaporatingDishMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const radius = 0.55;
  const height = 0.35;

  const dishGeo = new THREE.CylinderGeometry(radius, radius * 0.5, height, 32, 1, false);
  const dish = new THREE.Mesh(dishGeo, porcelainMaterial);
  dish.position.y = height / 2;
  dish.castShadow = true;
  group.add(dish);

  // Lip spout
  const spoutGeo = new THREE.ConeGeometry(0.06, 0.1, 4);
  const spout = new THREE.Mesh(spoutGeo, porcelainMaterial);
  spout.rotation.z = Math.PI / 3;
  spout.position.set(radius + 0.02, height, 0);
  group.add(spout);

  if (item.liquid && item.liquid.volumeMl > 0) {
    const fraction = Math.min(1.0, item.liquid.volumeMl / (item.liquid.maxVolumeMl || 100));
    const isBoiling = item.liquid.temperatureC >= 85 || item.liquid.isBoiling;
    const liquid = createLiquidMesh(radius * 0.48, radius * 0.9, height * 0.85, fraction, item.liquid.color, 0.02, isBoiling);
    group.add(liquid);
  }

  return group;
}

/**
 * Glass Stirring Rod
 */
export function createStirringRodMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const rodRadius = 0.035;
  const rodLength = 1.2;

  const rodGeo = new THREE.CapsuleGeometry(rodRadius, rodLength, 8, 16);
  const rod = new THREE.Mesh(rodGeo, glassMaterial);
  rod.position.y = rodLength / 2;
  rod.rotation.z = 0.2; // slightly tilted for natural grab
  group.add(rod);

  return group;
}

/**
 * Squeeze Wash Bottle with Curved Swan-Neck Spout
 */
export function createWashBottleMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const radius = 0.38;
  const height = 1.1;

  // Translucent LDPE Bottle Body
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 24);
  const body = new THREE.Mesh(bodyGeo, plasticBottleMaterial);
  body.position.y = height / 2;
  body.castShadow = true;
  group.add(body);

  // Screw Cap
  const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.18, 24);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = height + 0.09;
  group.add(cap);

  // Curved delivery tube
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, height + 0.18, 0),
    new THREE.Vector3(0, height + 0.45, 0),
    new THREE.Vector3(0.2, height + 0.55, 0),
    new THREE.Vector3(0.45, height + 0.42, 0)
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.035, 8, false);
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  group.add(tube);

  return group;
}

/**
 * Borosilicate Watch Glass
 */
export function createWatchGlassMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const radius = 0.45;
  const glassGeo = new THREE.SphereGeometry(radius * 1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 6);
  const glass = new THREE.Mesh(glassGeo, glassMaterial);
  glass.rotation.x = Math.PI;
  glass.position.y = 0.06;
  group.add(glass);

  return group;
}

/**
 * 6-Hole Wooden / Acrylic Test Tube Rack
 */
export function createTestTubeRackMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const rackLength = 2.4;
  const rackWidth = 0.8;
  const rackHeight = 0.9;
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });

  // Top shelf with 6 holes
  const topShelfGeo = new THREE.BoxGeometry(rackLength, 0.06, rackWidth);
  const topShelf = new THREE.Mesh(topShelfGeo, woodMat);
  topShelf.position.y = rackHeight;
  group.add(topShelf);

  // Bottom shelf
  const bottomShelfGeo = new THREE.BoxGeometry(rackLength, 0.06, rackWidth);
  const bottomShelf = new THREE.Mesh(bottomShelfGeo, woodMat);
  bottomShelf.position.y = 0.15;
  group.add(bottomShelf);

  // End supports
  for (const endX of [-rackLength / 2 + 0.05, rackLength / 2 - 0.05]) {
    const supportGeo = new THREE.BoxGeometry(0.08, rackHeight, rackWidth);
    const support = new THREE.Mesh(supportGeo, woodMat);
    support.position.set(endX, rackHeight / 2, 0);
    group.add(support);
  }

  // 6 drying pins on back edge
  for (let p = 0; p < 6; p++) {
    const pinGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8);
    const pin = new THREE.Mesh(pinGeo, woodMat);
    const px = -rackLength / 2 + 0.35 + p * 0.35;
    pin.position.set(px, rackHeight + 0.22, -rackWidth / 2 + 0.1);
    group.add(pin);
  }

  return group;
}

/**
 * Burette Stand with Clamp & Graduated Burette
 */
export function createBuretteStandMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const baseGeo = new THREE.BoxGeometry(1.6, 0.12, 1.0);
  const base = new THREE.Mesh(baseGeo, darkCastIronMaterial);
  base.position.set(0, 0.06, 0);
  base.castShadow = true;
  group.add(base);

  const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 16);
  const rod = new THREE.Mesh(rodGeo, metalMaterial);
  rod.position.set(-0.5, 1.6, 0);
  rod.castShadow = true;
  group.add(rod);

  for (const clampY of [1.6, 2.4]) {
    const armGeo = new THREE.BoxGeometry(0.6, 0.06, 0.06);
    const arm = new THREE.Mesh(armGeo, darkCastIronMaterial);
    arm.position.set(-0.2, clampY, 0);
    group.add(arm);

    const clampGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    const clamp = new THREE.Mesh(clampGeo, darkCastIronMaterial);
    clamp.position.set(0.1, clampY, 0);
    group.add(clamp);
  }

  const buretteRadius = 0.08;
  const buretteHeight = 2.2;
  const buretteY = 1.8;

  const tubeGeo = new THREE.CylinderGeometry(buretteRadius, buretteRadius, buretteHeight, 16, 1, true);
  const tube = new THREE.Mesh(tubeGeo, glassMaterial);
  tube.position.set(0.1, buretteY, 0);
  group.add(tube);

  const stopcockGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12);
  const stopcockMat = new THREE.MeshStandardMaterial({
    color: item.isActive ? 0x10b981 : 0xef4444,
    roughness: 0.3
  });
  const stopcock = new THREE.Mesh(stopcockGeo, stopcockMat);
  stopcock.rotation.z = Math.PI / 2;
  stopcock.position.set(0.1, buretteY - buretteHeight / 2 - 0.06, 0);
  group.add(stopcock);

  const tipGeo = new THREE.ConeGeometry(0.04, 0.15, 12);
  const tip = new THREE.Mesh(tipGeo, glassMaterial);
  tip.rotation.x = Math.PI;
  tip.position.set(0.1, buretteY - buretteHeight / 2 - 0.15, 0);
  group.add(tip);

  if (item.liquid && item.liquid.volumeMl > 0) {
    const fraction = Math.min(1.0, item.liquid.volumeMl / (item.liquid.maxVolumeMl || 50));
    const liquidHeight = buretteHeight * fraction;
    const liquidGeo = new THREE.CylinderGeometry(buretteRadius * 0.85, buretteRadius * 0.85, liquidHeight, 16);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(item.liquid.color),
      roughness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.set(0.1, buretteY - (buretteHeight / 2) + (liquidHeight / 2), 0);
    group.add(liquid);
  }

  return group;
}

/**
 * Bunsen Burner with 3D Animated Flame
 */
export function createBunsenBurnerMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const baseGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.12, 6);
  const base = new THREE.Mesh(baseGeo, darkCastIronMaterial);
  base.position.y = 0.06;
  base.castShadow = true;
  group.add(base);

  const inletGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12);
  const inlet = new THREE.Mesh(inletGeo, brassMaterial);
  inlet.rotation.z = Math.PI / 2;
  inlet.position.set(-0.35, 0.15, 0);
  group.add(inlet);

  const collarGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.2, 16);
  const collar = new THREE.Mesh(collarGeo, brassMaterial);
  collar.position.y = 0.22;
  group.add(collar);

  const barrelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 16);
  const barrel = new THREE.Mesh(barrelGeo, metalMaterial);
  barrel.position.y = 0.75;
  barrel.castShadow = true;
  group.add(barrel);

  if (item.isActive) {
    const flameGroup = new THREE.Group();
    flameGroup.name = 'flame';
    flameGroup.position.set(0, 1.2, 0);

    const outerGeo = new THREE.ConeGeometry(0.18, 0.85, 16);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75
    });
    const outerFlame = new THREE.Mesh(outerGeo, outerMat);
    outerFlame.position.y = 0.425;
    flameGroup.add(outerFlame);

    const innerGeo = new THREE.ConeGeometry(0.09, 0.48, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.95
    });
    const innerFlame = new THREE.Mesh(innerGeo, innerMat);
    innerFlame.position.y = 0.24;
    flameGroup.add(innerFlame);

    const flameLight = new THREE.PointLight(0x38bdf8, 2.5, 4.0);
    flameLight.position.set(0, 0.4, 0);
    flameGroup.add(flameLight);

    group.add(flameGroup);
  }

  return group;
}

/**
 * Magnetic Heated Stirrer
 */
export function createMagneticStirrerMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const bodyGeo = new THREE.BoxGeometry(1.4, 0.35, 1.4);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.175;
  body.castShadow = true;
  group.add(body);

  const plateGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.05, 32);
  const plateMat = new THREE.MeshStandardMaterial({
    color: item.isActive ? 0xfecdd3 : 0xffffff,
    roughness: 0.15
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = 0.375;
  group.add(plate);

  for (const knobX of [-0.35, 0.35]) {
    const knobGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16);
    const knob = new THREE.Mesh(knobGeo, metalMaterial);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(knobX, 0.18, 0.72);
    group.add(knob);
  }

  return group;
}

/**
 * Digital pH / Temp Immersion Probe
 */
export function createProbeMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const bodyGeo = new THREE.BoxGeometry(0.4, 0.8, 0.18);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 1.2, 0);
  group.add(body);

  const lcdGeo = new THREE.PlaneGeometry(0.3, 0.25);
  const lcdMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const lcd = new THREE.Mesh(lcdGeo, lcdMat);
  lcd.position.set(0, 1.35, 0.095);
  group.add(lcd);

  const probeGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 16);
  const probe = new THREE.Mesh(probeGeo, metalMaterial);
  probe.position.set(0, 0.55, 0.3);
  group.add(probe);

  const tipGeo = new THREE.SphereGeometry(0.045, 16, 16);
  const tipMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.set(0, 0.02, 0.3);
  group.add(tip);

  return group;
}

/**
 * Reagent Chemical Bottle
 */
export function createReagentBottleMesh(item: Item3DState): THREE.Group {
  const group = new THREE.Group();
  group.name = item.id;

  const radius = 0.36;
  const height = 0.95;

  const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
  const bottleMat = new THREE.MeshPhysicalMaterial({
    color: 0x78350f,
    roughness: 0.2,
    metalness: 0.1,
    transmission: 0.65,
    transparent: true,
    opacity: 0.85
  });
  const body = new THREE.Mesh(bodyGeo, bottleMat);
  body.position.y = height / 2;
  body.castShadow = true;
  group.add(body);

  const neckGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.25, 24);
  const neck = new THREE.Mesh(neckGeo, bottleMat);
  neck.position.y = height + 0.125;
  group.add(neck);

  const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 24);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = height + 0.3;
  group.add(cap);

  const labelGeo = new THREE.CylinderGeometry(radius + 0.005, radius + 0.005, 0.55, 32, 1, true, 0, Math.PI);
  const labelMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.rotation.y = -Math.PI / 2;
  label.position.y = height / 2;
  group.add(label);

  return group;
}

/**
 * Master Factory to spawn 3D equipment
 */
export function createEquipment3D(item: Item3DState): THREE.Group {
  let mesh: THREE.Group;

  switch (item.type) {
    case 'beaker':
      mesh = createBeakerMesh(item);
      break;
    case 'flask':
      mesh = createConicalFlaskMesh(item);
      break;
    case 'test_tube':
      mesh = createTestTubeMesh(item);
      break;
    case 'cylinder':
      mesh = createMeasuringCylinderMesh(item);
      break;
    case 'tripod_stand':
      mesh = createTripodStandMesh(item);
      break;
    case 'wire_gauze':
      mesh = createWireGauzeMesh(item);
      break;
    case 'evaporating_dish':
      mesh = createEvaporatingDishMesh(item);
      break;
    case 'stirring_rod':
      mesh = createStirringRodMesh(item);
      break;
    case 'wash_bottle':
      mesh = createWashBottleMesh(item);
      break;
    case 'watch_glass':
      mesh = createWatchGlassMesh(item);
      break;
    case 'test_tube_rack':
      mesh = createTestTubeRackMesh(item);
      break;
    case 'burette_stand':
      mesh = createBuretteStandMesh(item);
      break;
    case 'bunsen_burner':
      mesh = createBunsenBurnerMesh(item);
      break;
    case 'magnetic_stirrer':
      mesh = createMagneticStirrerMesh(item);
      break;
    case 'ph_probe':
      mesh = createProbeMesh(item);
      break;
    case 'reagent_bottle':
      mesh = createReagentBottleMesh(item);
      break;
    default:
      mesh = createBeakerMesh(item);
  }

  mesh.position.set(...item.position);
  mesh.rotation.set(...item.rotation);
  mesh.scale.set(...item.scale);
  mesh.userData = { id: item.id, itemState: item };

  return mesh;
}
