import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from '@pages/Login';
import Home from '@pages/Home';
import Admin from '@pages/Admin';
import Demo from '@pages/Demo';
import Disponibilidad from '@pages/Disponibilidad';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Profile from '@pages/Profile';
import TestRoles from '@pages/TestRoles';
import TestPermisos from '@pages/TestPermisos';

import ProtectedRoute from '@components/ProtectedRoute';
import { FireAlertProvider } from '@components/FireAlertProvider';
import '@styles/styles.css';

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
        path: '/test-roles',
        element: <TestRoles />
      },
      {
        path: '/test-permisos',
        element: <TestPermisos />
      },

    ]
  },
  {
    path: '/auth',
    element: <Login />
  },
  {
    path: '/login',
    element: <Login />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <FireAlertProvider>
    <RouterProvider router={router} />
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