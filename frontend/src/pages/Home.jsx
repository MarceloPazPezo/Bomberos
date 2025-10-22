import React, { useState, useEffect } from 'react';
import BomberosActivos from '@components/bomberos/BomberosActivos';
import { useAuth } from '@hooks/auth/useAuth';
import { useActiveBomberos } from '@hooks/bomberos/useActiveBomberos';
import { useCompaniaConfig } from '@hooks/compania/useCompaniaConfig';
import CompaniaBanner from '@components/companias/CompaniaBanner';
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
    MdWarning,
    MdSecurity,
    MdInventory,
    MdTrendingUp,
    MdCheckCircle,
    MdSchedule
} from 'react-icons/md';
import axios from 'axios';

const Home = () => {
  const { bombero } = useAuth();
  const { loading: configLoading, getConfigValue } = useCompaniaConfig();
  const { activeBomberos, isConnected, connectionError } = useActiveBomberos();

  const [dashboardStats, setDashboardStats] = useState({
    bomberosStats: null,
    eppStats: null,
    disponibilidadStats: null,
    loading: true
  });

  const companyName = getConfigValue('company_name', 'Bomberos de Chile');
  const companyCity = getConfigValue('company_city', 'Chile');
  const companyRegion = getConfigValue('company_region', '');
  const companyFoundedYear = getConfigValue('company_founded_year', '');
  const companyBanner = getConfigValue('company_banner', '');

  // Cargar estadísticas del dashboard
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setDashboardStats(prev => ({ ...prev, loading: true }));
        
        const [bomberosResponse, eppResponse, disponibilidadResponse] = await Promise.allSettled([
          axios.get('/api/bombero/mi-compania/estadisticas'),
          axios.get('/api/epp/stats'),
          axios.get('/api/disponibilidad')
        ]);

        const bomberosStats = bomberosResponse.status === 'fulfilled' ? bomberosResponse.value.data.data : null;
        const eppStats = eppResponse.status === 'fulfilled' ? eppResponse.value.data.data : null;
        
        // Calcular estadísticas de disponibilidad
        let disponibilidadStats = null;
        if (disponibilidadResponse.status === 'fulfilled') {
          const disponibilidades = disponibilidadResponse.value.data.data || [];
          const now = new Date();
          
          const disponibles = disponibilidades.filter(d => 
            d.fechaInicio && new Date(d.fechaInicio) <= now && 
            (!d.fechaTermino || new Date(d.fechaTermino) > now)
          ).length;
          
          const inactivos = disponibilidades.filter(d => 
            d.fechaTermino && new Date(d.fechaTermino) <= now
          ).length;
          
          disponibilidadStats = {
            disponibles,
            inactivos,
            total: disponibilidades.length
          };
        }

        setDashboardStats({
          bomberosStats,
          eppStats,
          disponibilidadStats,
          loading: false
        });
      } catch (error) {
        console.error('Error cargando estadísticas del dashboard:', error);
        setDashboardStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (bombero?.id) {
      loadDashboardStats();
    }
  }, [bombero?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {companyBanner ? (
          /* Banner de la compañía */
          <div className="relative h-64 md:h-80">
            <CompaniaBanner
              compania={{ id: user?.idCompania }}
              nombre={companyName}
              size="hero"
              className="w-full h-full"
              alt={`Banner ${companyName}`}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {configLoading ? 'Cargando...' : companyName}
                </h1>
                <p className="text-xl md:text-2xl text-white mb-6 drop-shadow-md">
                  {bombero ? (
                    <>¡Bienvenido/a de vuelta, <span className="font-semibold">{bombero.name}</span>!</>
                  ) : (
                    'Sistema de Gestión para Cuerpos de Bomberos'
                  )}
                </p>
                {!configLoading && (companyCity || companyRegion) && (
                  <div className="flex items-center justify-center text-white mb-4 drop-shadow-md">
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
        ) : (
          /* Fallback con gradiente */
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
        )}
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* Dashboard de Estadísticas */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Dashboard de la Compañía</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Personal Disponible */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Personal Disponible</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats.disponibilidadStats?.disponibles || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    de {dashboardStats.disponibilidadStats?.total || 0} bomberos
                  </p>
                </div>
                <MdGroup className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            {/* Total de Bomberos */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Bomberos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats.loading ? '--' : (dashboardStats.bomberosStats?.totalBomberos || 0)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {dashboardStats.bomberosStats?.porcentajeActivos || 0}% activos
                  </p>
                </div>
                <MdPeople className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            {/* EPP Disponibles */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">EPP Disponibles</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardStats.loading ? '--' : (dashboardStats.eppStats?.eppsDisponibles || 0)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {dashboardStats.eppStats?.porcentajeDisponibilidad || 0}% del inventario
                  </p>
                </div>
                <MdSecurity className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            {/* Bomberos con Licencia */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Con Licencia F</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardStats.loading ? '--' : (dashboardStats.bomberosStats?.bomberosConLicencia || 0)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {dashboardStats.bomberosStats?.porcentajeConLicencia || 0}% del personal
                  </p>
                </div>
                <MdCheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Estadísticas Adicionales */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Estado de Conexión */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Estado de Conexión</h3>
                <MdSchedule className="h-6 w-6 text-slate-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Bomberos en línea</span>
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                    {isConnected ? activeBomberos : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Estado</span>
                  <span className={`text-sm font-medium ${
                    isConnected ? 'text-green-600' : 
                    connectionError ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {isConnected ? 'Conectado' : 
                     connectionError ? 'Error' : 'Conectando...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Inventario EPP */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Inventario EPP</h3>
                <MdInventory className="h-6 w-6 text-slate-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total EPP</span>
                  <span className="text-sm font-medium text-slate-900">
                    {dashboardStats.loading ? '--' : (dashboardStats.eppStats?.totalEpps || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Asignados</span>
                  <span className="text-sm font-medium text-slate-900">
                    {dashboardStats.loading ? '--' : (dashboardStats.eppStats?.eppsAsignados || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Tipos disponibles</span>
                  <span className="text-sm font-medium text-slate-900">
                    {dashboardStats.loading ? '--' : (dashboardStats.eppStats?.totalTipos || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Estadísticas de Personal */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Personal</h3>
                <MdTrendingUp className="h-6 w-6 text-slate-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Activos</span>
                  <span className="text-sm font-medium text-green-600">
                    {dashboardStats.loading ? '--' : (dashboardStats.bomberosStats?.bomberosActivos || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Inactivos</span>
                  <span className="text-sm font-medium text-gray-600">
                    {dashboardStats.loading ? '--' : (dashboardStats.bomberosStats?.bomberosInactivos || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Donantes</span>
                  <span className="text-sm font-medium text-red-600">
                    {dashboardStats.loading ? '--' : (dashboardStats.bomberosStats?.bomberosDonantes || 0)}
                  </span>
                </div>
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