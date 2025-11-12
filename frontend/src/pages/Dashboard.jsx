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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-2 sm:py-4 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[2000px]">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-[#4EB9FA] rounded-lg shadow-md inline-flex">
            <MdQueryStats size={24} className="text-white sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2C3E50] tracking-tight">Dashboard</h1>
        </div>
        <Suspense fallback={<div className="p-4 sm:p-8 text-center text-sm text-gray-500">Cargando secciones...</div>}>
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
