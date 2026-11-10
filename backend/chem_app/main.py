from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import math

app = FastAPI(
    title="Virtual Chemistry Laboratory API",
    description="Backend services, stoichiometry verification, and reactions database for all 10 laboratory modules",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

EXPERIMENTS_DATABASE: Dict[str, Dict[str, Any]] = {
    "titration": {
        "title": "Acid-Base Titration",
        "equation": "HCl(aq) + NaOH(aq) -> NaCl(aq) + H2O(l)",
        "net_ionic": "H+(aq) + OH-(aq) -> H2O(l)",
        "reaction_type": "Neutralization",
        "delta_h_kj_mol": -57.3,
        "indicator": "Phenolphthalein",
        "equivalence_volume_ml": 25.0
    },
    "flame-test": {
        "title": "Flame Tests & Atomic Emission",
        "equation": "M+(s) + e- + Heat -> M*(g) -> M(g) + hv",
        "reaction_type": "Atomic Emission Spectroscopy",
        "emitters": {
            "Na": {"color": "Golden Yellow", "wavelength_nm": 589.0},
            "Cu": {"color": "Emerald Blue-Green", "wavelength_nm": 510.5},
            "Sr": {"color": "Crimson Scarlet", "wavelength_nm": 650.4},
            "K": {"color": "Lilac / Pale Violet", "wavelength_nm": 766.5},
            "Ba": {"color": "Apple Green", "wavelength_nm": 553.6},
            "Ca": {"color": "Brick Red / Orange", "wavelength_nm": 622.0}
        }
    },
    "redox": {
        "title": "Redox Titration (Permanganometry)",
        "equation": "2KMnO4(aq) + 10FeSO4(aq) + 8H2SO4(aq) -> 2MnSO4(aq) + 5Fe2(SO4)3(aq) + K2SO4(aq) + 8H2O(l)",
        "net_ionic": "MnO4-(aq) + 5Fe2+(aq) + 8H+(aq) -> Mn2+(aq) + 5Fe3+(aq) + 4H2O(l)",
        "e_cell_standard_v": 0.74,
        "ratio": "1 mol MnO4- : 5 mol Fe2+"
    },
    "precipitation": {
        "title": "Precipitation Reactions & Solubility",
        "reactions": [
            {"reactants": "AgNO3 + NaCl", "precipitate": "AgCl(s) (Curdy White)", "ksp": 1.77e-10},
            {"reactants": "Pb(NO3)2 + 2KI", "precipitate": "PbI2(s) (Golden Yellow)", "ksp": 9.80e-9},
            {"reactants": "CuSO4 + 2NaOH", "precipitate": "Cu(OH)2(s) (Sky Blue)", "ksp": 2.20e-20},
            {"reactants": "FeCl3 + 3NaOH", "precipitate": "Fe(OH)3(s) (Rust Brown)", "ksp": 2.79e-39}
        ]
    },
    "electro": {
        "title": "Electrochemistry (Daniell Galvanic Cell)",
        "equation": "Zn(s) + CuSO4(aq) -> ZnSO4(aq) + Cu(s)",
        "net_ionic": "Zn(s) + Cu2+(aq) -> Zn2+(aq) + Cu(s)",
        "e_cell_standard_v": 1.100,
        "anode": "Zn(s) -> Zn2+(aq) + 2e- (E_ox = +0.763 V)",
        "cathode": "Cu2+(aq) + 2e- -> Cu(s) (E_red = +0.337 V)"
    },
    "kinetics": {
        "title": "Chemical Kinetics & Iodine Clock",
        "rate_determining_step": "S2O8(2-) + 2I- -> 2SO4(2-) + I2 (Slow)",
        "scavenging_step": "I2 + 2S2O3(2-) -> 2I- + S4O6(2-) (Fast)",
        "rate_law": "Rate = k * [S2O8(2-)] * [I-]",
        "activation_energy_kj_mol": 52.4
    },
    "equilibrium": {
        "title": "Chemical Equilibrium & Le Chatelier",
        "equation": "[Co(H2O)6]2+(aq) [Pink] + 4Cl-(aq) + Heat <=> [CoCl4]2-(aq) [Blue] + 6H2O(l)",
        "delta_h_kj_mol": 50.0,
        "type": "Endothermic Forward"
    },
    "calorimetry": {
        "title": "Calorimetry & Neutralization Heat",
        "equation": "HCl(aq) + NaOH(aq) -> NaCl(aq) + H2O(l) + Heat",
        "literature_delta_h_kj_mol": -57.32,
        "specific_heat_water": 4.184
    },
    "gas-laws": {
        "title": "Gas Laws & Kinetic Theory",
        "equation": "P * V = n * R * T",
        "gas_constant_r": 0.08206
    },
    "organic": {
        "title": "Organic Synthesis of Aspirin",
        "equation": "C7H6O3 (Salicylic Acid) + C4H6O3 (Acetic Anhydride) -> C9H8O4 (Aspirin) + CH3COOH (Acetic Acid)",
        "catalyst": "H2SO4 (Conc.)",
        "theoretical_yield_factor": 1.305,
        "purity_indicator": "FeCl3 (Phenolic Complexation)"
    }
}

class TitrationCalcRequest(BaseModel):
    acid_volume_ml: float = 25.0
    acid_molarity: float = 0.100
    base_molarity: float = 0.100
    base_volume_ml: float

class NernstRequest(BaseModel):
    zn_concentration: float = 1.0
    cu_concentration: float = 1.0
    temperature_k: float = 298.15

class GasLawRequest(BaseModel):
    moles: float = 0.10
    temperature_k: float = 298.15
    volume_l: float

@app.get("/")
def read_root():
    return {
        "status": "Virtual Chemistry Lab Backend Active",
        "total_experiments": len(EXPERIMENTS_DATABASE),
        "experiments": list(EXPERIMENTS_DATABASE.keys())
    }

@app.get("/api/experiments")
def get_all_experiments():
    return {"experiments": EXPERIMENTS_DATABASE}

@app.get("/api/experiments/{lab_id}")
def get_experiment_details(lab_id: str):
    if lab_id not in EXPERIMENTS_DATABASE:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return EXPERIMENTS_DATABASE[lab_id]

@app.post("/api/calculate/titration-ph")
def calculate_titration_ph(req: TitrationCalcRequest):
    v_total = req.acid_volume_ml + req.base_volume_ml
    n_acid = (req.acid_volume_ml * req.acid_molarity) / 1000.0
    n_base = (req.base_volume_ml * req.base_molarity) / 1000.0

    if req.base_volume_ml == 0:
        ph = -math.log10(req.acid_molarity)
    elif n_base < n_acid:
        h_conc = (n_acid - n_base) / (v_total / 1000.0)
        ph = -math.log10(h_conc)
    elif abs(n_base - n_acid) < 1e-7:
        ph = 7.00
    else:
        oh_conc = (n_base - n_acid) / (v_total / 1000.0)
        poh = -math.log10(oh_conc)
        ph = 14.00 - poh

    return {
        "base_volume_ml": req.base_volume_ml,
        "ph": round(ph, 2),
        "is_equivalence": abs(req.base_volume_ml - (req.acid_volume_ml * req.acid_molarity / req.base_molarity)) < 0.1
    }

@app.post("/api/calculate/nernst-potential")
def calculate_nernst_potential(req: NernstRequest):
    e_standard = 1.100
    q = req.zn_concentration / req.cu_concentration
    nernst_e = e_standard - (0.0592 / 2.0) * math.log10(q)
    return {
        "e_cell_v": round(nernst_e, 3),
        "reaction_quotient_q": round(q, 4)
    }

@app.post("/api/calculate/gas-pressure")
def calculate_gas_pressure(req: GasLawRequest):
    r = 0.08206
    p = (req.moles * r * req.temperature_k) / req.volume_l
    return {
        "pressure_atm": round(p, 2),
        "volume_l": req.volume_l,
        "temperature_k": req.temperature_k
    }
