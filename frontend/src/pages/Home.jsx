import React from 'react';
import BomberosActivos from '@components/bomberos/BomberosActivos';
import { useAuth } from '@hooks/auth/useAuth';
import { useActiveBomberos } from '@hooks/bomberos/useActiveBomberos';
import { useCompaniaConfig } from '@hooks/compania/useCompaniaConfig';
import { 
    MdSettings,
    MdLocalFireDepartment,
    MdGroup,
    MdAssignment,
    MdLocationOn,
    MdPhone,
    MdEmail,
    MdCalendarToday,
    MdBusiness,
    MdDashboard,
    MdPeople,
    MdWarning
} from 'react-icons/md';

const Home = () => {
  const { bombero } = useAuth();
  const { loading: configLoading, getConfigValue } = useCompaniaConfig();
  const { activeBomberos, isConnected, connectionError } = useActiveBomberos();

  const companyName = getConfigValue('company_name', 'Bomberos de Chile');
  const companyCity = getConfigValue('company_city', 'Chile');
  const companyRegion = getConfigValue('company_region', '');
  const companyFoundedYear = getConfigValue('company_founded_year', '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <MdLocalFireDepartment className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {configLoading ? 'Cargando...' : companyName}
            </h1>
            <p className="text-xl text-red-100 mb-6">
              {bombero ? (
                <>¡Bienvenido/a de vuelta, <span className="font-semibold">{bombero.name}</span>!</>
              ) : (
                'Sistema de Gestión para Cuerpos de Bomberos'
              )}
            </p>
            {!configLoading && (companyCity || companyRegion) && (
              <div className="flex items-center justify-center text-red-100 mb-4">
                <MdLocationOn className="h-5 w-5 mr-2" />
                <span>{companyCity}{companyRegion && `, ${companyRegion}`}</span>
                {companyFoundedYear && (
                  <>
                    <MdCalendarToday className="h-5 w-5 ml-4 mr-2" />
                    <span>Fundado en {companyFoundedYear}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* Estadísticas Rápidas */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Estado del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Emergencias Activas</p>
                  <p className="text-2xl font-bold text-red-600">0</p>
                </div>
                <MdWarning className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Personal Disponible</p>
                  <p className="text-2xl font-bold text-green-600">--</p>
                </div>
                <MdGroup className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Bomberos Conectados</p>
                  <p className={`text-2xl font-bold ${isConnected ? 'text-blue-600' : 'text-gray-400'}`}>
                    {isConnected ? activeBomberos : '--'}
                  </p>
                  {isConnected && (
                    <p className="text-xs text-green-600 mt-1">● En línea</p>
                  )}
                  {!isConnected && bombero && !connectionError && (
                    <p className="text-xs text-orange-600 mt-1">● Conectando...</p>
                  )}
                  {connectionError && (
                    <p className="text-xs text-red-600 mt-1">● Error de conexión</p>
                  )}
                </div>
                <MdPeople className={`h-8 w-8 ${isConnected ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Sistema</p>
                  <p className="text-2xl font-bold text-green-600">Activo</p>
                </div>
                <MdDashboard className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Información de Contacto de la Compañía */}
        {!configLoading && (
          <section className="mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <MdBusiness className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-bold text-slate-900">Información de Contacto</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getConfigValue('company_address') && (
                  <div className="flex items-center">
                    <MdLocationOn className="h-5 w-5 text-slate-500 mr-2" />
                    <span className="text-slate-700">{getConfigValue('company_address')}</span>
                  </div>
                )}
                {getConfigValue('company_phone') && (
                  <div className="flex items-center">
                    <MdPhone className="h-5 w-5 text-slate-500 mr-2" />
                    <span className="text-slate-700">{getConfigValue('company_phone')}</span>
                  </div>
                )}
                {getConfigValue('company_email') && (
                  <div className="flex items-center">
                    <MdEmail className="h-5 w-5 text-slate-500 mr-2" />
                    <span className="text-slate-700">{getConfigValue('company_email')}</span>
                  </div>
                )}
                {getConfigValue('company_founded_year') && (
                  <div className="flex items-center">
                    <MdCalendarToday className="h-5 w-5 text-slate-500 mr-2" />
                    <span className="text-slate-700">Fundado en {getConfigValue('company_founded_year')}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <footer className="text-center mt-16 pb-8 text-slate-500">
          <p>© {new Date().getFullYear()} {companyName}. Sistema de Gestión para Cuerpos de Bomberos.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;