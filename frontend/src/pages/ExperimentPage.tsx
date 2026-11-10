import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AcidBaseTitrationLab from './experiments/AcidBaseTitrationLab';
import FlameTestLab from './experiments/FlameTestLab';
import RedoxTitrationLab from './experiments/RedoxTitrationLab';
import PrecipitationLab from './experiments/PrecipitationLab';
import ElectrochemistryLab from './experiments/ElectrochemistryLab';
import ChemicalKineticsLab from './experiments/ChemicalKineticsLab';
import ChemicalEquilibriumLab from './experiments/ChemicalEquilibriumLab';
import CalorimetryLab from './experiments/CalorimetryLab';
import GasLawsLab from './experiments/GasLawsLab';
import OrganicSynthesisLab from './experiments/OrganicSynthesisLab';

export default function ExperimentPage() {
  const { id } = useParams<{ id: string }>();

  switch (id) {
    case 'titration':
      return <AcidBaseTitrationLab />;
    case 'flame-test':
      return <FlameTestLab />;
    case 'redox':
      return <RedoxTitrationLab />;
    case 'precipitation':
      return <PrecipitationLab />;
    case 'electro':
      return <ElectrochemistryLab />;
    case 'kinetics':
      return <ChemicalKineticsLab />;
    case 'equilibrium':
      return <ChemicalEquilibriumLab />;
    case 'calorimetry':
      return <CalorimetryLab />;
    case 'gas-laws':
      return <GasLawsLab />;
    case 'organic':
      return <OrganicSynthesisLab />;
    default:
      return <Navigate to="/" replace />;
  }
}

