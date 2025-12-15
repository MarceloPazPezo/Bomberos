/*
 * Sistema de Gestión de Bomberos
 * Copyright (C) 2025 Jerson Palma y Marcelo Paz
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import ReactDOM from "react-dom/client";
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PrimeReactProvider } from "primereact/api";
import Login from "@pages/Login";
import Home from "@pages/Home";
import Error404 from "@pages/Error404";
import Root from "@pages/Root";

// Lazy loading para páginas menos críticas (se cargan bajo demanda)
// Páginas lazy: Admin, Disponibilidad, Profile, CrearParte, EditarParte,
//               PartesDeEmergencias, VistaParte, RevisionPartes, VistaParteRevision,
//               CalendarioOperativo, CalendarioOperativoBasic, BomberosPage, InventarioEpp
// Páginas inmediatas: Login, Home, Error404, Root (críticas para el funcionamiento básico)
const Admin = lazy(() => import("@pages/Admin"));
const Disponibilidad = lazy(() => import("@pages/Disponibilidad"));
const Profile = lazy(() => import("@pages/Profile"));
const CrearParte = lazy(() => import("@pages/crearParte"));
const EdiarParte = lazy(() => import("@pages/editarParte"));
const PartesDeEmergencias = lazy(() => import("@pages/PartesDeEmergencias"));
const VistaParte = lazy(() => import("@pages/vistaParte.jsx"));
const RevisionPartes = lazy(() => import("./pages/revisionPartes"));
const VistaParteRevision = lazy(() => import("@pages/vistaParteRevision.jsx"));
const VistaPartePdf = lazy(() => import("@pages/vistaPartePdf.jsx"));
const VistaFichaBomberoPdf = lazy(() => import("@pages/VistaFichaBomberoPdf.jsx"));
const VistaActaEventoPdf = lazy(() => import("@pages/VistaActaEventoPdf.jsx"));
const CalendarioOperativo = lazy(() => import("@pages/CalendarioOperativoAdmin.jsx"));
const CalendarioOperativoBasic = lazy(() => import("@pages/CalendarioOperativoBasic.jsx"));
const BomberosPage = lazy(() => import("@pages/BomberosPage"));
const InventarioEpp = lazy(() => import("@pages/InventarioEpp"));
const Mapa = lazy(() => import("@pages/Mapa"));
const Dashboard = lazy(() => import("@pages/Dashboard"));

// Componente de carga para lazy loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4EB9FA]"></div>
  </div>
);

import ProtectedRoute from "@components/ProtectedRoute";
import "@styles/styles.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute
            requiredPermisos={[
              "bombero:obtener",
              "bombero:crear",
              "bombero:obtener_especifico",
              "bombero:actualizar",
              "bombero:eliminar",
              "bombero:cambiar_estado",
              "bombero:asignar_rol",
              "bombero:admin",
              "rol:obtener",
              "rol:admin",
              "permiso:obtener",
              "permiso:admin",
              "compania:obtener",
              "compania:obtener_especifico",
              "compania:admin",
              "region:obtener",
              "region:admin",
              "comuna:obtener",
              "comuna:admin",
              "disponibilidad:obtener",
              "disponibilidad:crear",
              "disponibilidad:actualizar",
              "disponibilidad:admin",
            ]}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <Admin />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/disponibilidad",
        element: (
          <ProtectedRoute requiredPermisos={["disponibilidad:obtener"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <Disponibilidad />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/perfil",
        element: (
          <ProtectedRoute requiredPermisos={["bombero:obtener_perfil"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/bomberos",
        element: (
          <ProtectedRoute requiredPermisos={["bombero:obtener"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <BomberosPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/crear-parte",
        element: (
          <ProtectedRoute requiredPermisos={["parte_emergencia:crear", "parte_emergencia:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <CrearParte />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/editar-parte/:id",
        element: (
          <ProtectedRoute
            requiredPermisos={["parte_emergencia:actualizar", "parte_emergencia:admin"]}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <EdiarParte />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/partes-de-emergencias",
        element: (
          <ProtectedRoute requiredPermisos={["parte_emergencia:obtener", "parte_emergencia:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <PartesDeEmergencias />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/vista-parte/:id",
        element: (
          <ProtectedRoute requiredPermisos={["parte_emergencia:obtener", "parte_emergencia:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <VistaParte />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/vistaparterev/:id",
        element: (
          <ProtectedRoute requiredPermisos={["parte_emergencia:revisar", "parte_emergencia:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <VistaParteRevision />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/vista-parte/:id/pdf",
        element: (
          <ProtectedRoute requiredPermisos={["parte_emergencia:revisar", "parte_emergencia:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <VistaPartePdf />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/ficha-bombero/:id/pdf",
        element: (
          <ProtectedRoute requiredPermisos={["bombero:actualizar", "bombero:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <VistaFichaBomberoPdf />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/calendario/evento/:id/acta/pdf",
        element: (
          <ProtectedRoute requiredPermisos={["evento:obtener", "evento:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <VistaActaEventoPdf />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/revisar-parte",
        element: (
          <ProtectedRoute requiredPermisos={["parte_emergencia:revisar", "parte_emergencia:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <RevisionPartes />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/calendario-admin",
        element: (
          <ProtectedRoute requiredPermisos={["evento:crear", "evento:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <CalendarioOperativo />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/calendario",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <CalendarioOperativoBasic />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/inventario-epp",
        element: (
          <ProtectedRoute requiredPermisos={["bombero:obtener"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <InventarioEpp />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/mapa",
        element: (
          <ProtectedRoute requiredPermisos={["puntoGeografico:obtener", "puntoGeografico:admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <Mapa />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/404",
    element: <Error404 />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <PrimeReactProvider value={{ ripple: true }}>
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
      pauseOnHover
      theme="light"
      icon={false}
    />
  </PrimeReactProvider>
);
