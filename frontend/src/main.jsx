import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Login from '@pages/Login';
import Home from '@pages/Home';
import Admin from '@pages/Admin';
import Demo from '@pages/Demo';
import Disponibilidad from '@pages/Disponibilidad';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Profile from '@pages/Profile';
import CrearParte from '@pages/crearParte';
import TestPermisos from '@pages/TestPermisos';
import EdiarParte from '@pages/editarParte';
import PartesDeEmergencias from '@pages/PartesDeEmergencias';
import VistaParte from '@pages/vistaParte.jsx';
import RevisionPartes from './pages/revisionPartes';
import VistaParteRevision from '@pages/vistaParteRevision.jsx';
import CalendarioOperativo from '@pages/calendarioOperativoAdmin.jsx';
import CalendarioOperativoBasic from '@pages/calendarioOperativoBasic.jsx';
import BomberosPage from '@pages/BomberosPage';
import InventarioEpp from '@pages/InventarioEpp';

import ProtectedRoute from '@components/ProtectedRoute';
import { FireAlertProvider } from '@components/FireAlertProvider';
import '@styles/styles.css';
// Estilos de PrimeReact
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
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: '/demo',
        element: (
          <ProtectedRoute>
            <Demo />
          </ProtectedRoute>
        ),
      },
      {
        path: '/disponibilidad',
        element: (
          <ProtectedRoute requiredPermisos={['disponibilidad:obtener']}>
            <Disponibilidad />
          </ProtectedRoute>
        ),
      },
      {
        path: "/perfil",
        element: (
          <ProtectedRoute requiredPermisos={['bombero:obtener_perfil']}>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/bomberos',
        element: (
          <ProtectedRoute requiredPermisos={['bombero:obtener']}>
            <BomberosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/test-permisos',
        element: <TestPermisos />
      },
      {
        path: '/crearparte',
        element: (
          <ProtectedRoute>
            <CrearParte />
          </ProtectedRoute>
        )
      },
      {
        path: '/editarparte/:id',
        element: (
          <ProtectedRoute>
            <EdiarParte />
          </ProtectedRoute>
        )
      },
      {
        path: '/partesdeemergencias',
        element: (
          <ProtectedRoute>
            <PartesDeEmergencias />
          </ProtectedRoute>
        )
      }
      ,
      {
        path: '/vistaparte/:id',
        element: (
          <ProtectedRoute>
            <VistaParte />
          </ProtectedRoute>
        )
      }
      ,
      {
        path: '/vistaparterev/:id',
        element: (
          <ProtectedRoute>
            <VistaParteRevision />
          </ProtectedRoute>
        )
      }
      ,
      {
        path: '/revisionpartes',
        element: (
          <ProtectedRoute>
            <RevisionPartes />
          </ProtectedRoute>
        )
      },
      {
        path: '/calendariooperativo',
        element: (
          <ProtectedRoute>
            <CalendarioOperativo />
          </ProtectedRoute>
        )
      },
      {
        path: '/calendariooperativobasic',
        element: (
          <ProtectedRoute>
            <CalendarioOperativoBasic />
          </ProtectedRoute>
        )
      },
      {
        path: '/inventario-epp',
        element: (
          <ProtectedRoute requiredPermisos={['bombero:obtener']}>
            <InventarioEpp />
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