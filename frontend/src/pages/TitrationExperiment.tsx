import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TitrationExperiment() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-4">Acid-Base Titration Module</h1>
      <p className="text-gray-600 mb-8">This is where the previously built fully functional titration apparatus goes.</p>
      <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Back to Dashboard</button>
    </div>
  );
}