import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { login } from "@services/auth.service.js";
import useLogin from "@hooks/auth/useLogin.jsx";
import { showErrorAlert } from "@helpers/fireAlert.js";
import Form from "@components/Form";
import { MdLocalFireDepartment, MdEmergency, MdGroup } from "react-icons/md";
import { useRutFormatter, formatRutForAPI } from "@helpers/rutFormatter.js";

const Login = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const { errorRut, errorPassword, errorData } = useLogin();

  // Hook para formateo de RUT
  const rutFormatter = useRutFormatter(
    (fieldName, value) => formRef.current?.setValue(fieldName, value),
    "run"
  );

  const loginSubmit = async (data) => {
    try {
      // Formatear RUT para API (sin puntos, solo guión)
      const formattedData = {
        ...data,
        run: formatRutForAPI(data.run),
      };

      const response = await login(formattedData);
      if (response.status === "Success") {
        navigate("/home");
      } else if (response.status === "Client error") {
        errorData(response.details);
        showErrorAlert("Acceso denegado", response.details.message);
      }
    } catch (error) {
      console.error("Error en login:", error);
      showErrorAlert("Error", "Error en la autenticación");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* Efectos de fondo sutiles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-5xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 flex overflow-hidden">
        {/* Lado izquierdo: formulario */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white/95 backdrop-blur-sm px-6 py-8">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3">
                <img src="/favicon.png" alt="Logo Bomberos" className="w-12 h-12 object-contain" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-1">
                Sistema Bomberos
              </h1>
              <p className="text-gray-600 text-base">Accede al sistema de gestión de emergencias</p>
            </div>

            <Form
              ref={formRef}
              title=""
              fields={[
                {
                  ...rutFormatter.getFieldConfig(),
                  errorMessageData: errorRut,
                  autoComplete: "username",
                },
                {
                  label: "Contraseña",
                  name: "password",
                  placeholder: "**********",
                  fieldType: "input",
                  type: "password",
                  required: true,
                  minLength: 8,
                  maxLength: 26,
                  pattern: /^[a-zA-Z0-9]+$/,
                  patternMessage: "Debe contener solo letras y números",
                  errorMessageData: errorPassword,
                  autoComplete: "current-password",
                },
              ]}
              buttonText="Iniciar sesión"
              onSubmit={loginSubmit}
              footerContent={
                <div className="text-center text-gray-400 text-xs mt-3">
                  <p className="leading-tight">
                    ¿No tienes cuenta o se te olvidaron tus credenciales? Contacta al administrador
                    del sistema.
                  </p>
                </div>
              }
            />
          </div>
        </div>
        {/* Lado derecho: Diseño moderno con iconos y gradientes */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-red-500 to-orange-600 relative overflow-hidden">
          {/* Efectos de fondo sutiles */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/3 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center text-white p-8">
            {/* Iconos flotantes */}
            <div className="relative mb-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="p-4 bg-white/15 backdrop-blur-sm rounded-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <MdLocalFireDepartment className="w-8 h-8" />
                </div>
                <div className="p-4 bg-white/15 backdrop-blur-sm rounded-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                  <MdEmergency className="w-8 h-8" />
                </div>
                <div className="p-4 bg-white/15 backdrop-blur-sm rounded-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <MdGroup className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <h2 className="text-4xl font-bold mb-4 text-white">Sistema de Gestión de Bomberos</h2>
            <p className="text-xl text-white/80 mb-6 max-w-md leading-relaxed">
              Plataforma integral para la gestión de emergencias, personal y recursos de la compañía
              de bomberos
            </p>

            {/* Características */}
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Gestión de personal y voluntarios</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Control de emergencias y servicios</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Administración de recursos y equipos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Reportes y estadísticas operacionales</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
