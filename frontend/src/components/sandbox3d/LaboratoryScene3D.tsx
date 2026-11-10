import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Item3DState } from './types3d';
import { createEquipment3D } from './models3d';
import { Camera, RotateCcw, Move, RotateCw, Sparkles, ZoomIn, Eye, Layers, Flame } from 'lucide-react';

interface Props {
  items: Item3DState[];
  selectedId: string | null;
  onSelectItem: (id: string | null) => void;
  onMoveItem: (id: string, newPos: [number, number, number], newRot?: [number, number, number]) => void;
  onLiquidHeatUpdate?: (vesselId: string, tempChange: number) => void;
  onTriggerPour?: (sourceId: string, targetId: string, amountMl: number) => void;
  transformMode: 'translate' | 'rotate';
  setTransformMode: (mode: 'translate' | 'rotate') => void;
  enableSnapping: boolean;
  setEnableSnapping: (snap: boolean) => void;
}

export const LaboratoryScene3D: React.FC<Props> = ({
  items,
  selectedId,
  onSelectItem,
  onMoveItem,
  onLiquidHeatUpdate,
  onTriggerPour,
  transformMode,
  setTransformMode,
  enableSnapping,
  setEnableSnapping
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const selectionRingRef = useRef<THREE.Mesh | null>(null);

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const isTransformingRef = useRef<boolean>(false);
  const lastPourCheckRef = useRef<number>(0);

  // Initialize Three.js Scene, Camera, Renderers & Controls
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d); // Deep laboratory dusk ambiance
    sceneRef.current = scene;

    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 6.2);
    cameraRef.current = camera;

    // WebGL Renderer with High-Fidelity Tone Mapping & PCF Shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.03; // Restrict camera from dipping below table
    orbitControls.minDistance = 1.5;
    orbitControls.maxDistance = 14.0;
    orbitControls.target.set(0, 0.6, 0);
    orbitControlsRef.current = orbitControls;

    // Transform Controls (3D Gizmo for Translation and Rotation)
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.75;
    transformControls.space = 'world';

    transformControls.addEventListener('dragging-changed', (event) => {
      const isDragging = Boolean((event as { value?: unknown }).value);
      orbitControls.enabled = !isDragging;
      isTransformingRef.current = isDragging;
    });

    scene.add(transformControls.getHelper());
    transformControlsRef.current = transformControls;

    // Studio Laboratory Lighting Setup
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.95);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainKeyLight.position.set(5, 10, 6);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    mainKeyLight.shadow.camera.near = 0.5;
    mainKeyLight.shadow.camera.far = 25;
    mainKeyLight.shadow.bias = -0.0005;
    scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-6, 8, -4);
    scene.add(rimLight);

    // Realistic Laboratory Workbench (Polished Black Epoxy Resin Laboratory Benchtop)
    const benchGeo = new THREE.BoxGeometry(10.5, 0.4, 5.2);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.15,
      roughness: 0.28
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.2, 0);
    bench.receiveShadow = true;
    scene.add(bench);

    // Workbench Bevel Edge Strip
    const bevelGeo = new THREE.BoxGeometry(10.6, 0.04, 5.3);
    const bevelMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.8, roughness: 0.3 });
    const bevel = new THREE.Mesh(bevelGeo, bevelMat);
    bevel.position.set(0, -0.02, 0);
    scene.add(bevel);

    // Grid Alignment Guide on Workbench
    const gridHelper = new THREE.GridHelper(10.0, 20, 0x374151, 0x1f2937);
    gridHelper.position.set(0, 0.003, 0);
    scene.add(gridHelper);

    // Selection Ring (Luminous cyan ring under active item)
    const ringGeo = new THREE.RingGeometry(0.55, 0.68, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.set(0, 0.012, 0);
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionRingRef.current = selectionRing;

    // Objects group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // Main Animation Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Flame flickering & stir bar spin & boiling steam animation
      objectsGroup.traverse((child) => {
        if (child.name === 'flame') {
          const scaleY = 0.95 + Math.sin(elapsed * 20) * 0.1 + Math.cos(elapsed * 28) * 0.05;
          child.scale.set(1, scaleY, 1);
        }
        if (child.name === 'stirBar') {
          child.rotation.y = elapsed * 28;
        }
        if (child.name === 'steam') {
          child.children.forEach((bubble, bIdx) => {
            bubble.position.y = ((elapsed * 0.5 + bIdx * 0.15) % 0.5);
            bubble.scale.setScalar(0.7 + Math.sin(elapsed * 8 + bIdx) * 0.3);
          });
        }
      });

      orbitControls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      transformControls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync TransformControls Mode
  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(transformMode);
    }
  }, [transformMode]);

  // Sync 3D Meshes & Attached TransformControls Target
  useEffect(() => {
    if (!objectsGroupRef.current || !sceneRef.current) return;
    const group = objectsGroupRef.current;

    // Remove old meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    // Build fresh 3D procedural models
    let selectedMesh: THREE.Object3D | null = null;

    items.forEach((item) => {
      const mesh = createEquipment3D(item);
      group.add(mesh);

      if (item.id === selectedId) {
        selectedMesh = mesh;
      }
    });

    // Attach TransformControls to selected mesh
    if (transformControlsRef.current) {
      if (selectedMesh) {
        transformControlsRef.current.attach(selectedMesh);
        transformControlsRef.current.enabled = true;
        transformControlsRef.current.getHelper().visible = true;
      } else {
        transformControlsRef.current.detach();
        transformControlsRef.current.enabled = false;
        transformControlsRef.current.getHelper().visible = false;
      }
    }

    // Update selection ring
    if (selectionRingRef.current) {
      const selectedItem = items.find((i) => i.id === selectedId);
      if (selectedItem) {
        selectionRingRef.current.position.set(selectedItem.position[0], 0.015, selectedItem.position[2]);
        selectionRingRef.current.visible = true;
      } else {
        selectionRingRef.current.visible = false;
      }
    }
  }, [items, selectedId]);

  // Intelligent Snapping & Stacking Calculation
  const applyIntelligentSnapping = useCallback(
    (movedId: string, rawPos: [number, number, number]): [number, number, number] => {
      if (!enableSnapping) return rawPos;

      const movedItem = items.find((i) => i.id === movedId);
      if (!movedItem) return rawPos;

      let [x, y, z] = rawPos;

      // 1. Stacking: Wire Gauze onto Tripod Stand
      if (movedItem.type === 'wire_gauze') {
        const nearbyTripod = items.find(
          (i) => i.type === 'tripod_stand' && Math.hypot(i.position[0] - x, i.position[2] - z) < 0.65
        );
        if (nearbyTripod) {
          return [nearbyTripod.position[0], 1.35, nearbyTripod.position[2]];
        }
      }

      // 2. Stacking: Beaker / Flask / Evaporating Dish onto Wire Gauze or Magnetic Stirrer
      if (movedItem.type === 'beaker' || movedItem.type === 'flask' || movedItem.type === 'evaporating_dish') {
        // Check Wire Gauze
        const nearbyGauze = items.find(
          (i) => i.type === 'wire_gauze' && Math.hypot(i.position[0] - x, i.position[2] - z) < 0.55
        );
        if (nearbyGauze) {
          return [nearbyGauze.position[0], nearbyGauze.position[1] + 0.035, nearbyGauze.position[2]];
        }

        // Check Stirrer
        const nearbyStirrer = items.find(
          (i) => i.type === 'magnetic_stirrer' && Math.hypot(i.position[0] - x, i.position[2] - z) < 0.55
        );
        if (nearbyStirrer) {
          return [nearbyStirrer.position[0], nearbyStirrer.position[1] + 0.38, nearbyStirrer.position[2]];
        }
      }

      // 3. Stacking: Bunsen Burner sliding underneath Tripod Stand
      if (movedItem.type === 'bunsen_burner') {
        const nearbyTripod = items.find(
          (i) => i.type === 'tripod_stand' && Math.hypot(i.position[0] - x, i.position[2] - z) < 0.65
        );
        if (nearbyTripod) {
          return [nearbyTripod.position[0], 0, nearbyTripod.position[2]];
        }
      }

      // 4. Default: ensure object doesn't sink into table bench
      y = Math.max(0, y);
      return [x, y, z];
    },
    [items, enableSnapping]
  );

  // Hook into TransformControls change event to push updates to React state
  useEffect(() => {
    const transformControls = transformControlsRef.current;
    if (!transformControls) return;

    const handleObjectChange = () => {
      if (!selectedId || !transformControls.object) return;
      const obj = transformControls.object;

      const rawPos: [number, number, number] = [
        Number(obj.position.x.toFixed(3)),
        Number(obj.position.y.toFixed(3)),
        Number(obj.position.z.toFixed(3))
      ];

      const snappedPos = applyIntelligentSnapping(selectedId, rawPos);
      obj.position.set(...snappedPos);

      const rot: [number, number, number] = [
        Number(obj.rotation.x.toFixed(3)),
        Number(obj.rotation.y.toFixed(3)),
        Number(obj.rotation.z.toFixed(3))
      ];

      onMoveItem(selectedId, snappedPos, rot);

      // Check Tilt / Pouring: If vessel is tilted > 40 degrees (~0.7 rad)
      const tiltMagnitude = Math.hypot(rot[0], rot[2]);
      if (tiltMagnitude > 0.7 && onTriggerPour) {
        const now = Date.now();
        if (now - lastPourCheckRef.current > 600) {
          lastPourCheckRef.current = now;
          // Find vessel positioned below or directly adjacent to this tilted vessel
          const target = items.find(
            (i) =>
              i.id !== selectedId &&
              (i.type === 'beaker' || i.type === 'flask' || i.type === 'test_tube' || i.type === 'evaporating_dish') &&
              Math.hypot(i.position[0] - snappedPos[0], i.position[2] - snappedPos[2]) < 0.9 &&
              i.position[1] <= snappedPos[1] + 0.4
          );
          if (target) {
            onTriggerPour(selectedId, target.id, 15);
          }
        }
      }
    };

    transformControls.addEventListener('objectChange', handleObjectChange);

    return () => {
      transformControls.removeEventListener('objectChange', handleObjectChange);
    };
  }, [selectedId, applyIntelligentSnapping, onMoveItem, onTriggerPour, items]);

  // Raycasting Click to Select
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isTransformingRef.current) return;
    if (!containerRef.current || !cameraRef.current || !objectsGroupRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(objectsGroupRef.current.children, true);

    if (intersects.length > 0) {
      let current: THREE.Object3D | null = intersects[0].object;
      while (current && current.parent && current.parent !== objectsGroupRef.current) {
        current = current.parent;
      }
      if (current && current.name) {
        onSelectItem(current.name);
      }
    } else {
      // Clicked on empty space
      if (!isTransformingRef.current) {
        onSelectItem(null);
      }
    }
  };

  // Camera Presets
  const handleResetCamera = () => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    cameraRef.current.position.set(0, 3.8, 6.2);
    orbitControlsRef.current.target.set(0, 0.6, 0);
    orbitControlsRef.current.update();
  };

  const handleTopDownCamera = () => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    cameraRef.current.position.set(0, 7.5, 0.1);
    orbitControlsRef.current.target.set(0, 0, 0);
    orbitControlsRef.current.update();
  };

  const handleFocusSelected = () => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    const sel = items.find((i) => i.id === selectedId);
    if (sel) {
      orbitControlsRef.current.target.set(sel.position[0], sel.position[1] + 0.5, sel.position[2]);
      cameraRef.current.position.set(sel.position[0], sel.position[1] + 1.8, sel.position[2] + 2.5);
    } else {
      cameraRef.current.position.set(0, 2.0, 3.8);
      orbitControlsRef.current.target.set(0, 0.5, 0);
    }
    orbitControlsRef.current.update();
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: 3D Transform Mode Switcher & Snapping Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTransformMode('translate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              transformMode === 'translate' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            title="Translate Gizmo: Move along X, Y, Z axes"
          >
            <Move size={14} />
            <span>Move</span>
          </button>
          <button
            onClick={() => setTransformMode('rotate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              transformMode === 'rotate' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            title="Rotate Gizmo: Rotate or tilt for natural pouring"
          >
            <RotateCw size={14} />
            <span>Rotate / Tilt</span>
          </button>
        </div>

        <div className="h-5 w-px bg-slate-800"></div>

        {/* Magnetic Surface Snapping Toggle */}
        <button
          onClick={() => setEnableSnapping(!enableSnapping)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            enableSnapping
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Auto-snap wire gauze to tripod, and beakers onto wire gauze or magnetic stirrer"
        >
          <Layers size={14} className={enableSnapping ? 'text-emerald-400' : 'text-slate-500'} />
          <span>Magnetic Stacking: {enableSnapping ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Top Right: Camera Navigation Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-2xl">
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Default Isometric Laboratory Perspective"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={handleTopDownCamera}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Overhead Plan View"
        >
          <Camera size={16} />
        </button>
        <button
          onClick={handleFocusSelected}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom & Focus Selected Equipment"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* Bottom Floating Guidance Pill */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-900/85 backdrop-blur px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 shadow-lg">
        <Eye size={14} className="text-blue-400" />
        <span>Click item to select • Use 3D arrows to elevate & position • Stack gauze on tripod & beaker on gauze</span>
      </div>
    </div>
  );
};
