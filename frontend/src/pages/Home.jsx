import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import { useCompaniaBombero } from '@hooks/compania/useCompaniaBombero';
import { useActiveBomberos } from '@hooks/bomberos/useActiveBomberos';
import CompaniaBanner from '@components/companias/CompaniaBanner';
import companiaImageService from '@services/companiaImage.service';
import axios from '@services/root.service';
import { getDisponibilidades } from '@services/disponibilidad.service';
import { 
    MdLocalFireDepartment,
    MdGroup,
    MdLocationOn,
    MdPhone,
    MdEmail,
    MdCalendarToday,
    MdPeople,
    MdSecurity,
    MdCheckCircle,
    MdSchedule,
    MdTrendingUp,
    MdInventory,
    MdHelpOutline
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@components/Tooltip.jsx';

const Home = () => {
  const { bombero } = useAuth();
  const { companiaInfo, loading: loadingCompania } = useCompaniaBombero();
  const { activeBomberos, isConnected, connectionError } = useActiveBomberos();
  const navigate = useNavigate();

  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    bomberosStats: null,
    eppStats: null,
    disponibilidadStats: null,
    loading: true
  });
  const [stableCompaniaId, setStableCompaniaId] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Cargar logo de la compañía
  useEffect(() => {
    const loadLogo = async () => {
      if (!companiaInfo?.id) {
        setLogoUrl(null);
        setLogoError(false);
        return;
      }

      try {
        setLogoError(false);
        const url = await companiaImageService.getCompaniaLogoURL(companiaInfo.id);
        if (url) {
          setLogoUrl(url);
        } else {
          setLogoUrl(null);
          setLogoError(true);
        }
      } catch (error) {
        console.error('[Home] Error cargando logo:', error);
        setLogoUrl(null);
        setLogoError(true);
      }
    };

    loadLogo();
  }, [companiaInfo?.id]);

  // Cargar estadísticas del dashboard
  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!bombero?.companiaId && !companiaInfo?.id) {
        setDashboardStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setDashboardStats(prev => ({ ...prev, loading: true }));
        
        const companiaId = bombero?.companiaId || companiaInfo?.id;
        
        const statsPromises = [
          axios.get('/bombero/mi-compania/estadisticas').then(r => r.data).catch(err => {
            console.error('[Home] Error obteniendo estadísticas de bomberos:', err);
            return null;
          }),
          axios.get('/epp/stats').then(r => r.data).catch(err => {
            console.error('[Home] Error obteniendo estadísticas de EPP:', err);
            return null;
          }),
          getDisponibilidades().catch(err => {
            console.error('[Home] Error obteniendo disponibilidades:', err);
            return null;
          }),
          // Obtener bomberos de la compañía para filtrar disponibilidades
          companiaId 
            ? axios.get('/bombero/mi-compania/bomberos').then(r => r.data).catch(() => null)
            : Promise.resolve(null)
        ];

        const [bomberosRes, eppRes, disponibilidades, bomberosCompaniaRes] = await Promise.all(statsPromises);

        // Extraer datos de las respuestas del backend
        // bomberosRes es r.data (la respuesta completa del backend)
        // bomberosRes.data contiene { compania: {...}, estadisticas: {...} }
        // bomberosRes.data.estadisticas contiene las estadísticas reales
        const bomberosStats = bomberosRes?.data?.estadisticas || null;
        const eppStats = eppRes?.data || null;
        
        console.log('[Home] Respuesta completa bomberos:', bomberosRes);
        console.log('[Home] Estadísticas recibidas:', { 
          bomberosStats, 
          eppStats, 
          disponibilidades: disponibilidades?.length,
          bomberosResData: bomberosRes?.data 
        });
        
        // Calcular estadísticas de disponibilidad
        let disponibilidadStats = null;
        if (Array.isArray(disponibilidades)) {
          const now = new Date();
          
          // Obtener IDs de bomberos de la compañía para filtrar disponibilidades
          let bomberosIdsCompania = [];
          if (bomberosCompaniaRes?.data?.bomberos) {
            const bomberosCompania = Array.isArray(bomberosCompaniaRes.data.bomberos) 
              ? bomberosCompaniaRes.data.bomberos 
              : [];
            bomberosIdsCompania = bomberosCompania.map(b => b.id);
          }
          
          // Filtrar disponibilidades: primero por compañía (si tenemos los IDs), luego por fecha
          let disponibilidadesCompania = disponibilidades;
          if (bomberosIdsCompania.length > 0) {
            disponibilidadesCompania = disponibilidades.filter(d => 
              d.bombero && bomberosIdsCompania.includes(d.bombero.id)
            );
          }
          
          // Filtrar solo las disponibilidades activas
          const disponibles = disponibilidadesCompania.filter(d => {
            if (!d.fechaInicio) return false;
            try {
              const fechaInicio = new Date(d.fechaInicio);
              const fechaTermino = d.fechaTermino ? new Date(d.fechaTermino) : null;
              return fechaInicio <= now && (!fechaTermino || fechaTermino > now);
            } catch (error) {
              console.warn('[Home] Error al procesar fecha de disponibilidad:', error);
              return false;
            }
          }).length;
          
          disponibilidadStats = {
            disponibles,
            total: disponibilidadesCompania.length
          };
        }

        setDashboardStats({
          bomberosStats,
          eppStats,
          disponibilidadStats,
          loading: false
        });
      } catch (error) {
        console.error('[Home] Error cargando estadísticas:', error);
        setDashboardStats(prev => ({ ...prev, loading: false }));
      }
    };

      loadDashboardStats();
  }, [bombero?.companiaId, companiaInfo?.id]);

  // Mantener companiaId estable para evitar parpadeo del banner
  useEffect(() => {
    const newCompaniaId = bombero?.companiaId || companiaInfo?.id;
    if (newCompaniaId && !stableCompaniaId) {
      setStableCompaniaId(newCompaniaId);
    }
  }, [bombero?.companiaId, companiaInfo?.id, stableCompaniaId]);

  const companiaId = stableCompaniaId || bombero?.companiaId || companiaInfo?.id;
  const companyName = companiaInfo?.nombre || 'Bomberos de Chile';
  const companyCity = companiaInfo?.comuna?.nombre || '';
  const companyRegion = companiaInfo?.comuna?.region?.nombre || '';
  const companyPhone = companiaInfo?.telefono || '';
  const companyEmail = companiaInfo?.email || '';
  const companyAddress = companiaInfo?.direccion?.calle ? 
    `${companiaInfo.direccion.calle}${companiaInfo.direccion.numero ? ` ${companiaInfo.direccion.numero}` : ''}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      {/* Hero Section con Banner */}
      <div className="relative overflow-hidden">
        {(companiaId || stableCompaniaId) ? (
          <div className="relative h-80 md:h-96">
            <CompaniaBanner
              compania={{ id: companiaId || stableCompaniaId }}
              nombre={companyName}
              size="hero"
              className="w-full h-full"
              alt={`Banner ${companyName}`}
              onFallback={setIsUsingFallback}
            />
            {!isUsingFallback && (
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                {/* Logo de la compañía - Solo mostrar si hay URL válida y no hay error */}
                {logoUrl && !logoError ? (
                  <div className="mb-6 flex justify-center">
                    <img 
                      src={logoUrl} 
                      alt={`Logo ${companyName}`}
                      className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-white/20 backdrop-blur-sm p-2 shadow-2xl object-contain"
                      onError={() => {
                        setLogoUrl(null);
                        setLogoError(true);
                      }}
                      onLoad={() => {
                        setLogoError(false);
                      }}
                    />
                  </div>
                ) : null}
                
                {/* Nombre de la compañía */}
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {loadingCompania ? (
                    <div className="inline-block h-12 w-64 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    companyName
                  )}
                </h1>
                
                {/* Mensaje de bienvenida */}
                <p className="text-xl md:text-2xl text-white/95 mb-6 drop-shadow-md">
                  {bombero ? (
                    <>¡Bienvenido/a de vuelta, <span className="font-semibold">{(() => {
                      const nombres = Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : (bombero.nombres || '');
                      const apellidos = Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : (bombero.apellidos || '');
                      return [nombres, apellidos].filter(Boolean).join(' ');
                    })()}</span>!</>
                  ) : (
                    'Sistema de Gestión para Cuerpos de Bomberos'
                  )}
                </p>
                
                {/* Ubicación */}
                {(companyCity || companyRegion) && !loadingCompania && (
                  <div className="flex items-center justify-center text-white/90 mb-2 drop-shadow-md">
                    <MdLocationOn className="h-5 w-5 mr-2" />
                    <span>{companyCity}{companyRegion && `, ${companyRegion}`}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-red-700">
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <MdLocalFireDepartment className="h-20 w-20 text-white drop-shadow-lg" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  {loadingCompania ? 'Cargando...' : companyName}
                </h1>
                <p className="text-xl md:text-2xl text-white/95 mb-6 drop-shadow-md">
                  {bombero ? (
                    <>¡Bienvenido/a de vuelta, <span className="font-semibold">{(() => {
                      const nombres = Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : (bombero.nombres || '');
                      const apellidos = Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : (bombero.apellidos || '');
                      return [nombres, apellidos].filter(Boolean).join(' ');
                    })()}</span>!</>
                  ) : (
                    'Sistema de Gestión para Cuerpos de Bomberos'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 mt-2">
        {/* Estadísticas Principales */}
        <section className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Estadísticas de la Compañía
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Personal Disponible */}
              <div 
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate('/disponibilidad')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Personal Disponible</p>
                    <p className="text-3xl font-bold text-green-600">
                      {dashboardStats.disponibilidadStats?.disponibles ?? '--'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      de {dashboardStats.bomberosStats?.bomberosActivos ?? '--'} bomberos
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <MdGroup className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
              
              {/* Total de Bomberos */}
              <div 
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate('/bomberos')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Bomberos</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {dashboardStats.loading ? '--' : (dashboardStats.bomberosStats?.totalSistema ?? 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Registrados en el sistema
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MdPeople className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
              {/* EPP Disponibles */}
              <div 
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate('/inventario-epp')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">EPP Disponibles</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {dashboardStats.loading ? '--' : (dashboardStats.eppStats?.eppsDisponibles ?? 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {dashboardStats.eppStats?.porcentajeDisponibilidad ?? 0}% del inventario
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <MdSecurity className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
              
              {/* Bomberos con Licencia */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Con Licencia F</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {dashboardStats.loading ? '--' : (dashboardStats.bomberosStats?.bomberosConLicencia ?? 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {dashboardStats.bomberosStats?.porcentajeConLicencia ?? 0}% del personal
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <MdCheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Información Adicional */}
        <div className={`grid grid-cols-1 ${isConnected ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 mb-8`}>
          {/* Estado de Conexión - Solo se muestra cuando está conectado */}
          {isConnected && (
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Estado de Conexión</h3>
                <div className="p-2 rounded-full bg-green-100">
                  <MdSchedule className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Bomberos en línea</span>
                  <span className="text-lg font-semibold text-green-600">
                    {activeBomberos}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Estado</span>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                    Conectado
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Inventario EPP */}
          <div 
            className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => navigate('/inventario-epp')}
          >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Inventario EPP</h3>
              <div className="p-2 bg-orange-100 rounded-full">
                <MdInventory className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total EPP</span>
                <span className="text-lg font-semibold text-slate-900">
                  {dashboardStats.loading ? '--' : (dashboardStats.eppStats?.totalEpps ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Asignados</span>
                <span className="text-lg font-semibold text-slate-900">
                  {dashboardStats.loading ? '--' : (dashboardStats.eppStats?.eppsAsignados ?? 0)}
                  </span>
                </div>

              </div>
            </div>

          {/* Estadísticas de Personal */}
          <div 
            className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => navigate('/bomberos')}
          >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Personal</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <MdTrendingUp className="h-6 w-6 text-blue-600" />
              </div>
                </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Habilitados</span>
                <span className="text-lg font-semibold text-green-600">
                  {dashboardStats.loading ? '--' : (dashboardStats.bomberosStats?.bomberosActivos ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Deshabilitados</span>
                <span className="text-lg font-semibold text-gray-600">
                  {dashboardStats.loading ? '--' : (dashboardStats.bomberosStats?.bomberosInactivos ?? 0)}
                  </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        {(companyAddress || companyPhone || companyEmail) && (
          <section className="mb-8">
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <MdLocalFireDepartment className="h-6 w-6 text-red-600 mr-2" />
                Información de Contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {companyAddress && (
                  <div className="flex items-start">
                    <MdLocationOn className="h-5 w-5 text-slate-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{companyAddress}</span>
                  </div>
                )}
                {companyPhone && (
                  <div className="flex items-start">
                    <MdPhone className="h-5 w-5 text-slate-500 mr-3 mt-0.5 flex-shrink-0" />
                    <a href={`tel:${companyPhone}`} className="text-slate-700 hover:text-blue-600 transition-colors">
                      {companyPhone}
                    </a>
                  </div>
                )}
                {companyEmail && (
                  <div className="flex items-start">
                    <MdEmail className="h-5 w-5 text-slate-500 mr-3 mt-0.5 flex-shrink-0" />
                    <a href={`mailto:${companyEmail}`} className="text-slate-700 hover:text-blue-600 transition-colors">
                      {companyEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 pb-8 text-slate-500">
          <p className="text-sm">
            © {new Date().getFullYear()} {companyName}. Sistema de Gestión para Cuerpos de Bomberos.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
