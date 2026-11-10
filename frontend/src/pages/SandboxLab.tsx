import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FlaskConical,
  Flame,
  Thermometer,
  TestTube2,
  Droplet,
  Trash2,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Atom,
  CheckCircle2,
  Sliders,
  Maximize2,
  Move,
  RotateCw,
  Layers,
  HelpCircle,
  Eye
} from 'lucide-react';
import { Item3DState, EquipmentType, DetectedReaction3D, LiquidState } from '../components/sandbox3d/types3d';
import { REAGENTS_CATALOG, mixLiquids } from '../components/sandbox3d/chemEngine';
import { LaboratoryScene3D } from '../components/sandbox3d/LaboratoryScene3D';
import { ReactionDisplay } from '../components/common/ReactionDisplay';

export default function SandboxLab() {
  const navigate = useNavigate();

  // 3D Transform & Stacking settings
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate');
  const [enableSnapping, setEnableSnapping] = useState<boolean>(true);

  // Initial 3D Items on Bench (Ready-to-use Heating Setup: Tripod + Wire Gauze + Beaker + Burner)
  const [items, setItems] = useState<Item3DState[]>([
    {
      id: 'tripod-1',
      type: 'tripod_stand',
      name: 'Iron Tripod Stand',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      supportHeight: 1.35
    },
    {
      id: 'gauze-1',
      type: 'wire_gauze',
      name: 'Wire Gauze (Ceramic Center)',
      position: [0, 1.35, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      snappedToId: 'tripod-1',
      supportHeight: 1.385,
      isGauzeGlowing: false
    },
    {
      id: 'beaker-heat',
      type: 'beaker',
      name: '250mL Pyrex Beaker',
      position: [0, 1.385, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      snappedToId: 'gauze-1',
      liquid: {
        volumeMl: 120,
        maxVolumeMl: 250,
        color: '#e0f2fe',
        ph: 7.0,
        temperatureC: 22.0,
        species: { 'Water': 0.12 }
      }
    },
    {
      id: 'burner-1',
      type: 'bunsen_burner',
      name: 'Bunsen Burner',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isActive: false
    },
    {
      id: 'probe-1',
      type: 'ph_probe',
      name: 'Digital Temp / pH Probe',
      position: [1.8, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }
  ]);

  const [selectedId, setSelectedId] = useState<string | null>('beaker-heat');
  const [activeCategory, setActiveCategory] = useState<'glassware' | 'equipment' | 'chemicals'>('equipment');
  const [detectedReactions, setDetectedReactions] = useState<DetectedReaction3D[]>([]);
  const [activeReactionForDisplay, setActiveReactionForDisplay] = useState<DetectedReaction3D | null>(null);

  const selectedItem = items.find((i) => i.id === selectedId);

  // Background Thermal Conduction Loop
  // If burner is active, heat propagates to wire gauze and vessels directly above it
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prevItems) => {
        const activeBurners = prevItems.filter((i) => i.type === 'bunsen_burner' && i.isActive);
        if (activeBurners.length === 0) {
          // Cool down wire gauze if no active burner
          return prevItems.map((it) => (it.type === 'wire_gauze' && it.isGauzeGlowing ? { ...it, isGauzeGlowing: false } : it));
        }

        return prevItems.map((item) => {
          // Heat wire gauze directly over an active burner
          if (item.type === 'wire_gauze') {
            const hasBurnerUnderneath = activeBurners.some(
              (b) => Math.hypot(b.position[0] - item.position[0], b.position[2] - item.position[2]) < 0.8
            );
            return { ...item, isGauzeGlowing: hasBurnerUnderneath };
          }

          // Heat vessels situated above active burners or on glowing gauze
          if ((item.type === 'beaker' || item.type === 'flask' || item.type === 'evaporating_dish') && item.liquid) {
            const isOverBurner = activeBurners.some(
              (b) => Math.hypot(b.position[0] - item.position[0], b.position[2] - item.position[2]) < 0.75
            );

            if (isOverBurner && item.liquid.volumeMl > 0) {
              const currentT = item.liquid.temperatureC;
              const nextT = Math.min(100.0, Number((currentT + 1.8).toFixed(1)));
              const isBoiling = nextT >= 85;

              return {
                ...item,
                liquid: {
                  ...item.liquid,
                  temperatureC: nextT,
                  isBoiling: isBoiling
                }
              };
            }
          }

          return item;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Spawn Equipment into 3D Scene
  const handleSpawnEquipment = (type: EquipmentType, name: string, defaultLiquid?: LiquidState) => {
    const newId = `${type}-${Date.now().toString().slice(-4)}`;
    const randomX = Number(((Math.random() - 0.5) * 3.5).toFixed(2));
    const randomZ = Number(((Math.random() - 0.5) * 2.0).toFixed(2));

    const newItem: Item3DState = {
      id: newId,
      type: type,
      name: name,
      position: [randomX, 0, randomZ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      liquid: defaultLiquid,
      isActive: false
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedId(newId);
  };

  // Add chemical reagent to selected vessel
  const handleAddChemicalToSelected = (chemicalKey: string) => {
    if (!selectedId) return;
    const reagent = REAGENTS_CATALOG[chemicalKey];
    if (!reagent) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== selectedId) return item;

        const currentLiquid: LiquidState = item.liquid || {
          volumeMl: 0,
          maxVolumeMl: 250,
          color: '#e0f2fe',
          ph: 7.0,
          temperatureC: 22.0,
          species: {}
        };

        const addedMoles = (20.0 * reagent.molarity) / 1000;
        const sourceLiquid: LiquidState = {
          volumeMl: 20,
          maxVolumeMl: 50,
          color: reagent.color,
          ph: reagent.type === 'acid' ? 1.0 : reagent.type === 'base' ? 13.0 : 7.0,
          temperatureC: 22.0,
          species: { [chemicalKey]: addedMoles },
          indicator: chemicalKey === 'Phenolphthalein' ? 'phenolphthalein' : undefined
        };

        const { newDest, reaction } = mixLiquids(currentLiquid, sourceLiquid, 20);

        if (reaction) {
          setDetectedReactions((dr) => [reaction, ...dr]);
          setActiveReactionForDisplay(reaction);
        }

        return { ...item, liquid: newDest };
      })
    );
  };

  // Pour from selected vessel into target vessel
  const handlePourIntoTarget = (targetId: string, amountMl: number = 30) => {
    if (!selectedItem || !selectedItem.liquid || selectedItem.liquid.volumeMl <= 0) return;
    const targetItem = items.find((i) => i.id === targetId);
    if (!targetItem) return;

    const targetLiquid: LiquidState = targetItem.liquid || {
      volumeMl: 0,
      maxVolumeMl: 250,
      color: '#e0f2fe',
      ph: 7.0,
      temperatureC: 22.0,
      species: {}
    };

    const transferAmount = Math.min(amountMl, selectedItem.liquid.volumeMl);
    const { newDest, newSource, reaction } = mixLiquids(targetLiquid, selectedItem.liquid, transferAmount);

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === targetId) return { ...it, liquid: newDest };
        if (it.id === selectedItem.id) return { ...it, liquid: newSource };
        return it;
      })
    );

    if (reaction) {
      setDetectedReactions((dr) => [reaction, ...dr]);
      setActiveReactionForDisplay(reaction);
    }
  };

  // Move or Rotate Item in 3D
  const handleMoveItem = (id: string, newPos: [number, number, number], newRot?: [number, number, number]) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, position: newPos, rotation: newRot || it.rotation } : it))
    );
  };

  // Toggle equipment (Burner, Stirrer, Burette)
  const handleToggleActive = () => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) => (item.id === selectedId ? { ...item, isActive: !item.isActive } : item))
    );
  };

  // Tilt slider handling
  const handleTiltChange = (degrees: number) => {
    if (!selectedId || !selectedItem) return;
    const radians = (degrees * Math.PI) / 180;
    const newRot: [number, number, number] = [selectedItem.rotation[0], selectedItem.rotation[1], radians];
    handleMoveItem(selectedId, selectedItem.position, newRot);

    // If tilted past 40 degrees, search for vessel directly beneath spout to pour into
    if (degrees >= 40 && selectedItem.liquid && selectedItem.liquid.volumeMl > 0) {
      const target = items.find(
        (i) =>
          i.id !== selectedId &&
          (i.type === 'beaker' || i.type === 'flask' || i.type === 'test_tube' || i.type === 'evaporating_dish') &&
          Math.hypot(i.position[0] - selectedItem.position[0], i.position[2] - selectedItem.position[2]) < 1.0 &&
          i.position[1] <= selectedItem.position[1] + 0.5
      );
      if (target) {
        handlePourIntoTarget(target.id, 10);
      }
    }
  };

  // Stack Heating Station Preset (Tripod + Gauze + Beaker + Burner)
  const handleAssembleHeatingStation = () => {
    setItems([
      {
        id: 'tripod-station',
        type: 'tripod_stand',
        name: 'Iron Tripod Stand',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        supportHeight: 1.35
      },
      {
        id: 'gauze-station',
        type: 'wire_gauze',
        name: 'Wire Gauze (Ceramic Center)',
        position: [0, 1.35, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        snappedToId: 'tripod-station',
        supportHeight: 1.385,
        isGauzeGlowing: true
      },
      {
        id: 'beaker-station',
        type: 'beaker',
        name: '250mL Beaker (Water Solution)',
        position: [0, 1.385, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        snappedToId: 'gauze-station',
        liquid: {
          volumeMl: 100,
          maxVolumeMl: 250,
          color: '#e0f2fe',
          ph: 7.0,
          temperatureC: 65.0,
          species: { 'Water': 0.1 }
        }
      },
      {
        id: 'burner-station',
        type: 'bunsen_burner',
        name: 'Bunsen Burner (Ignited)',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        isActive: true
      },
      {
        id: 'probe-station',
        type: 'ph_probe',
        name: 'Digital Temp Probe',
        position: [1.6, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      }
    ]);
    setSelectedId('beaker-station');
  };

  // Titration Station Preset
  const handleSetupTitration = () => {
    setItems([
      {
        id: 'burette-stand-1',
        type: 'burette_stand',
        name: 'Burette Stand with NaOH',
        position: [-0.6, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        liquid: {
          volumeMl: 50,
          maxVolumeMl: 50,
          color: '#93c5fd',
          ph: 13.0,
          temperatureC: 22.0,
          species: { 'NaOH': 0.005 }
        },
        isActive: false
      },
      {
        id: 'stirrer-1',
        type: 'magnetic_stirrer',
        name: 'Magnetic Heated Stirrer',
        position: [-0.6, 0, 0.4],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        isActive: true
      },
      {
        id: 'flask-titration',
        type: 'flask',
        name: '250mL Analyte Flask',
        position: [-0.6, 0.38, 0.4],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        liquid: {
          volumeMl: 25,
          maxVolumeMl: 250,
          color: '#f8fafc',
          ph: 1.0,
          temperatureC: 22.0,
          species: { 'HCl': 0.0025, 'Phenolphthalein': 0.0001 },
          indicator: 'phenolphthalein'
        }
      }
    ]);
    setSelectedId('flask-titration');
  };

  // Test Tube Rack Station Preset
  const handleSetupTestTubeRack = () => {
    setItems([
      {
        id: 'rack-1',
        type: 'test_tube_rack',
        name: '6-Hole Wooden Tube Rack',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      {
        id: 'tube-1',
        type: 'test_tube',
        name: 'Tube 1: AgNO₃',
        position: [-0.85, 0.15, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        liquid: {
          volumeMl: 15,
          maxVolumeMl: 30,
          color: '#f1f5f9',
          ph: 6.5,
          temperatureC: 22.0,
          species: { 'AgNO3': 0.0015 }
        }
      },
      {
        id: 'tube-2',
        type: 'test_tube',
        name: 'Tube 2: NaCl',
        position: [-0.5, 0.15, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        liquid: {
          volumeMl: 15,
          maxVolumeMl: 30,
          color: '#f8fafc',
          ph: 7.0,
          temperatureC: 22.0,
          species: { 'NaCl': 0.0015 }
        }
      },
      {
        id: 'tube-3',
        type: 'test_tube',
        name: 'Tube 3: KI',
        position: [-0.15, 0.15, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        liquid: {
          volumeMl: 15,
          maxVolumeMl: 30,
          color: '#fef9c3',
          ph: 7.0,
          temperatureC: 22.0,
          species: { 'KI': 0.0015 }
        }
      },
      {
        id: 'beaker-pb',
        type: 'beaker',
        name: 'Lead Nitrate Beaker',
        position: [1.2, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        liquid: {
          volumeMl: 50,
          maxVolumeMl: 250,
          color: '#f8fafc',
          ph: 6.0,
          temperatureC: 22.0,
          species: { 'Pb_NO3_2': 0.005 }
        }
      }
    ]);
    setSelectedId('tube-1');
  };

  const handleClearBench = () => {
    setItems([]);
    setSelectedId(null);
  };

  const otherVessels = items.filter(
    (i) => i.id !== selectedId && (i.type === 'beaker' || i.type === 'flask' || i.type === 'test_tube' || i.type === 'cylinder' || i.type === 'evaporating_dish')
  );

  return (
    <div className="h-screen bg-slate-950 flex flex-col font-sans overflow-hidden text-white">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 text-white flex items-center px-6 justify-between flex-shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="hover:bg-slate-800 p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
          <div className="h-5 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-600/30">
              <FlaskConical size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Pro 3D Chemistry Laboratory</h1>
              <p className="text-[10px] text-slate-400">Physics Stacking, Thermal Heating & Real-Time Chemistry</p>
            </div>
          </div>
        </div>

        {/* Quick Stacking Station Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAssembleHeatingStation}
            className="px-3 py-1.5 rounded-lg bg-orange-950/80 hover:bg-orange-900 text-orange-200 text-xs font-bold border border-orange-700/60 transition-all flex items-center gap-1.5 shadow"
            title="Assemble Heating Station: Tripod + Wire Gauze + Beaker + Burner"
          >
            <Flame size={13} className="text-orange-400" />
            <span>Heating Station (Tripod + Gauze)</span>
          </button>

          <button
            onClick={handleSetupTitration}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hidden md:inline-flex items-center gap-1.5"
          >
            <Droplet size={13} className="text-blue-400" />
            <span>Titration Setup</span>
          </button>

          <button
            onClick={handleSetupTestTubeRack}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hidden md:inline-flex items-center gap-1.5"
          >
            <TestTube2 size={13} className="text-emerald-400" />
            <span>Test Tube Rack</span>
          </button>

          <div className="h-5 w-px bg-slate-800"></div>

          <button
            onClick={handleClearBench}
            disabled={items.length === 0}
            className="bg-red-500/20 text-red-300 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </header>

      {/* Main 3D Lab Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Comprehensive Equipment & Reagents Catalog */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-20 shadow-xl overflow-y-auto">
          {/* Category Tabs */}
          <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-950/60">
            <button
              onClick={() => setActiveCategory('equipment')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                activeCategory === 'equipment' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Apparatus
            </button>
            <button
              onClick={() => setActiveCategory('glassware')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                activeCategory === 'glassware' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Glassware
            </button>
            <button
              onClick={() => setActiveCategory('chemicals')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                activeCategory === 'chemicals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chemicals
            </button>
          </div>

          {/* Catalog Items */}
          <div className="p-3 space-y-2 flex-1">
            {activeCategory === 'equipment' && (
              <>
                <div className="text-[10px] uppercase font-bold text-slate-500 px-1 pt-1">Heating & Stacking</div>

                <button
                  onClick={() => handleSpawnEquipment('tripod_stand', 'Iron Tripod Stand')}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-orange-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-orange-400" />
                    <span>Tripod Stand</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('wire_gauze', 'Wire Gauze (Ceramic Center)')}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-orange-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-amber-300" />
                    <span>Wire Gauze Pad</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('bunsen_burner', 'Cast-Iron Bunsen Burner')}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-orange-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    <span>Bunsen Burner</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <div className="text-[10px] uppercase font-bold text-slate-500 px-1 pt-3">Stirring & Holding</div>

                <button
                  onClick={() => handleSpawnEquipment('magnetic_stirrer', 'Magnetic Heated Stirrer')}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-rose-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-rose-400" />
                    <span>Magnetic Stirrer</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('test_tube_rack', 'Wooden Test Tube Rack')}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-amber-600 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <TestTube2 size={16} className="text-amber-500" />
                    <span>Test Tube Rack</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('burette_stand', 'Retort Stand with Burette', { volumeMl: 50, maxVolumeMl: 50, color: '#93c5fd', ph: 13.0, temperatureC: 22.0, species: { 'NaOH': 0.005 } })}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-cyan-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Droplet size={16} className="text-cyan-400" />
                    <span>Burette Stand</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('ph_probe', 'Digital Temp / pH Probe')}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-cyan-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Thermometer size={16} className="text-cyan-400" />
                    <span>pH / Temp Probe</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('wash_bottle', 'Squeeze Wash Bottle (H₂O)', { volumeMl: 250, maxVolumeMl: 250, color: '#e0f2fe', ph: 7.0, temperatureC: 22.0, species: { 'Water': 0.25 } })}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Droplet size={16} className="text-blue-400" />
                    <span>Wash Bottle</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>
              </>
            )}

            {activeCategory === 'glassware' && (
              <>
                <button
                  onClick={() => handleSpawnEquipment('beaker', '250mL Glass Beaker', { volumeMl: 50, maxVolumeMl: 250, color: '#e0f2fe', ph: 7.0, temperatureC: 22.0, species: { 'Water': 0.05 } })}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical size={16} className="text-blue-400" />
                    <span>250mL Beaker</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('flask', '250mL Conical Flask', { volumeMl: 50, maxVolumeMl: 250, color: '#e0f2fe', ph: 7.0, temperatureC: 22.0, species: { 'Water': 0.05 } })}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical size={16} className="text-indigo-400" />
                    <span>Conical Flask</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('evaporating_dish', 'Porcelain Evaporating Dish', { volumeMl: 30, maxVolumeMl: 100, color: '#e0f2fe', ph: 7.0, temperatureC: 22.0, species: { 'Water': 0.03 } })}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-amber-400 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-amber-200" />
                    <span>Evaporating Dish</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('test_tube', 'Borosilicate Test Tube', { volumeMl: 10, maxVolumeMl: 30, color: '#e0f2fe', ph: 7.0, temperatureC: 22.0, species: { 'Water': 0.01 } })}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-emerald-500 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <TestTube2 size={16} className="text-emerald-400" />
                    <span>Test Tube (30mL)</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('cylinder', '100mL Measuring Cylinder', { volumeMl: 50, maxVolumeMl: 100, color: '#e0f2fe', ph: 7.0, temperatureC: 22.0, species: { 'Water': 0.05 } })}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-amber-400 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical size={16} className="text-amber-400" />
                    <span>Graduated Cylinder</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('stirring_rod', 'Glass Stirring Rod')}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-400 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Move size={16} className="text-slate-300" />
                    <span>Glass Stirring Rod</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => handleSpawnEquipment('watch_glass', 'Borosilicate Watch Glass')}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-400 text-left text-xs font-semibold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-slate-300" />
                    <span>Watch Glass</span>
                  </div>
                  <Plus size={14} className="text-slate-400" />
                </button>
              </>
            )}

            {activeCategory === 'chemicals' && (
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 px-1 pt-1">
                  Click to Add to Selected Vessel
                </div>
                {Object.entries(REAGENTS_CATALOG).map(([key, reg]) => (
                  <button
                    key={key}
                    onClick={() => handleAddChemicalToSelected(key)}
                    disabled={!selectedItem}
                    className="w-full p-2 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-400 text-left text-xs transition-all flex items-center justify-between disabled:opacity-40"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-black/30 flex-shrink-0"
                        style={{ backgroundColor: reg.color }}
                      ></div>
                      <span className="font-mono font-bold text-[11px] truncate">{reg.formula}</span>
                      <span className="text-[10px] text-slate-400 truncate">({reg.molarity}M)</span>
                    </div>
                    <Plus size={13} className="text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: 3D Scene Viewport */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {/* Reaction Banner Notification */}
          {detectedReactions.length > 0 && (
            <div className="absolute top-16 inset-x-6 z-20 flex justify-center pointer-events-none">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/80 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto max-w-xl animate-bounce-once">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                  <Atom size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    Reaction Detected in 3D Apparatus!
                  </div>
                  <div className="text-sm font-mono font-bold text-white mt-0.5">
                    {detectedReactions[0].equation}
                  </div>
                  <div className="text-xs text-emerald-300">
                    {detectedReactions[0].observation}
                  </div>
                </div>
                <button
                  onClick={() => setActiveReactionForDisplay(detectedReactions[0])}
                  className="ml-auto text-xs font-bold text-emerald-300 underline hover:text-white"
                >
                  Inspect
                </button>
              </div>
            </div>
          )}

          {/* 3D Scene */}
          <div className="flex-1 relative">
            <LaboratoryScene3D
              items={items}
              selectedId={selectedId}
              onSelectItem={setSelectedId}
              onMoveItem={handleMoveItem}
              transformMode={transformMode}
              setTransformMode={setTransformMode}
              enableSnapping={enableSnapping}
              setEnableSnapping={setEnableSnapping}
              onTriggerPour={(srcId, targetId, amount) => handlePourIntoTarget(targetId, amount)}
            />
          </div>

          {/* Reaction Details Inspection Drawer */}
          {activeReactionForDisplay && (
            <div className="max-h-[380px] overflow-y-auto border-t border-slate-800 bg-slate-900 p-6 z-30 shadow-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Verified Chemical Reaction
                </span>
                <button
                  onClick={() => setActiveReactionForDisplay(null)}
                  className="text-xs text-slate-400 hover:text-white font-bold px-2 py-1 rounded bg-slate-800"
                >
                  Close Inspection ✕
                </button>
              </div>
              <ReactionDisplay
                reaction={{
                  title: activeReactionForDisplay.title,
                  equation: activeReactionForDisplay.equation,
                  netIonic: activeReactionForDisplay.netIonic,
                  reactionType: activeReactionForDisplay.reactionType,
                  enthalpy: activeReactionForDisplay.enthalpy,
                  description: activeReactionForDisplay.description,
                  keyTakeaway: activeReactionForDisplay.observation,
                  stepsExplanation: [
                    {
                      step: 'Chemical Reaction in 3D Apparatus',
                      observation: activeReactionForDisplay.observation,
                      chemicalReason: activeReactionForDisplay.description
                    }
                  ],
                  stoichiometry: [
                    { label: 'Type', value: activeReactionForDisplay.reactionType },
                    { label: 'Equation', value: activeReactionForDisplay.equation }
                  ]
                }}
                isCompleted={true}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar: Selected 3D Apparatus Inspector & Manipulation Controls */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col flex-shrink-0 z-20 shadow-xl overflow-y-auto p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <FlaskConical size={16} className="text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Apparatus Inspector</h2>
            </div>
            {selectedItem && (
              <button
                onClick={() => {
                  setItems((prev) => prev.filter((i) => i.id !== selectedId));
                  setSelectedId(null);
                }}
                className="text-slate-400 hover:text-rose-400 text-xs transition-colors"
                title="Remove item"
              >
                Delete ✕
              </button>
            )}
          </div>

          {selectedItem ? (
            <div className="space-y-4">
              {/* Item Info Badge */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-sm font-bold text-white">{selectedItem.name}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1 flex justify-between">
                  <span>X: {selectedItem.position[0].toFixed(2)}</span>
                  <span>Y: {selectedItem.position[1].toFixed(2)} (Elevated)</span>
                  <span>Z: {selectedItem.position[2].toFixed(2)}</span>
                </div>
              </div>

              {/* Natural Tilt & Pour Slider */}
              {(selectedItem.type === 'beaker' || selectedItem.type === 'flask' || selectedItem.type === 'reagent_bottle') && (
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Tilt Angle (Pour Liquid):</span>
                    <span className="font-mono text-blue-400 font-bold">
                      {Math.round(((selectedItem.rotation[2] || 0) * 180) / Math.PI)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="75"
                    step="5"
                    value={Math.round(((selectedItem.rotation[2] || 0) * 180) / Math.PI)}
                    onChange={(e) => handleTiltChange(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Upright (0°)</span>
                    <span>Tilt (45°)</span>
                    <span>Pour (75°)</span>
                  </div>
                </div>
              )}

              {/* Equipment Actions */}
              {selectedItem.type === 'bunsen_burner' && (
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-semibold">Burner Flame:</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        selectedItem.isActive
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 animate-pulse'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {selectedItem.isActive ? 'IGNITED (~1500°C)' : 'OFF'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleActive}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow ${
                      selectedItem.isActive
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30'
                    }`}
                  >
                    {selectedItem.isActive ? 'Extinguish Flame' : 'Ignite Bunsen Burner'}
                  </button>
                </div>
              )}

              {selectedItem.type === 'wire_gauze' && (
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Ceramic Center Pad:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        selectedItem.isGauzeGlowing ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400'
                      }`}
                    >
                      {selectedItem.isGauzeGlowing ? 'GLOWING RED-HOT ♨' : 'Cool (22°C)'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Place on top of Tripod Stand and position Bunsen burner below to heat beakers.
                  </div>
                </div>
              )}

              {selectedItem.type === 'magnetic_stirrer' && (
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-semibold">Motorized Stirrer:</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        selectedItem.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {selectedItem.isActive ? 'SPINNING (600 RPM)' : 'OFF'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleActive}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedItem.isActive
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {selectedItem.isActive ? 'Stop Stirrer' : 'Start Magnetic Stirrer'}
                  </button>
                </div>
              )}

              {/* Liquid Contents & Thermodynamic Readout */}
              {selectedItem.liquid && (
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Solution Contents</span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: selectedItem.liquid.color }}
                      ></div>
                      <span className="text-xs font-mono font-bold text-white">
                        {selectedItem.liquid.volumeMl.toFixed(0)} / {selectedItem.liquid.maxVolumeMl} mL
                      </span>
                    </div>
                  </div>

                  {/* Volume Gauge */}
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(selectedItem.liquid.volumeMl / selectedItem.liquid.maxVolumeMl) * 100}%`,
                        backgroundColor: selectedItem.liquid.color
                      }}
                    ></div>
                  </div>

                  {/* Temperature & pH */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Temperature:</span>
                      <span className={`font-bold ${selectedItem.liquid.temperatureC > 70 ? 'text-orange-400' : 'text-rose-400'}`}>
                        {selectedItem.liquid.temperatureC.toFixed(1)} °C {selectedItem.liquid.isBoiling ? '♨ Boiling' : ''}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Live pH:</span>
                      <span className="text-emerald-400 font-bold">{selectedItem.liquid.ph.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Chemical Species */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Dissolved Solutes:</span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(selectedItem.liquid.species).map(([spec, mol]) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded bg-slate-900 text-blue-300 font-mono text-[10px] border border-slate-800"
                        >
                          {spec} ({(mol * 1000).toFixed(1)} mmol)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Direct Pour Action */}
                  {otherVessels.length > 0 && selectedItem.liquid.volumeMl > 0 && (
                    <div className="pt-2 border-t border-slate-700/60">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Pour Solution into:</span>
                      <div className="flex flex-col gap-1">
                        {otherVessels.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => handlePourIntoTarget(v.id, 25)}
                            className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-left text-xs font-semibold transition-all flex items-center justify-between"
                          >
                            <span>Pour into {v.name}</span>
                            <span>→</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="m-auto text-center text-slate-500 text-xs">
              <FlaskConical size={36} className="mx-auto mb-2 opacity-30 text-blue-400" />
              <p className="font-semibold text-slate-400">No Item Selected</p>
              <p className="mt-1">Click any 3D equipment on the lab bench to move, rotate, elevate, or stack it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
