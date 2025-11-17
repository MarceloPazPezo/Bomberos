import React, { Suspense, lazy } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { MdDashboard, MdHelpOutline } from 'react-icons/md';
import Tooltip from '@components/Tooltip.jsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
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
  ChartTooltip,
  Legend,
  Filler
);

// Lazy load de las vistas pesadas futuras
const CompaniaDashboard = lazy(() => import('./dashboard/CompaniaDashboard'));
const BomberoDashboard = lazy(() => import('./dashboard/BomberoDashboard'));

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      {/* Header principal con estilo glassmorphism */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdDashboard className="h-8 w-8 text-[#4EB9FA]" />
              <div>
                <h1 className="text-2xl font-bold text-[#2C3E50]">
                  Dashboard
                </h1>
              </div>
              <Tooltip
                id="dashboard-help"
                content="Panel de control principal del sistema. Aquí puedes ver estadísticas detalladas de incidentes, eventos y asistencia, tanto para tu compañía como para tu perfil personal."
                place="right"
                variant="dark"
              >
                <MdHelpOutline className="h-4 w-4 text-gray-400 hover:text-[#4EB9FA] transition-colors cursor-help" />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 mt-2">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4">
          <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Cargando secciones...</div>}>
            <TabView className="border-0">
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
    </div>
  );
};

export default Dashboard;
