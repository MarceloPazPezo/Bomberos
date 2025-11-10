import React from 'react';
import { MdPeople } from 'react-icons/md';

const BomberoDashboard = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <MdPeople size={32} className="text-[#4EB9FA]" />
        <h2 className="text-2xl font-semibold text-[#2C3E50]">Dashboard de Bombero</h2>
      </div>
      <p className="text-gray-600">Este es el dashboard de bombero.</p>
    </div>
  );
};

export default BomberoDashboard;
