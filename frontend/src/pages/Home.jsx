import React from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import { 
    MdPerson,
    MdSettings,
    MdBarChart,
    MdDescription,
    MdSecurity,
    MdStorage,
    MdCloud,
    MdSpeed,
    MdCode,
    MdDevices,
    MdBuild,
    MdCheckCircle,
    MdRocket,
    MdShield,
    MdApi,
    MdDashboard,
    MdFolder,
    MdWeb,
    MdPlayArrow,
    MdLightbulb
} from 'react-icons/md';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen text-slate-800 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Sección de Bienvenida */}
        <header className="text-center my-12 md:my-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <MdRocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Plantilla PERN
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 mb-4">
            <strong>PostgreSQL + Express + React + Node.js</strong>
          </p>
          <p className="max-w-4xl mx-auto text-base md:text-lg text-slate-600 leading-relaxed">
            Una plantilla completa y moderna para desarrollo full-stack con autenticación JWT, 
            sistema de roles y permisos, base de datos PostgreSQL con PostGIS, logging profesional 
            con Winston, y una interfaz React responsive con Tailwind CSS.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Full-Stack</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Production Ready</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Docker Support</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">TypeScript Ready</span>
          </div>
        </header>

        {/* Stack Tecnológico */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Stack Tecnológico</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <MdStorage className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">PostgreSQL</h3>
              <p className="text-slate-600 text-sm">Base de datos relacional con PostGIS para datos geoespaciales y Sequelize ORM</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center hover:shadow-xl transition-shadow">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <MdApi className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Express.js</h3>
              <p className="text-slate-600 text-sm">API REST robusta con middleware de seguridad, validación y manejo de errores</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center hover:shadow-xl transition-shadow">
              <div className="bg-cyan-100 p-3 rounded-full w-fit mx-auto mb-4">
                <MdDevices className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">React</h3>
              <p className="text-slate-600 text-sm">Interfaz moderna con hooks, React Router y componentes reutilizables</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center hover:shadow-xl transition-shadow">
              <div className="bg-emerald-100 p-3 rounded-full w-fit mx-auto mb-4">
                <MdCode className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Node.js</h3>
              <p className="text-slate-600 text-sm">Runtime JavaScript con arquitectura escalable y manejo asíncrono</p>
            </div>
          </div>
        </section>

        {/* Características Principales */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Características Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-3 rounded-full w-fit mb-4">
                <MdSecurity className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Autenticación JWT</h3>
              <p className="text-slate-600 text-sm">Sistema completo de autenticación con tokens JWT, refresh tokens y middleware de protección</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full w-fit mb-4">
                <MdShield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Roles y Permisos</h3>
              <p className="text-slate-600 text-sm">Sistema granular de roles y permisos con control de acceso basado en recursos</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 p-3 rounded-full w-fit mb-4">
                <MdBarChart className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Logging Winston</h3>
              <p className="text-slate-600 text-sm">Sistema profesional de logs con niveles, rotación automática y múltiples transportes</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 p-3 rounded-full w-fit mb-4">
                <MdSpeed className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Hot Reload</h3>
              <p className="text-slate-600 text-sm">Desarrollo ágil con recarga automática en frontend (Vite) y backend (Nodemon)</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="bg-teal-100 p-3 rounded-full w-fit mb-4">
                <MdCloud className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Docker Ready</h3>
              <p className="text-slate-600 text-sm">Configuración completa con Docker Compose para desarrollo y producción</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="bg-pink-100 p-3 rounded-full w-fit mb-4">
                <MdBuild className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Tailwind CSS</h3>
              <p className="text-slate-600 text-sm">Diseño responsive y moderno con utility-first CSS framework</p>
            </div>
          </div>
        </section>

        {/* Información del Usuario */}
        {user && (
          <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Tu Información</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Nombre</p>
                <p className="font-semibold text-slate-800">{user.name || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-semibold text-slate-800">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Roles</p>
                <p className="font-semibold text-slate-800">
                  {user.roles?.map(role => role.name).join(', ') || 'Sin roles asignados'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Estado</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Arquitectura y Estructura */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Arquitectura del Proyecto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
               <div className="flex items-center mb-3">
                 <MdFolder className="h-6 w-6 text-blue-600 mr-2" />
                 <h3 className="text-lg font-semibold text-slate-800">Backend</h3>
               </div>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Controladores RESTful
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Middleware de autenticación
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Modelos Sequelize
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Validación con Joi
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Logging con Winston
                </li>
              </ul>
            </div>
            <div className="space-y-4">
               <div className="flex items-center mb-3">
                 <MdWeb className="h-6 w-6 text-cyan-600 mr-2" />
                 <h3 className="text-lg font-semibold text-slate-800">Frontend</h3>
               </div>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  Componentes reutilizables
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  Hooks personalizados
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  Context API para estado
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  React Router v6
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  Axios para HTTP
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <MdBuild className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-slate-800">DevOps</h3>
              </div>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Docker Compose
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Variables de entorno
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Scripts de desarrollo
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Migraciones automáticas
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Configuración de producción
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Guía de Inicio Rápido */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Guía de Inicio Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="flex items-center mb-3">
                 <MdPlayArrow className="h-6 w-6 text-green-600 mr-2" />
                 <h3 className="text-lg font-semibold text-slate-800">Instalación</h3>
               </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <code className="text-sm text-slate-700 block">
                  <div>1. git clone [repository]</div>
                  <div>2. npm install</div>
                  <div>3. docker-compose up -d</div>
                  <div>4. npm run dev</div>
                </code>
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center mb-3">
                 <MdLightbulb className="h-6 w-6 text-yellow-600 mr-2" />
                 <h3 className="text-lg font-semibold text-slate-800">Configuración</h3>
               </div>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Configura .env con tus credenciales
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Ejecuta migraciones de base de datos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Crea el usuario administrador inicial
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Personaliza roles y permisos
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <MdRocket className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">¡Comienza tu Proyecto Ahora!</h2>
          <p className="text-blue-100 mb-6 text-lg max-w-2xl mx-auto">
            Esta plantilla PERN te proporciona una base sólida y profesional para desarrollar aplicaciones web modernas, 
            escalables y listas para producción en tiempo récord.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <MdSpeed className="h-8 w-8 text-white mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Desarrollo Rápido</h3>
              <p className="text-blue-100 text-sm">Estructura lista para usar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <MdSecurity className="h-8 w-8 text-white mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Seguridad Integrada</h3>
              <p className="text-blue-100 text-sm">JWT y control de acceso</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <MdCloud className="h-8 w-8 text-white mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Deploy Fácil</h3>
              <p className="text-blue-100 text-sm">Docker y configuración lista</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
              <MdDescription className="inline h-5 w-5 mr-2" />
              Ver Documentación
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              <MdCode className="inline h-5 w-5 mr-2" />
              Explorar Código
            </button>
          </div>
        </section>

        <footer className="text-center mt-16 pb-8 text-slate-500">
          <p>© {new Date().getFullYear()} Plantilla PERN. Lista para tu próximo proyecto.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;