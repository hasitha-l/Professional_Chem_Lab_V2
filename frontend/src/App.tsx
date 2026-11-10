import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LabProgressProvider } from './context/LabProgressContext';
import Home from './pages/Home';
import SandboxLab from './pages/SandboxLab';
import ExperimentPage from './pages/ExperimentPage';

export default function App() {
  return (
    <LabProgressProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sandbox" element={<SandboxLab />} />
        <Route path="/experiment/:id" element={<ExperimentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LabProgressProvider>
  );
}
