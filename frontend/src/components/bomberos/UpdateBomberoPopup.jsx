import React, { useState, useRef, useEffect } from "react";
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
import { updateBombero, getBomberoComplete } from "@services/bombero.service.js";
import fichaBomberoService from "@services/fichaBombero.service.js";
import { showErrorAlert } from "@helpers/fireAlert.js";
import { bomberoUpdatedToast } from "@helpers/toastHelper.jsx";
import { formatRutForDisplay } from "@helpers/rutFormatter.js";

export default function UpdateBomberoPopup({ show, setShow, data, onBomberoUpdated }) {
  const bomberoData = data || {};
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("bombero"); // 'bombero' o 'ficha'
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageError, setProfileImageError] = useState(null);
  const [existingProfileImageUrl, setExistingProfileImageUrl] = useState(null);
  const [fichaData, setFichaData] = useState(null);
  const [formData, setFormData] = useState({
    // Datos del bombero
    nombres: "",
    apellidos: "",
    run: "",
    email: "",
    newPassword: "",
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

  // Hooks para datos
  const { roles, loading: rolesLoading, fetchRoles } = useRoles();
  const { companias, loading: companiasLoading, fetchCompanias } = useCompania();

  // Preparar opciones para los selects de PrimeReact con useMemo
  const rolesOptions = React.useMemo(
    () =>
      roles.map((role) => ({
        id: role.id,
        nombre: role.nombre,
      })),
    [roles]
  );

  const companiasOptions = companias.map((compania) => ({
    value: String(compania.id),
    label: compania.nombre,
  }));

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

  // Cargar datos del bombero y su ficha cuando se abre el modal
  useEffect(() => {
    const loadBomberoData = async () => {
      if (show && bomberoData?.id) {
        setLoadingData(true);
        try {
          // Cargar datos completos del bombero con ficha
          const completeData = await getBomberoComplete(bomberoData.id);

          if (completeData && completeData.status === "Success" && completeData.data) {
            const bombero = completeData.data;
            const ficha = bombero.ficha;

            // Guardar datos de ficha si existen
            if (ficha) {
              setFichaData(ficha);

              // Si hay imagen de perfil, obtener la URL
              if (ficha.fotoPerfilURL || ficha.fotoPerfilKEY) {
                try {
                  const imageUrl = await fichaBomberoService.getProfileImageUrl(
                    ficha.fotoPerfilURL || ficha.fotoPerfilKEY
                  );
                  setExistingProfileImageUrl(imageUrl);
                } catch (error) {
                  console.error("Error al obtener URL de imagen:", error);
                }
              }

              // Prellenar datos de ficha
              setFormData((prev) => ({
                ...prev,
                idCompania: ficha.idCompania ? String(ficha.idCompania) : "", // Usar string vacío para campos opcionales
                licenciaClaseF: ficha.licenciaClaseF || false,
                telefono: ficha.telefono || "",
                fechaNacimiento: ficha.fechaNacimiento ? ficha.fechaNacimiento.split("T")[0] : "",
                fechaIngreso: ficha.fechaIngreso ? ficha.fechaIngreso.split("T")[0] : "",
                donante: ficha.donante || false,
              }));
            }

            // Prellenar datos del bombero - roles como array de IDs
            setFormData((prev) => ({
              ...prev,
              nombres: Array.isArray(bombero.nombres)
                ? bombero.nombres.join(" ")
                : bombero.nombres || "",
              apellidos: Array.isArray(bombero.apellidos)
                ? bombero.apellidos.join(" ")
                : bombero.apellidos || "",
              run: formatRutForDisplay(bombero.run || ""),
              email: bombero.email || "",
              activo: bombero.activo !== undefined ? bombero.activo : true,
              roles: bombero.roles ? bombero.roles.map((role) => role.id || role) : [],
            }));
          } else {
            // Si no se pueden cargar los datos completos, usar los datos básicos pasados
            console.warn("No se pudieron cargar los datos completos, usando datos básicos");
            setFormData((prev) => ({
              ...prev,
              nombres: Array.isArray(bomberoData.nombres)
                ? bomberoData.nombres.join(" ")
                : bomberoData.nombres || "",
              apellidos: Array.isArray(bomberoData.apellidos)
                ? bomberoData.apellidos.join(" ")
                : bomberoData.apellidos || "",
              run: formatRutForDisplay(bomberoData.run || ""),
              email: bomberoData.email || "",
              activo: bomberoData.activo !== undefined ? bomberoData.activo : true,
              roles: bomberoData.roles ? bomberoData.roles.map((role) => role.id || role) : [],
            }));
          }
        } catch (error) {
          console.error("Error al cargar datos del bombero:", error);
          // En caso de error, usar los datos básicos pasados
          setFormData((prev) => ({
            ...prev,
            nombres: Array.isArray(bomberoData.nombres)
              ? bomberoData.nombres.join(" ")
              : bomberoData.nombres || "",
            apellidos: Array.isArray(bomberoData.apellidos)
              ? bomberoData.apellidos.join(" ")
              : bomberoData.apellidos || "",
            run: formatRutForDisplay(bomberoData.run || ""),
            email: bomberoData.email || "",
            activo: bomberoData.activo !== undefined ? bomberoData.activo : true,
            roles: bomberoData.roles ? bomberoData.roles.map((role) => role.id || role) : [],
          }));
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadBomberoData();
  }, [show, bomberoData?.id]);

  // Cargar datos necesarios cuando se abre el modal
  useEffect(() => {
    if (show) {
      if (companias.length === 0) {
        fetchCompanias();
      }
      if (roles.length === 0) {
        fetchRoles(true);
      }
    }
  }, [show, companias.length, roles.length, fetchCompanias, fetchRoles]);

  // Limpiar estado al cerrar
  const handleClose = () => {
    setShow(false);
    setErrors({});
    setActiveTab("bombero");
    setProfileImage(null);
    setProfileImageError(null);
    setExistingProfileImageUrl(null);
    setFichaData(null);
    setLoading(false);
    setLoadingData(false);
    setFormData({
      nombres: "",
      apellidos: "",
      run: "",
      email: "",
      newPassword: "",
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

  // Manejar cambio de roles
  const handleRolesChange = (selectedRoles) => {
    handleInputChange("roles", selectedRoles);
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

    if (data.newPassword && data.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres";
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

      // Buscar el rol "Bombero"
      const bomberoRole = roles.find((role) => role.nombre === "Bombero");
      const bomberoRoleId = bomberoRole ? bomberoRole.id : null;

      // Obtener roles actuales desde react-hook-form o formData
      const currentRoles = formRef.current?.getValues
        ? formRef.current.getValues("roles") || formData.roles
        : formData.roles;

      // Asegurar que currentRoles sea un array de IDs
      const selectedRoleIds = Array.isArray(currentRoles) ? currentRoles : [];

      // Transformar datos del bombero para el backend
      const bomberoTransformedData = {
        run: formatRutForAPI(formData.run),
        nombres: formData.nombres
          ? formData.nombres.split(" ").filter((name) => name.trim() !== "")
          : [],
        apellidos: formData.apellidos
          ? formData.apellidos.split(" ").filter((apellido) => apellido.trim() !== "")
          : [],
        email: formData.email,
        ...(formData.newPassword && { password: formData.newPassword }),
        roles: selectedRoleIds,
      };

      // Actualizar bombero
      const bomberoResult = await onBomberoUpdated(
        bomberoTransformedData,
        bomberoData.run,
        bomberoData.id
      );

      if (!bomberoResult.success) {
        // Manejar errores estructurados del backend (Array de errores Joi)
        if (Array.isArray(bomberoResult.details)) {
          const errorObject = bomberoResult.details.reduce((acc, err) => {
            const fieldName = err.path.replace(/^(bomberoData\.|fichaData\.)/, "");
            acc[fieldName] = err.message;
            return acc;
          }, {});

          setErrors({
            ...errorObject,
            general: bomberoResult.message || "Error de validación",
          });
        }
        // Manejar objeto de errores
        else if (bomberoResult.details && typeof bomberoResult.details === "object") {
          setErrors({
            ...bomberoResult.details,
            general: bomberoResult.message || "Error de validación",
          });
        }
        // Fallback
        else {
          setErrors({
            general:
              bomberoResult.message || bomberoResult.error || "Error al actualizar el bombero",
          });
        }
        setLoading(false);
        return;
      }

      // Preparar datos de ficha si existen
      let fichaUpdateData = null;
      const hasFichaData =
        formData.idCompania ||
        profileImage ||
        formData.licenciaClaseF ||
        formData.telefono ||
        formData.fechaNacimiento ||
        formData.fechaIngreso ||
        formData.donante !== undefined;

      if (hasFichaData) {
        fichaUpdateData = {
          licenciaClaseF: formData.licenciaClaseF === "true" || formData.licenciaClaseF === true,
          telefono: formData.telefono || null,
          fechaNacimiento: formData.fechaNacimiento || null,
          fechaIngreso: formData.fechaIngreso || null,
          donante: formData.donante === "true" || formData.donante === true,
          idCompania: formData.idCompania ? parseInt(formData.idCompania) : null,
        };
      }

      // Actualizar o crear ficha
      if (fichaUpdateData || profileImage) {
        if (fichaData && fichaData.id) {
          // Actualizar ficha existente
          if (profileImage) {
            // Actualizar imagen de perfil
            const imageResult = await fichaBomberoService.updateProfileImage(
              fichaData.id,
              bomberoData.id,
              profileImage
            );

            if (imageResult.status !== "Success") {
              setErrors({
                general: imageResult.message || "Error al actualizar la imagen de perfil",
              });
              setLoading(false);
              return;
            }
          }

          // Actualizar otros datos de la ficha
          if (fichaUpdateData) {
            const fichaResult = await fichaBomberoService.updateFichaBombero(
              fichaData.id,
              fichaUpdateData
            );

            if (fichaResult.status !== "Success") {
              setErrors({ general: fichaResult.message || "Error al actualizar la ficha" });
              setLoading(false);
              return;
            }
          }
        } else if (hasFichaData) {
          // Crear nueva ficha
          const newFichaData = {
            ...fichaUpdateData,
            idBombero: bomberoData.id,
          };

          if (profileImage) {
            const fichaResult = await fichaBomberoService.createFichaBomberoWithImage(
              newFichaData,
              profileImage
            );

            if (fichaResult.status !== "Success") {
              setErrors({ general: fichaResult.message || "Error al crear la ficha" });
              setLoading(false);
              return;
            }
          } else {
            const fichaResult = await fichaBomberoService.createFichaBombero(newFichaData);

            if (fichaResult.status !== "Success") {
              setErrors({ general: fichaResult.message || "Error al crear la ficha" });
              setLoading(false);
              return;
            }
          }
        }
      }

      bomberoUpdatedToast();
      handleClose();
    } catch (error) {
      console.error("Error updating bombero:", error);
      setErrors({ general: "Error al actualizar el bombero" });
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
                <h2 className="text-xl font-bold text-white">Editar Bombero</h2>
                <p className="text-blue-100 text-sm">
                  Modifique la información del bombero y su ficha
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
              disabled={loading || loadingData}
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
              disabled={loading || loadingData}
            >
              <div className="flex items-center justify-center space-x-1">
                <MdInfo className="w-3 h-3" />
                <span>Ficha Adicional</span>
              </div>
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[65vh] bg-gray-50/50">
            {(loading || loadingData) && (
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
                      Modifique los datos esenciales del bombero en el sistema.
                    </p>
                  </div>
                </div>

                <Form
                  key={`bombero-form-${bomberoData?.id || "new"}-${
                    loadingData ? "loading" : "loaded"
                  }`}
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
                      label: "Nueva contraseña (opcional)",
                      name: "newPassword",
                      placeholder: "Dejar vacío para mantener la actual",
                      fieldType: "input",
                      type: "password",
                      required: false,
                      minLength: 8,
                      maxLength: 26,
                      pattern: /^[a-zA-Z0-9]+$/,
                      patternMessage: "Debe contener solo letras y números",
                      errorMessageData: errors.newPassword,
                      onChange: (e) => handleInputChange("newPassword", e.target.value),
                      autoComplete: "new-password",
                    },
                    {
                      label: "Roles",
                      name: "roles",
                      fieldType: "primereact-multiselect",
                      options: rolesOptions,
                      optionLabel: "nombre",
                      optionValue: "id",
                      defaultValue: formData.roles,
                      required: true,
                      placeholder: rolesLoading
                        ? "Cargando roles..."
                        : "Seleccionar roles adicionales...",
                      errorMessageData: errors.roles,
                      isLoading: rolesLoading,
                      filter: true,
                      filterPlaceholder: "Buscar roles...",
                      onChange: handleRolesChange,
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
                      defaultValue: formData.activo,
                      errorMessageData: errors.activo,
                      onChange: (e) => handleInputChange("activo", e.value),
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
                      Modifique información adicional del bombero como licencia de conducir, imagen
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
                  {existingProfileImageUrl && !profileImage && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 mb-2">Imagen actual:</p>
                      <img
                        src={existingProfileImageUrl}
                        alt="Imagen de perfil actual"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  <ImageUploader
                    onFileSelect={handleImageSelect}
                    onFileRemove={handleImageRemove}
                    value={profileImage}
                    error={profileImageError}
                    placeholder="Seleccionar nueva imagen de perfil..."
                    className="w-full"
                    acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </div>

                {/* Formulario de ficha */}
                <Form
                  key={`ficha-form-${bomberoData?.id || "new"}-${
                    loadingData ? "loading" : "loaded"
                  }`}
                  ref={formRef}
                  title={null}
                  autoComplete="off"
                  size="w-full"
                  defaultValues={formData}
                  fields={[
                    {
                      label: "Compañía",
                      name: "idCompania",
                      fieldType: "select",
                      placeholder: companiasLoading
                        ? "Cargando compañías..."
                        : "Seleccionar compañía (opcional)",
                      options: companiasOptions,
                      defaultValue: formData.idCompania
                        ? typeof formData.idCompania === "string"
                          ? formData.idCompania
                          : String(formData.idCompania)
                        : "",
                      errorMessageData: errors.idCompania,
                      onChange: (e) => handleInputChange("idCompania", e.target.value),
                      isLoading: companiasLoading,
                    },
                    {
                      label: "Licencia de Conducir Clase F",
                      name: "licenciaClaseF",
                      fieldType: "select",
                      placeholder: "¿Tiene licencia de conducir?",
                      options: [
                        { value: "true", label: "Sí, tiene licencia Clase F" },
                        { value: "false", label: "No tiene licencia" },
                      ],
                      defaultValue:
                        formData.licenciaClaseF === true || formData.licenciaClaseF === "true"
                          ? "true"
                          : "false",
                      errorMessageData: errors.licenciaClaseF,
                      onChange: (e) => handleInputChange("licenciaClaseF", e.target.value),
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
                      fieldType: "input",
                      type: "date",
                      errorMessageData: errors.fechaNacimiento,
                      onChange: (e) => handleInputChange("fechaNacimiento", e.target.value),
                    },
                    {
                      label: "Fecha de Ingreso",
                      name: "fechaIngreso",
                      fieldType: "input",
                      type: "date",
                      errorMessageData: errors.fechaIngreso,
                      onChange: (e) => handleInputChange("fechaIngreso", e.target.value),
                    },
                    {
                      label: "Es Donante de Órganos",
                      name: "donante",
                      fieldType: "select",
                      placeholder: "Seleccionar",
                      options: [
                        { value: "true", label: "Sí, es donante de órganos" },
                        { value: "false", label: "No es donante de órganos" },
                      ],
                      defaultValue: formData.donante ? "true" : "false",
                      errorMessageData: errors.donante,
                      onChange: (e) => handleInputChange("donante", e.target.value),
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
                disabled={loading || loadingData}
              >
                <MdClose className="w-4 h-4 text-red-500" />
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  loading || loadingData ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading || loadingData}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <MdSave className="w-4 h-4" />
                    <span>Actualizar Bombero</span>
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

UpdateBomberoPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  data: PropTypes.object,
  onBomberoUpdated: PropTypes.func.isRequired,
};
