import ReactDOM from 'react-dom/client';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from '@pages/Login';
import Home from '@pages/Home';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';

// Lazy loading para páginas menos críticas (se cargan bajo demanda)
// Páginas lazy: Admin, Demo, Disponibilidad, Profile, CrearParte, EditarParte,
//               PartesDeEmergencias, VistaParte, RevisionPartes, VistaParteRevision,
//               CalendarioOperativo, CalendarioOperativoBasic, BomberosPage, InventarioEpp
// Páginas inmediatas: Login, Home, Error404, Root (críticas para el funcionamiento básico)
const Admin = lazy(() => import('@pages/Admin'));
const Demo = lazy(() => import('@pages/Demo'));
const Disponibilidad = lazy(() => import('@pages/Disponibilidad'));
const Profile = lazy(() => import('@pages/Profile'));
const CrearParte = lazy(() => import('@pages/crearParte'));
const EdiarParte = lazy(() => import('@pages/editarParte'));
const PartesDeEmergencias = lazy(() => import('@pages/PartesDeEmergencias'));
const VistaParte = lazy(() => import('@pages/vistaParte.jsx'));
const RevisionPartes = lazy(() => import('./pages/revisionPartes'));
const VistaParteRevision = lazy(() => import('@pages/vistaParteRevision.jsx'));
const VistaPartePdf = lazy(() => import('@pages/vistaPartePdf.jsx'));
const CalendarioOperativo = lazy(() => import('@pages/CalendarioOperativoAdmin.jsx'));
const CalendarioOperativoBasic = lazy(() => import('@pages/CalendarioOperativoBasic.jsx'));
const BomberosPage = lazy(() => import('@pages/BomberosPage'));
const InventarioEpp = lazy(() => import('@pages/InventarioEpp'));
const PuntosInteres = lazy(() => import('@pages/PuntosInteres'));

// Componente de carga para lazy loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4EB9FA]"></div>
  </div>
);

import ProtectedRoute from '@components/ProtectedRoute';
import { FireAlertProvider } from '@components/FireAlertProvider';
import '@styles/styles.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )
      },
      {
        path: '/home',
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute requiredPermisos={['bombero:obtener', 'bombero:crear', 'bombero:obtener_especifico', 'bombero:actualizar', 'bombero:eliminar', 'bombero:cambiar_estado', 'bombero:asignar_rol', 'bombero:admin', 'rol:obtener', 'rol:admin', 'permiso:obtener', 'permiso:admin', 'compania:obtener', 'compania:obtener_especifico', 'compania:admin', 'region:obtener', 'region:admin', 'comuna:obtener', 'comuna:admin', 'disponibilidad:obtener', 'disponibilidad:crear', 'disponibilidad:actualizar', 'disponibilidad:admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <Admin />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/demo',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Demo />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/disponibilidad',
        element: (
          <ProtectedRoute requiredPermisos={['disponibilidad:obtener']}>
            <Suspense fallback={<LoadingSpinner />}>
              <Disponibilidad />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/perfil",
        element: (
          <ProtectedRoute requiredPermisos={['bombero:obtener_perfil']}>
            <Suspense fallback={<LoadingSpinner />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/bomberos',
        element: (
          <ProtectedRoute requiredPermisos={['bombero:obtener']}>
            <Suspense fallback={<LoadingSpinner />}>
              <BomberosPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/crearparte',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <CrearParte />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '/editarparte/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <EdiarParte />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '/partesdeemergencias',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <PartesDeEmergencias />
            </Suspense>
          </ProtectedRoute>
        )
      }
      ,
      {
        path: '/vistaparte/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VistaParte />
            </Suspense>
          </ProtectedRoute>
        )
      }
      ,
      {
        path: '/vistaparterev/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VistaParteRevision />
            </Suspense>
          </ProtectedRoute>
        )
      }
      ,
      {
        path: '/vistaparte/:id/pdf',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VistaPartePdf />
            </Suspense>
          </ProtectedRoute>
        )
      }
      ,
      {
        path: '/revisionpartes',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <RevisionPartes />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '/calendariooperativo',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <CalendarioOperativo />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '/calendariooperativobasic',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <CalendarioOperativoBasic />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '/inventario-epp',
        element: (
          <ProtectedRoute requiredPermisos={['bombero:obtener']}>
            <Suspense fallback={<LoadingSpinner />}>
              <InventarioEpp />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/puntos-interes',
        element: (
          <ProtectedRoute requiredPermisos={['puntoGeografico:obtener', 'puntoGeografico:admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <PuntosInteres />
            </Suspense>
          </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: '/auth',
    element: <Login />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/404',
    element: <Error404 />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <FireAlertProvider>
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
      }}
    />
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  </FireAlertProvider>
)