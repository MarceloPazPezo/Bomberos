import React, { useState, useRef } from "react";
import Form from "@components/Form";
import LoadingSpinner from "@components/LoadingSpinner";
import ImageUploader from "@components/FileUpload/ImageUploader";
import ModalPortal from "@components/ModalPortal";
import {
  MdClose,
  MdBusiness,
  MdSave,
  MdInfo,
  MdError,
  MdImage,
  MdLanguage,
  MdDescription,
  MdDelete,
  MdLocationOn,
} from "react-icons/md";
import PropTypes from "prop-types";
import { useCompania } from "@hooks/compania/useCompania";
import { useDireccion } from "@hooks/direccion/useDireccion";
import { useRegion } from "@hooks/region/useRegion";
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from "@helpers/fireAlert.js";
import { toStartCase } from "@helpers/textFormatters.js";
import { toast } from "react-toastify";
import Select from "react-select";
import GoogleMapPicker from "@components/maps/GoogleMapPicker";

export default function CreateCompaniaPopup({
  show,
  setShow,
  onCompaniaCreated,
  onCreatingChange,
}) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fechaFundacion: "",
    descripcion: "",
    sitioWeb: "",
    logo: null,
    logoPreview: null,
    banner: null,
    bannerPreview: null,
    idDireccion: null,
    direccion: {
      idRegion: "",
      idComuna: "",
      calle: "",
      numero: "",
      depto: "",
      referencia: "",
      codigoPostal: "",
      latitud: null,
      longitud: null,
    },
  });
  const [mapLocation, setMapLocation] = useState(null);
  const formRef = useRef(null);

  // Hooks
  const { createCompania } = useCompania();
  const { createDireccion, updateDireccion } = useDireccion();
  const {
    regiones: regionesRaw,
    comunas: comunasRaw,
    fetchComunasByRegion,
    loading: loadingRegionesComunas,
  } = useRegion();

  const regiones = Array.isArray(regionesRaw) ? regionesRaw : [];
  const comunas = Array.isArray(comunasRaw) ? comunasRaw : [];

  // Limpiar formulario al cerrar
  const handleClose = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      fechaFundacion: "",
      descripcion: "",
      sitioWeb: "",
      logo: null,
      logoPreview: null,
      banner: null,
      bannerPreview: null,
      idDireccion: null,
      direccion: {
        idRegion: "",
        idComuna: "",
        calle: "",
        numero: "",
        depto: "",
        referencia: "",
        codigoPostal: "",
        latitud: null,
        longitud: null,
      },
    });
    setMapLocation(null);
    setErrors({});
    setLoading(false);
    if (onCreatingChange) {
      onCreatingChange(false);
    }
    setShow(false);
  };

  // Validar un campo específico
  const validateField = (field, value) => {
    if (field === "nombre") {
      if (!value || value.trim() === "") {
        return "El nombre de la compañía es requerido";
      } else if (value.trim().length < 2) {
        return "El nombre debe tener al menos 2 caracteres";
      } else if (value.trim().length > 100) {
        return "El nombre no puede exceder 100 caracteres";
      }
    } else if (field === "email") {
      if (value && value.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return "Ingrese un email válido";
        } else if (value.trim().length > 100) {
          return "El email no puede exceder 100 caracteres";
        }
      }
    } else if (field === "telefono") {
      if (value && value.trim() !== "") {
        const phoneRegex = /^[\+]?[- 0-9()]{8,15}$/;
        if (!phoneRegex.test(value.trim())) {
          return "Ingrese un teléfono válido (8-15 dígitos)";
        }
      }
    } else if (field === "fechaFundacion") {
      if (value && value.trim() !== "") {
        const date = new Date(value);
        const today = new Date();
        if (date > today) {
          return "La fecha de fundación no puede ser futura";
        } else if (date.getFullYear() < 1800) {
          return "La fecha de fundación no puede ser anterior a 1800";
        }
      }
    } else if (field === "sitioWeb") {
      if (value && value.trim() !== "") {
        const urlRegex = /^https?:\/\/.+\..+/;
        if (!urlRegex.test(value.trim())) {
          return "Ingrese una URL válida (ej: https://ejemplo.com)";
        }
      }
    } else if (field === "logo") {
      if (value && value instanceof File) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(value.type)) {
          return "Solo se permiten archivos JPG, PNG, WEBP o GIF";
        }
        if (value.size > 5 * 1024 * 1024) {
          return "El archivo no puede ser mayor a 5MB";
        }
      }
    } else if (field === "banner") {
      if (value && value instanceof File) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(value.type)) {
          return "Solo se permiten archivos JPG, PNG, WEBP o GIF";
        }
        if (value.size > 5 * 1024 * 1024) {
          return "El archivo no puede ser mayor a 5MB";
        }
      }
    }
    return null;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    const fieldError = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  // Manejar subida de imagen con recorte 1:1
  const handleImageSelect = (file) => {
    if (file) {
      const fieldError = validateField("logo", file);
      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          logo: fieldError,
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          logo: file,
          logoPreview: e.target.result,
        }));
      };
      reader.readAsDataURL(file);

      setErrors((prev) => ({
        ...prev,
        logo: null,
      }));
    }
  };

  // Eliminar imagen
  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      logo: null,
      logoPreview: null,
    }));
    setErrors((prev) => ({
      ...prev,
      logo: null,
    }));
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fieldError = validateField("banner", file);
      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          banner: fieldError,
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          banner: file,
          bannerPreview: e.target.result,
        }));
      };
      reader.readAsDataURL(file);

      setErrors((prev) => ({
        ...prev,
        banner: null,
      }));
    }
  };

  const removeBanner = () => {
    setFormData((prev) => ({
      ...prev,
      banner: null,
      bannerPreview: null,
    }));
    setErrors((prev) => ({
      ...prev,
      banner: null,
    }));
  };

  // Manejadores de dirección
  const handleDireccionChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      direccion: {
        ...prev.direccion,
        [field]: value,
      },
    }));
  };

  const handleRegionSelect = (option) => {
    const regionId = option ? option.value?.toString() : "";
    handleDireccionChange("idRegion", regionId);
    handleDireccionChange("idComuna", "");
    setMapLocation(null);
    if (regionId) {
      fetchComunasByRegion(regionId);
    } else {
      fetchComunasByRegion(null);
    }
  };

  const handleComunaSelect = (option) => {
    const comunaId = option ? option.value?.toString() : "";
    handleDireccionChange("idComuna", comunaId);
  };

  const handleLocationSelect = (location) => {
    if (location) {
      setMapLocation(location);
      handleDireccionChange("latitud", location.lat);
      handleDireccionChange("longitud", location.lng);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    console.log("[CreateCompania] validateForm iniciado - formData:", formData);

    // Validar nombre (requerido)
    if (!formData.nombre || formData.nombre.trim() === "") {
      newErrors.nombre = "El nombre de la compañía es requerido";
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = "El nombre no puede exceder 100 caracteres";
    }

    // Validar email (opcional pero debe ser válido si se proporciona)
    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Ingrese un email válido";
      } else if (formData.email.trim().length > 100) {
        newErrors.email = "El email no puede exceder 100 caracteres";
      }
    }

    // Validar teléfono (opcional pero debe ser válido si se proporciona)
    if (formData.telefono && formData.telefono.trim() !== "") {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      if (!phoneRegex.test(formData.telefono.trim())) {
        newErrors.telefono = "Ingrese un teléfono válido (8-15 dígitos)";
      }
    }

    // Validar fecha de fundación (opcional pero debe ser válida si se proporciona)
    if (formData.fechaFundacion && formData.fechaFundacion.trim() !== "") {
      const date = new Date(formData.fechaFundacion);
      const today = new Date();
      if (date > today) {
        newErrors.fechaFundacion = "La fecha de fundación no puede ser futura";
      } else if (date.getFullYear() < 1800) {
        newErrors.fechaFundacion = "La fecha de fundación no puede ser anterior a 1800";
      }
    }

    // Validar sitio web (opcional pero debe ser válido si se proporciona)
    if (formData.sitioWeb && formData.sitioWeb.trim() !== "") {
      const urlRegex = /^https?:\/\/.+\..+/;
      if (!urlRegex.test(formData.sitioWeb.trim())) {
        newErrors.sitioWeb = "Ingrese una URL válida (ej: https://ejemplo.com)";
      }
    }

    // Validar logo (opcional pero debe ser válido si se proporciona)
    if (formData.logo && formData.logo instanceof File) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(formData.logo.type)) {
        newErrors.logo = "Solo se permiten archivos JPG, PNG o GIF";
      } else if (formData.logo.size > 5 * 1024 * 1024) {
        newErrors.logo = "El archivo no puede ser mayor a 5MB";
      }
    }

    // Validar banner (opcional pero debe ser válido si se proporciona)
    if (formData.banner && formData.banner instanceof File) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(formData.banner.type)) {
        newErrors.banner = "Solo se permiten archivos JPG, PNG o GIF";
      } else if (formData.banner.size > 5 * 1024 * 1024) {
        newErrors.banner = "El archivo no puede ser mayor a 5MB";
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log("[CreateCompania] validateForm resultado:", { isValid, errores: newErrors });
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    console.log("[CreateCompania] handleSubmit iniciado");
    if (!validateForm()) {
      console.log("[CreateCompania] Validación falló, abortando submit");
      return;
    }

    console.log("[CreateCompania] Iniciando proceso de guardado");
    setLoading(true);
    setErrors({});
    if (onCreatingChange) {
      onCreatingChange(true);
    }

    try {
      // Verificar si hay datos de dirección
      const hasDireccionData =
        formData.direccion.idRegion ||
        formData.direccion.idComuna ||
        formData.direccion.calle ||
        formData.direccion.numero;

      console.log("[CreateCompania] Tiene datos de dirección:", hasDireccionData);
      let idDireccion = null;

      // Si hay datos de dirección, crear la dirección primero
      if (hasDireccionData) {
        // Validar campos obligatorios de dirección
        if (
          !formData.direccion.idRegion ||
          !formData.direccion.idComuna ||
          !formData.direccion.calle ||
          !formData.direccion.numero
        ) {
          toast.error(
            "Por favor complete los campos obligatorios de la dirección: Región, Comuna, Calle y Número",
            {
              position: "bottom-right",
              autoClose: 4000,
            }
          );
          setLoading(false);
          if (onCreatingChange) {
            onCreatingChange(false);
          }
          return;
        }

        // Preparar datos de dirección
        const direccionData = {
          idComuna: parseInt(formData.direccion.idComuna),
          calle: formData.direccion.calle.trim(),
          numero: formData.direccion.numero.trim(),
          ...(formData.direccion.depto && { depto: formData.direccion.depto.trim() }),
          ...(formData.direccion.referencia && {
            referencia: formData.direccion.referencia.trim(),
          }),
          ...(formData.direccion.codigoPostal && {
            codigoPostal: formData.direccion.codigoPostal.trim(),
          }),
          ...(formData.direccion.latitud && { latitud: formData.direccion.latitud }),
          ...(formData.direccion.longitud && { longitud: formData.direccion.longitud }),
        };

        console.log("[CreateCompania] Creando dirección con datos:", direccionData);
        // Crear dirección
        const [direccionCreada, errorDireccion] = await createDireccion(direccionData);
        console.log("[CreateCompania] Respuesta de createDireccion:", {
          direccionCreada,
          errorDireccion,
        });

        if (errorDireccion) {
          toast.error("Error al crear la dirección: " + errorDireccion, {
            position: "bottom-right",
            autoClose: 4000,
          });
          setLoading(false);
          if (onCreatingChange) {
            onCreatingChange(false);
          }
          return;
        }

        if (direccionCreada && direccionCreada.id) {
          idDireccion = direccionCreada.id;
          console.log("[CreateCompania] Dirección creada con ID:", idDireccion);
        } else {
          toast.error("Error al crear la dirección: No se obtuvo ID", {
            position: "bottom-right",
            autoClose: 4000,
          });
          setLoading(false);
          if (onCreatingChange) {
            onCreatingChange(false);
          }
          return;
        }
      }

      // Preparar datos para crear compañía
      const dataToSend = {
        nombre: formData.nombre.trim(),
        ...(formData.email && formData.email.trim() !== "" && { email: formData.email.trim() }),
        ...(formData.telefono &&
          formData.telefono.trim() !== "" && { telefono: formData.telefono.trim() }),
        ...(formData.fechaFundacion &&
          formData.fechaFundacion.trim() !== "" && { fechaFundacion: formData.fechaFundacion }),
        ...(formData.descripcion &&
          formData.descripcion.trim() !== "" && { descripcion: formData.descripcion.trim() }),
        ...(formData.sitioWeb &&
          formData.sitioWeb.trim() !== "" && { sitioWeb: formData.sitioWeb.trim() }),
        ...(idDireccion && { idDireccion: idDireccion }),
      };

      const result = await createCompania(dataToSend, formData.logo, formData.banner);

      if (result.success) {
        // Si se creó la dirección con coordenadas, actualizar para crear punto geográfico
        if (
          idDireccion &&
          formData.direccion.latitud &&
          formData.direccion.longitud &&
          result.data.id
        ) {
          console.log("[CreateCompania] Actualizando dirección con punto geográfico:", {
            idDireccion,
            idCompania: result.data.id,
            latitud: formData.direccion.latitud,
            longitud: formData.direccion.longitud,
          });
          try {
            const [direccionActualizada, errorDireccion] = await updateDireccion(idDireccion, {
              idCompania: result.data.id,
              latitud: formData.direccion.latitud,
              longitud: formData.direccion.longitud,
              nombrePunto: `Cuartel ${formData.nombre}`,
              descripcionPunto: `Ubicación de ${formData.nombre}`,
            });

            if (errorDireccion) {
              console.error("[CreateCompania] Error al actualizar dirección:", errorDireccion);
            } else {
              console.log(
                "[CreateCompania] Dirección actualizada con punto geográfico:",
                direccionActualizada
              );
            }
          } catch (error) {
            console.error("[CreateCompania] Error al crear punto geográfico:", error);
            // No bloquear el flujo si falla la creación del punto
          }
        } else {
          console.log("[CreateCompania] No se actualizó dirección:", {
            idDireccion,
            tieneLatitud: !!formData.direccion.latitud,
            tieneLongitud: !!formData.direccion.longitud,
            tieneCompaniaId: !!result.data.id,
          });
        }

        // Mostrar notificación de éxito
        toast.success(`¡Compañía "${formData.nombre}" creada exitosamente!`, {
          position: "bottom-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        handleClose();
        if (onCompaniaCreated) {
          onCompaniaCreated();
        }
      } else {
        // Manejar errores de validación del campo (unicidad)
        if (result.message && result.message.includes("Ya existe una compañía con ese nombre")) {
          setErrors({ nombre: "Ya existe una compañía con ese nombre" });
        } else if (
          result.message &&
          result.message.includes("Ya existe una compañía con ese correo electrónico")
        ) {
          setErrors({ email: "Ya existe una compañía con ese correo electrónico" });
        }
        // Los demás errores ya los maneja el hook con FireAlert
      }
    } catch (error) {
      console.error("Error creating compañía:", error);

      // Manejar errores de unicidad del backend
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes("Ya existe una compañía con ese nombre")) {
          setErrors({ nombre: "Ya existe una compañía con ese nombre" });
        } else if (message.includes("Ya existe una compañía con ese correo electrónico")) {
          setErrors({ email: "Ya existe una compañía con ese correo electrónico" });
        }
      }
      // Los demás errores ya los maneja el hook con FireAlert
    } finally {
      setLoading(false);
      if (onCreatingChange) {
        onCreatingChange(false);
      }
    }
  };

  if (!show) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg">
                <MdBusiness className="w-6 h-6 text-[#3A9BD9]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Crear Compañía</h2>
                <p className="text-blue-100 text-sm">
                  Agregue una nueva compañía de bomberos al sistema
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

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Formulario */}
            <div className="space-y-6">
              <Form
                ref={formRef}
                fields={[
                  {
                    label: "Nombre de la Compañía",
                    name: "nombre",
                    fieldType: "input",
                    type: "text",
                    placeholder: "Ej: Primera Compañía de Bomberos de Santiago",
                    required: true,
                    minLength: 2,
                    maxLength: 100,
                    errorMessageData: errors.nombre,
                    onChange: (e) => handleInputChange("nombre", e.target.value),
                    value: formData.nombre,
                    autoComplete: "off",
                  },
                  {
                    label: "Email (Opcional)",
                    name: "email",
                    fieldType: "input",
                    type: "email",
                    placeholder: "compania@bomberos.cl",
                    maxLength: 100,
                    errorMessageData: errors.email,
                    onChange: (e) => handleInputChange("email", e.target.value),
                    value: formData.email,
                    autoComplete: "off",
                  },
                  {
                    label: "Teléfono (Opcional)",
                    name: "telefono",
                    fieldType: "input",
                    type: "tel",
                    placeholder: "+56 9 1234 5678",
                    maxLength: 15,
                    errorMessageData: errors.telefono,
                    onChange: (e) => handleInputChange("telefono", e.target.value),
                    value: formData.telefono,
                    autoComplete: "off",
                  },
                  {
                    label: "Fecha de Fundación (Opcional)",
                    name: "fechaFundacion",
                    fieldType: "datepicker",
                    placeholder: "Seleccionar fecha de fundación",
                    maxDate: new Date().toISOString().split("T")[0], // No permitir fechas futuras
                    minDate: "1800-01-01", // No permitir fechas anteriores a 1800
                    errorMessageData: errors.fechaFundacion,
                    onChange: (e) => handleInputChange("fechaFundacion", e.target.value),
                    value: formData.fechaFundacion,
                  },
                  {
                    label: "Descripción (Opcional)",
                    name: "descripcion",
                    fieldType: "textarea",
                    placeholder: "Breve descripción de la compañía...",
                    maxLength: 500,
                    rows: 3,
                    errorMessageData: errors.descripcion,
                    onChange: (e) => handleInputChange("descripcion", e.target.value),
                    value: formData.descripcion,
                  },
                  {
                    label: "Sitio Web (Opcional)",
                    name: "sitioWeb",
                    fieldType: "input",
                    type: "url",
                    placeholder: "https://www.ejemplo.com",
                    errorMessageData: errors.sitioWeb,
                    onChange: (e) => handleInputChange("sitioWeb", e.target.value),
                    value: formData.sitioWeb,
                    autoComplete: "off",
                  },
                  {
                    label: "Banner de la Compañía (Opcional)",
                    name: "banner",
                    fieldType: "banner",
                    accept: "image/jpeg,image/jpg,image/png,image/gif",
                    helpText: "JPG, PNG o GIF (máx. 5MB) - Recomendado: 1200x400px",
                    preview: formData.bannerPreview,
                    onChange: handleBannerUpload,
                    onRemove: removeBanner,
                    errorMessageData: errors.banner,
                  },
                ]}
                onSubmit={() => {}} // No submit en el formulario, manejamos con botón
                backgroundColor={"#fff"}
              />

              {/* Dirección de la Compañía */}
              <div className="w-full pt-4 border-t border-gray-200">
                <label className="block text-sm font-semibold text-[#2C3E50] mb-4">
                  <div className="flex items-center gap-2">
                    <MdLocationOn className="w-4 h-4 text-[#4EB9FA]" />
                    <span>Dirección de la Compañía (Opcional)</span>
                  </div>
                </label>

                {/* Región y Comuna con Select */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Región */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Región</label>
                    <Select
                      isClearable
                      isSearchable
                      isDisabled={loading || loadingRegionesComunas}
                      options={regiones.map((r) => ({
                        value: r.id.toString(),
                        label: r.nombre,
                      }))}
                      value={
                        formData.direccion?.idRegion
                          ? {
                              value: formData.direccion.idRegion.toString(),
                              label:
                                regiones.find(
                                  (r) => r.id.toString() === formData.direccion.idRegion.toString()
                                )?.nombre || "",
                            }
                          : null
                      }
                      onChange={handleRegionSelect}
                      placeholder="Seleccionar región..."
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: state.isFocused ? "#4EB9FA" : "#D1D5DB",
                          borderWidth: "2px",
                          boxShadow: state.isFocused ? "0 0 0 3px rgba(78, 185, 250, 0.1)" : "none",
                          "&:hover": { borderColor: "#4EB9FA" },
                          minHeight: "42px",
                          borderRadius: "10px",
                        }),
                        menu: (base) => ({
                          ...base,
                          borderRadius: "10px",
                          zIndex: 50,
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#4EB9FA"
                            : state.isFocused
                            ? "#E0F2FE"
                            : "white",
                          color: state.isSelected ? "#FFFFFF" : "#1F2937",
                        }),
                      }}
                    />
                  </div>

                  {/* Comuna */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comuna</label>
                    <Select
                      isClearable
                      isSearchable
                      isDisabled={
                        loading || loadingRegionesComunas || !formData.direccion?.idRegion
                      }
                      options={comunas.map((c) => ({
                        value: c.id.toString(),
                        label: c.nombre,
                      }))}
                      value={
                        formData.direccion?.idComuna
                          ? {
                              value: formData.direccion.idComuna.toString(),
                              label:
                                comunas.find(
                                  (c) => c.id.toString() === formData.direccion.idComuna.toString()
                                )?.nombre || "",
                            }
                          : null
                      }
                      onChange={handleComunaSelect}
                      placeholder={
                        !formData.direccion?.idRegion
                          ? "Seleccione región primero"
                          : "Seleccionar comuna..."
                      }
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: state.isFocused ? "#4EB9FA" : "#D1D5DB",
                          borderWidth: "2px",
                          boxShadow: state.isFocused ? "0 0 0 3px rgba(78, 185, 250, 0.1)" : "none",
                          "&:hover": { borderColor: "#4EB9FA" },
                          minHeight: "42px",
                          borderRadius: "10px",
                        }),
                        menu: (base) => ({
                          ...base,
                          borderRadius: "10px",
                          zIndex: 50,
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#4EB9FA"
                            : state.isFocused
                            ? "#E0F2FE"
                            : "white",
                          color: state.isSelected ? "#FFFFFF" : "#1F2937",
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Calle y Número */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calle/Sector
                    </label>
                    <input
                      type="text"
                      value={formData.direccion?.calle || ""}
                      onChange={(e) => handleDireccionChange("calle", e.target.value)}
                      disabled={loading}
                      placeholder="Ej: Av. Principal"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                    <input
                      type="text"
                      value={formData.direccion?.numero || ""}
                      onChange={(e) => handleDireccionChange("numero", e.target.value)}
                      disabled={loading}
                      placeholder="123"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Departamento y Código Postal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.direccion?.depto || ""}
                      onChange={(e) => handleDireccionChange("depto", e.target.value)}
                      disabled={loading}
                      placeholder="Depto 4A"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.direccion?.codigoPostal || ""}
                      onChange={(e) => handleDireccionChange("codigoPostal", e.target.value)}
                      disabled={loading}
                      placeholder="1234567"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Referencia */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referencia (Opcional)
                  </label>
                  <textarea
                    value={formData.direccion?.referencia || ""}
                    onChange={(e) => handleDireccionChange("referencia", e.target.value)}
                    disabled={loading}
                    placeholder="Cerca del supermercado, frente al parque..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Mapa */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación en el Mapa (Opcional)
                  </label>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <GoogleMapPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={
                        mapLocation &&
                        typeof mapLocation.lat === "number" &&
                        typeof mapLocation.lng === "number"
                          ? mapLocation
                          : null
                      }
                      disabled={loading || loadingRegionesComunas}
                      height="350px"
                      showLocationInfo={true}
                      region={
                        regiones.find(
                          (r) => r.id.toString() === formData.direccion?.idRegion?.toString()
                        )?.nombre || null
                      }
                      comuna={
                        comunas.find(
                          (c) => c.id.toString() === formData.direccion?.idComuna?.toString()
                        )?.nombre || null
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Logo de la Compañía con recorte 1:1 */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                  <div className="flex items-center gap-2">
                    <MdImage className="w-4 h-4 text-[#4EB9FA]" />
                    <span>Logo de la Compañía (Opcional)</span>
                  </div>
                </label>
                <ImageUploader
                  onFileSelect={handleImageSelect}
                  onFileRemove={handleImageRemove}
                  value={formData.logo}
                  error={errors.logo}
                  placeholder="Seleccionar logo de la compañía..."
                  className="w-full"
                  acceptedTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
                <p className="text-xs text-gray-500 mt-2">
                  Se recortará automáticamente en formato cuadrado 1:1. JPG, PNG, WEBP o GIF (máx.
                  5MB)
                </p>
              </div>
            </div>

            {/* Errores de unicidad - más sutiles */}
            {errors.nombre && errors.nombre.includes("Ya existe") && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <MdError className="text-amber-600 flex-shrink-0" size={18} />
                <p className="text-amber-700 text-sm">{errors.nombre}</p>
              </div>
            )}
            {errors.email && errors.email.includes("Ya existe") && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <MdError className="text-amber-600 flex-shrink-0" size={18} />
                <p className="text-amber-700 text-sm">{errors.email}</p>
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
                    <span>Crear Compañía</span>
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

CreateCompaniaPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  onCompaniaCreated: PropTypes.func,
  onCreatingChange: PropTypes.func,
};
