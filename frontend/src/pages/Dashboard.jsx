import React, { Suspense, lazy } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { MdQueryStats } from 'react-icons/md';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Lazy load de las vistas pesadas futuras
const CompaniaDashboard = lazy(() => import('./dashboard/CompaniaDashboard'));
const BomberoDashboard = lazy(() => import('./dashboard/BomberoDashboard'));

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-4 px-8">
      <div className="mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#4EB9FA] rounded-lg shadow-md inline-flex">
            <MdQueryStats size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#2C3E50] tracking-tight">Dashboard</h1>
        </div>
        <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Cargando secciones...</div>}>
          <TabView className="bg-white shadow rounded-md overflow-hidden">
            <TabPanel header="Compañía">
              <CompaniaDashboard />
            </TabPanel>
            <TabPanel header="Bombero">
              <BomberoDashboard />
            </TabPanel>
          </TabView>
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
