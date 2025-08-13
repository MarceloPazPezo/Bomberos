import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Admin from '@pages/Admin';
import Disponibilidad from '@pages/Disponibilidad';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Profile from '@pages/Profile';
import TestRoles from '@pages/TestRoles';

import ProtectedRoute from '@components/ProtectedRoute';
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
          <ProtectedRoute requiredPermissions={['usuario:leer_todos']}>
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: '/disponibilidad',
        element: (
          <ProtectedRoute requiredPermissions={['disponibilidad:read_all']}>
            <Disponibilidad />
          </ProtectedRoute>
        ),
      },
      {
        path: "/perfil",
        element: (
          <ProtectedRoute requiredPermissions={['usuario:leer_perfil']}>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/test-roles',
        element: <TestRoles />
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
  <RouterProvider router={router} />
)