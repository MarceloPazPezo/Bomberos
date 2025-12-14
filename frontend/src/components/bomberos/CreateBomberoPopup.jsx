import React, { useState, useRef, useEffect, useMemo } from "react";
import Form from "../Form";
import LoadingSpinner from "@components/LoadingSpinner";
import ImageUploader from "@components/FileUpload/ImageUploader";
import ModalPortal from "@components/ModalPortal";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import {
  MdClose,
  MdPersonAdd,
  MdSave,
  MdPhotoCamera,
  MdDriveEta,
  MdPerson,
  MdInfo,
} from "react-icons/md";
import PropTypes from "prop-types";
import { useRoles } from "@hooks/roles/useRoles";
import { useCompania } from "@hooks/compania/useCompania";
import { createBomberoIntelligent } from "@services/bombero.service.js";
import { bomberoCreatedToast } from "@helpers/toastHelper.jsx";
import { showErrorAlert } from "@helpers/fireAlert.js";

export default function CreateBomberoPopup({ show, setShow, onBomberoCreated }) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("bombero"); // 'bombero' o 'ficha'
  const [bomberoData, setBomberoData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageError, setProfileImageError] = useState(null);
  const [formData, setFormData] = useState({
    // Datos del bombero
    nombres: "",
    apellidos: "",
    run: "",
    email: "",
    password: "",
    roles: [],
    activo: true,
    // Datos de la ficha
    idCompania: "",
    licenciaClaseF: false,
    telefono: "",
    fechaNacimiento: "",
    fechaIngreso: "",
    donante: false,
  });
  const formRef = useRef(null);
  const rolesInitializedRef = useRef(false);

  // Hooks para datos
  const { roles, loading: rolesLoading, fetchRoles } = useRoles();
  const { companias, loading: companiasLoading, fetchCompanias } = useCompania();

  // Preparar opciones para los selects de PrimeReact
  const rolesOptions = useMemo(() => {
    const options = roles.map((role) => ({
      id: role.id,
      nombre: role.nombre,
    }));
    console.log("🔍 [CreateBombero] rolesOptions preparadas:", options);
    return options;
  }, [roles]);

  const companiasOptions = companias.map((compania) => ({
    value: compania.id,
    label: compania.nombre,
  }));

  // Obtener el rol "Bombero" por defecto
  const bomberoRoleDefault = useMemo(() => {
    const bomberoRole = rolesOptions.find((role) => role.nombre === "Bombero");
    const defaultValue = bomberoRole ? [bomberoRole.id] : [];
    console.log("🔍 [CreateBombero] bomberoRoleDefault:", defaultValue);
    return defaultValue;
  }, [rolesOptions]);

  // Función para enfocar el primer campo con error
  const focusFirstErrorField = () => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (fieldElement) {
        fieldElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setTimeout(() => {
          fieldElement.focus();
        }, 300);
      }
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      focusFirstErrorField();
    }
  }, [errors]);

  // Cargar compañías cuando se abre el modal
  useEffect(() => {
    if (show && companias.length === 0) {
      fetchCompanias();
    }
  }, [show, companias.length, fetchCompanias]);

  // Cargar roles cuando se abre el modal
  useEffect(() => {
    if (show && roles.length === 0) {
      fetchRoles(true);
    }
  }, [show, roles.length, fetchRoles]);

  // Inicializar roles con el valor por defecto solo una vez cuando se abre el modal y se cargan los roles
  useEffect(() => {
    // Solo inicializar cuando se abre el modal y los roles están cargados
    if (show && roles.length > 0 && !rolesInitializedRef.current && bomberoRoleDefault.length > 0) {
      // Usar setTimeout para asegurar que el Form esté montado
      const timer = setTimeout(() => {
        // Verificar que no haya un valor ya establecido (para no sobrescribir selecciones del usuario)
        const currentRoles = formRef.current?.getValues?.("roles");
        if (!currentRoles || (Array.isArray(currentRoles) && currentRoles.length === 0)) {
          // Sincronizar con react-hook-form primero
          if (formRef.current?.setValue) {
            formRef.current.setValue("roles", bomberoRoleDefault);
          }
          // Luego actualizar formData
          setFormData((prev) => ({
            ...prev,
            roles: bomberoRoleDefault,
          }));
        }
        rolesInitializedRef.current = true;
      }, 200);
      return () => clearTimeout(timer);
    }
    // Resetear el flag cuando se cierra el modal
    if (!show) {
      rolesInitializedRef.current = false;
    }
  }, [show, roles.length, bomberoRoleDefault.length]); // Depende de show y cuando los roles se cargan

  // Limpiar estado al cerrar
  const handleClose = () => {
    setShow(false);
    setErrors({});
    setActiveTab("bombero");
    setBomberoData(null);
    setProfileImage(null);
    setProfileImageError(null);
    setLoading(false);
    setFormData({
      nombres: "",
      apellidos: "",
      run: "",
      email: "",
      password: "",
      roles: [],
      activo: true,
      idCompania: "",
      licenciaClaseF: false,
      telefono: "",
      fechaNacimiento: "",
      fechaIngreso: "",
      donante: false,
    });
  };

  // Manejar cambio de input
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Manejar selección de imagen
  const handleImageSelect = (file) => {
    setProfileImage(file);
    setProfileImageError(null);
  };

  const handleImageRemove = () => {
    setProfileImage(null);
    setProfileImageError(null);
  };

  // Validar datos del bombero
  const validateBomberoData = (data) => {
    const newErrors = {};

    if (!data.nombres || data.nombres.trim().length < 2) {
      newErrors.nombres = "Los nombres son requeridos (mínimo 2 caracteres)";
    }

    if (!data.apellidos || data.apellidos.trim().length < 2) {
      newErrors.apellidos = "Los apellidos son requeridos (mínimo 2 caracteres)";
    }

    if (!data.run || !/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(data.run)) {
      newErrors.run = "RUT inválido. Formato: 12.345.678-9";
    }

    if (!data.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
      newErrors.email = "Email inválido";
    }

    if (!data.password || data.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (!data.roles || data.roles.length === 0) {
      newErrors.roles = "Debe seleccionar al menos un rol";
    }

    return newErrors;
  };

  // Validar datos de la ficha (opcional)
  const validateFichaData = (data) => {
    const newErrors = {};

    if (data.telefono && !/^\+?[\d\s\-\(\)]+$/.test(data.telefono)) {
      newErrors.telefono = "Formato de teléfono inválido";
    }

    return newErrors;
  };

  // Manejar submit completo
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Validar datos del bombero
      const bomberoErrors = validateBomberoData(formData);
      const fichaErrors = validateFichaData(formData);

      if (Object.keys(bomberoErrors).length > 0 || Object.keys(fichaErrors).length > 0) {
        setErrors({ ...bomberoErrors, ...fichaErrors });
        setLoading(false);
        return;
      }

      // Formatear RUT para API
      const formatRutForAPI = (rut) => {
        if (!rut) return "";
        return rut.replace(/\./g, "");
      };

      // Obtener los valores actuales del formulario (incluyendo roles desde react-hook-form)
      const currentRoles = formRef.current?.getValues
        ? formRef.current.getValues("roles") || formData.roles
        : formData.roles;

      // Transformar datos del bombero para el backend
      // currentRoles ahora es un array de IDs directamente
      const selectedRoleIds = Array.isArray(currentRoles) ? currentRoles : [];

      // Buscar el rol "Bombero" y agregarlo solo si no está ya incluido
      const bomberoRole = roles.find((role) => role.nombre === "Bombero");
      const bomberoRoleId = bomberoRole ? bomberoRole.id : null;

      // Agregar el rol "Bombero" solo si no está ya en la selección
      const finalRoles =
        bomberoRoleId && !selectedRoleIds.includes(bomberoRoleId)
          ? [bomberoRoleId, ...selectedRoleIds]
          : selectedRoleIds;

      const bomberoTransformedData = {
        run: formatRutForAPI(formData.run),
        nombres: formData.nombres
          ? formData.nombres.split(" ").filter((name) => name.trim() !== "")
          : [],
        apellidos: formData.apellidos
          ? formData.apellidos.split(" ").filter((apellido) => apellido.trim() !== "")
          : [],
        email: formData.email,
        password: formData.password,
        roles: finalRoles,
        activo: formData.activo !== undefined ? formData.activo : true,
      };

      // Preparar datos de ficha si existen
      let fichaData = null;
      if (
        formData.idCompania ||
        profileImage ||
        formData.licenciaClaseF ||
        formData.telefono ||
        formData.fechaNacimiento ||
        formData.fechaIngreso ||
        formData.donante
      ) {
        fichaData = {
          licenciaClaseF: formData.licenciaClaseF === true || formData.licenciaClaseF === "true",
          telefono: formData.telefono || null,
          fechaNacimiento: formData.fechaNacimiento || null,
          fechaIngreso: formData.fechaIngreso || null,
          donante: formData.donante === true || formData.donante === "true",
          idCompania: formData.idCompania ? parseInt(formData.idCompania) : null,
          idDireccion: formData.idDireccion ? parseInt(formData.idDireccion) : null,
          idTipoSangre: formData.idTipoSangre ? parseInt(formData.idTipoSangre) : null,
        };
      }

      // Crear bombero con ficha e imagen de forma inteligente
      const result = await createBomberoIntelligent(
        bomberoTransformedData,
        fichaData,
        profileImage
      );

      if (!result.success) {
        // Manejar errores estructurados del backend (Array de errores Joi)
        if (Array.isArray(result.details)) {
          const errorObject = result.details.reduce((acc, err) => {
            // Limpiar prefijos de rutas (bomberoData.run -> run, fichaData.telefono -> telefono)
            const fieldName = err.path.replace(/^(bomberoData\.|fichaData\.)/, "");
            acc[fieldName] = err.message;
            return acc;
          }, {});

          setErrors({
            ...errorObject,
            general: result.message || "Error de validación",
          });
        }
        // Manejar objeto de errores (formato legacy o alternativo)
        else if (result.details && typeof result.details === "object") {
          setErrors({
            ...result.details,
            general: result.message || "Error de validación",
          });
        }
        // Manejar error string simple
        else {
          setErrors({ general: result.message || "Error al crear el bombero" });
        }
        setLoading(false);
        return;
      }

      bomberoCreatedToast();

      // Llamar al callback si existe
      if (onBomberoCreated) {
        onBomberoCreated(result.data);
      }

      handleClose();
    } catch (error) {
      console.error("Error creating bombero:", error);
      // Asegurarse de no renderizar objetos
      const errorMessage = typeof error === "string" ? error : "Error al crear el bombero";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg">
                <MdPersonAdd className="w-6 h-6 text-[#3A9BD9]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Registrar Nuevo Bombero</h2>
                <p className="text-blue-100 text-sm">
                  Complete la información básica y opcionalmente la ficha del bombero
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-lg transition-colors"
              disabled={loading}
            >
              <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
            </button>
          </div>

          {/* Pestañas */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("bombero")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "bombero"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              disabled={loading}
            >
              <div className="flex items-center justify-center space-x-1">
                <MdPerson className="w-3 h-3" />
                <span>Datos Generales</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("ficha")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "ficha"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              disabled={loading}
            >
              <div className="flex items-center justify-center space-x-1">
                <MdInfo className="w-3 h-3" />
                <span>Ficha Adicional</span>
              </div>
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[65vh] bg-gray-50/50">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <LoadingSpinner />
              </div>
            )}

            {activeTab === "bombero" ? (
              // Pestaña 1: Datos básicos del bombero
              <div className="space-y-6">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MdPerson className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 text-sm">
                      Información Básica del Bombero
                    </h3>
                    <p className="text-blue-700 text-xs mt-1">
                      Complete los datos esenciales para crear la cuenta del bombero en el sistema.
                    </p>
                  </div>
                </div>

                <Form
                  ref={formRef}
                  title={null}
                  autoComplete="off"
                  size="w-full"
                  defaultValues={formData}
                  fields={[
                    {
                      label: "Nombres",
                      name: "nombres",
                      placeholder: "Ingrese los nombres",
                      fieldType: "input",
                      type: "text",
                      required: true,
                      minLength: 2,
                      maxLength: 50,
                      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑàèìòùÀÈÌÒÙ\s]+$/,
                      errorMessageData: errors.nombres,
                      onChange: (e) => handleInputChange("nombres", e.target.value),
                      autoComplete: "off",
                    },
                    {
                      label: "Apellidos",
                      name: "apellidos",
                      placeholder: "Ingrese los apellidos",
                      fieldType: "input",
                      type: "text",
                      required: true,
                      minLength: 2,
                      maxLength: 50,
                      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑàèìòùÀÈÌÒÙ\s]+$/,
                      errorMessageData: errors.apellidos,
                      onChange: (e) => handleInputChange("apellidos", e.target.value),
                      autoComplete: "off",
                    },
                    {
                      label: "RUT",
                      name: "run",
                      placeholder: "12.345.678-9",
                      fieldType: "input",
                      type: "text",
                      required: true,
                      minLength: 11,
                      maxLength: 12,
                      pattern: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
                      patternMessage: "Formato válido: 12.345.678-9",
                      errorMessageData: errors.run,
                      onChange: (e) => {
                        let value = e.target.value.replace(/[^\dkK]/g, "");
                        if (value.length > 1) {
                          value =
                            value.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") +
                            "-" +
                            value.slice(-1);
                        }
                        e.target.value = value;
                        handleInputChange("run", value);
                      },
                      autoComplete: "off",
                    },
                    {
                      label: "Correo electrónico",
                      name: "email",
                      placeholder: "example@gmail.com",
                      fieldType: "input",
                      type: "email",
                      required: true,
                      minLength: 5,
                      maxLength: 255,
                      pattern:
                        /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|live\.com|msn\.com|icloud\.com|me\.com|[a-zA-Z0-9.-]+\.cl)$/,
                      patternMessage: "Debe usar un dominio permitido",
                      errorMessageData: errors.email,
                      onChange: (e) => handleInputChange("email", e.target.value),
                      autoComplete: "new-email",
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
                      errorMessageData: errors.password,
                      onChange: (e) => handleInputChange("password", e.target.value),
                      autoComplete: "new-password",
                    },
                    {
                      label: "Roles",
                      name: "roles",
                      fieldType: "primereact-multiselect",
                      options: rolesOptions,
                      optionLabel: "nombre",
                      optionValue: "id",
                      required: true,
                      placeholder: rolesLoading ? "Cargando roles..." : "Seleccionar roles...",
                      errorMessageData: errors.roles,
                      isLoading: rolesLoading,
                      filter: true,
                      filterPlaceholder: "Buscar roles...",
                    },
                    {
                      label: "Estado",
                      name: "activo",
                      fieldType: "primereact-dropdown",
                      required: true,
                      placeholder: "Seleccionar estado",
                      options: [
                        { value: true, label: "Habilitado" },
                        { value: false, label: "Deshabilitado" },
                      ],
                      optionLabel: "label",
                      optionValue: "value",
                      defaultValue: true,
                      errorMessageData: errors.activo,
                      onChange: (e) => {
                        // Sincronizar formData cuando cambia el valor
                        const value = e.value ?? true;
                        handleInputChange("activo", value);
                      },
                    },
                  ]}
                  onSubmit={() => {}} // No submit en esta pestaña
                  backgroundColor={"#fff"}
                />
              </div>
            ) : (
              // Pestaña 2: Ficha del bombero (opcional)
              <div className="space-y-6">
                <div className="flex items-start space-x-3 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MdInfo className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 text-sm">
                      Información Adicional (Opcional)
                    </h3>
                    <p className="text-green-700 text-xs mt-1">
                      Complete información adicional del bombero como licencia de conducir, imagen
                      de perfil y datos de contacto.
                    </p>
                  </div>
                </div>

                {/* Imagen de perfil */}
                <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl w-full mx-auto">
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                    <div className="flex items-center gap-1">
                      <MdPhotoCamera className="w-5 h-5 text-[#2C3E50]" />
                      <span>Imagen de Perfil</span>
                      <span className="text-xs text-gray-500 font-normal ml-1">(Opcional)</span>
                    </div>
                  </label>
                  <ImageUploader
                    onFileSelect={handleImageSelect}
                    onFileRemove={handleImageRemove}
                    value={profileImage}
                    error={profileImageError}
                    placeholder="Seleccionar imagen de perfil..."
                    className="w-full"
                    acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                    maxSize={5 * 1024 * 1024} // 5MB
                    // cropSize={null} - Usar tamaño mínimo de la imagen automáticamente
                  />
                </div>

                {/* Formulario de ficha */}
                <Form
                  ref={formRef}
                  title={null}
                  autoComplete="off"
                  size="w-full"
                  defaultValues={formData}
                  fields={[
                    {
                      label: "Compañía",
                      name: "idCompania",
                      fieldType: "react-select",
                      placeholder: companiasLoading
                        ? "Cargando compañías..."
                        : "Seleccionar compañía (opcional)",
                      options: companiasOptions,
                      errorMessageData: errors.idCompania,
                      isLoading: companiasLoading,
                      onChange: (e) => {
                        const value = e.target?.value ?? "";
                        handleInputChange("idCompania", value);
                      },
                    },
                    {
                      label: "Licencia de Conducir Clase F",
                      name: "licenciaClaseF",
                      fieldType: "react-select",
                      placeholder: "¿Tiene licencia de conducir?",
                      options: [
                        { value: true, label: "Sí, tiene licencia Clase F" },
                        { value: false, label: "No tiene licencia" },
                      ],
                      defaultValue: false,
                      errorMessageData: errors.licenciaClaseF,
                      onChange: (e) => {
                        const value = e.target?.value ?? false;
                        handleInputChange("licenciaClaseF", value);
                      },
                    },
                    {
                      label: "Teléfono",
                      name: "telefono",
                      placeholder: "+56 9 1234 5678",
                      fieldType: "input",
                      type: "tel",
                      maxLength: 15,
                      errorMessageData: errors.telefono,
                      onChange: (e) => handleInputChange("telefono", e.target.value),
                      autoComplete: "tel",
                    },
                    {
                      label: "Fecha de Nacimiento",
                      name: "fechaNacimiento",
                      fieldType: "datepicker",
                      placeholder: "Seleccionar fecha de nacimiento",
                      errorMessageData: errors.fechaNacimiento,
                      onChange: (e) => handleInputChange("fechaNacimiento", e.target.value),
                      maxDate: new Date().toISOString().split("T")[0], // No puede ser mayor a hoy
                    },
                    {
                      label: "Fecha de Ingreso",
                      name: "fechaIngreso",
                      fieldType: "datepicker",
                      placeholder: "Seleccionar fecha de ingreso",
                      errorMessageData: errors.fechaIngreso,
                      onChange: (e) => handleInputChange("fechaIngreso", e.target.value),
                      maxDate: new Date().toISOString().split("T")[0], // No puede ser mayor a hoy
                    },
                    {
                      label: "Es Donante de Órganos",
                      name: "donante",
                      fieldType: "react-select",
                      placeholder: "Seleccionar",
                      options: [
                        { value: true, label: "Sí, es donante de órganos" },
                        { value: false, label: "No es donante de órganos" },
                      ],
                      defaultValue: false,
                      errorMessageData: errors.donante,
                      onChange: (e) => {
                        const value = e.target?.value ?? false;
                        handleInputChange("donante", value);
                      },
                    },
                  ]}
                  onSubmit={() => {}} // No submit en esta pestaña
                  backgroundColor={"#fff"}
                />
              </div>
            )}

            {/* Error general */}
            {errors.general && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center space-x-2 px-4 py-2.5 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 font-medium"
                disabled={loading}
              >
                <MdClose className="w-4 h-4 text-red-500" />
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <MdSave className="w-4 h-4" />
                    <span>Registrar Bombero</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

CreateBomberoPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  onBomberoCreated: PropTypes.func.isRequired,
};
