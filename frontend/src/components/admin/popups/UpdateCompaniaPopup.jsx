import React, { useState, useRef, useEffect } from "react";
import Form from "@components/Form";
import LoadingSpinner from "@components/LoadingSpinner";
import ImageUploader from "@components/FileUpload/ImageUploader";
import ModalPortal from "@components/ModalPortal";
import Select from "react-select";
import { useRegion } from "@hooks/region/useRegion";
import GoogleMapPicker from "@components/maps/GoogleMapPicker";
import { MdClose, MdBusiness, MdSave, MdError, MdImage, MdLocationOn } from "react-icons/md";
import PropTypes from "prop-types";
import { useCompania } from "@hooks/compania/useCompania";
import { toast } from "react-toastify";
import { direccionService } from "@services/direccion.service.js";

export default function UpdateCompaniaPopup({
  show,
  setShow,
  companiaData,
  onCompaniaUpdated,
  onUpdatingChange,
}) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [directionErrors, setDirectionErrors] = useState({});
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
  const formRef = useRef(null);

  // Hook para actualizar compañía
  const { updateCompania } = useCompania();

  // Hook para cargar región y comunas
  const { regiones: regionesRaw, comunas: comunasRaw, fetchComunasByRegion } = useRegion();

  // Asegurar que siempre sean arrays
  const regiones = Array.isArray(regionesRaw) ? regionesRaw : [];
  const comunas = Array.isArray(comunasRaw) ? comunasRaw : [];

  // Estado para mapLocation (cuando el usuario selecciona en el mapa)
  const [mapLocation, setMapLocation] = useState(null);

  // Cargar datos de la compañía cuando se abre el modal
  useEffect(() => {
    if (show && companiaData) {
      console.log("[UpdateCompania] companiaData recibida:", companiaData);
      console.log("[UpdateCompania] companiaData.direccion:", companiaData.direccion);
      console.log(
        "[UpdateCompania] companiaData.direccion?.latitud:",
        companiaData.direccion?.latitud
      );
      console.log(
        "[UpdateCompania] companiaData.direccion?.longitud:",
        companiaData.direccion?.longitud
      );

      const newFormData = {
        nombre: companiaData.nombre || "",
        email: companiaData.email || "",
        telefono: companiaData.telefono || "",
        fechaFundacion: companiaData.fechaFundacion
          ? companiaData.fechaFundacion.split("T")[0]
          : "",
        descripcion: companiaData.descripcion || "",
        sitioWeb: companiaData.sitioWeb || "",
        logo: null, // No cargar archivo, solo preview
        logoPreview: companiaData.logo || null, // URL del logo existente
        banner: null, // No cargar archivo, solo preview
        bannerPreview: companiaData.banner || null, // URL del banner existente
        idDireccion: companiaData.idDireccion || null,
        direccion: {
          idRegion: companiaData.direccion?.comuna?.region?.id?.toString() || "",
          idComuna: companiaData.direccion?.comuna?.id?.toString() || "",
          calle: companiaData.direccion?.calle || "",
          numero: companiaData.direccion?.numero || "",
          depto: companiaData.direccion?.depto || "",
          referencia: companiaData.direccion?.referencia || "",
          codigoPostal: companiaData.direccion?.codigoPostal || "",
          latitud: companiaData.direccion?.latitud || null,
          longitud: companiaData.direccion?.longitud || null,
        },
      };

      console.log("[UpdateCompania] newFormData.direccion:", newFormData.direccion);

      setFormData(newFormData);
      setErrors({});
      setDirectionErrors({});

      // Si hay dirección con coordenadas, establecer mapLocation
      if (companiaData.direccion?.latitud && companiaData.direccion?.longitud) {
        console.log("[UpdateCompania] Seteando mapLocation con coordenadas:", {
          lat: companiaData.direccion.latitud,
          lng: companiaData.direccion.longitud,
        });
        setMapLocation({
          lat: companiaData.direccion.latitud,
          lng: companiaData.direccion.longitud,
        });
      } else {
        console.log("[UpdateCompania] No hay coordenadas para setear mapLocation");
      }

      // Cargar comunas si hay región
      if (companiaData.direccion?.comuna?.region?.id) {
        fetchComunasByRegion(companiaData.direccion.comuna.region.id);
      }

      // Actualizar los valores del formulario usando react-hook-form
      if (formRef.current) {
        const { setValue } = formRef.current;
        Object.keys(newFormData).forEach((key) => {
          if (key !== "logo" && key !== "logoPreview" && key !== "direccion") {
            setValue(key, newFormData[key]);
          }
        });
      }
    }
  }, [show, companiaData]);

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
    setErrors({});
    setDirectionErrors({});
    setLoading(false);
    if (onUpdatingChange) {
      onUpdatingChange(false);
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
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
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
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(value.type)) {
          return "Solo se permiten archivos JPG, PNG o GIF";
        }
        if (value.size > 5 * 1024 * 1024) {
          // 5MB
          return "El archivo no puede ser mayor a 5MB";
        }
      }
    } else if (field === "banner") {
      if (value && value instanceof File) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(value.type)) {
          return "Solo se permiten archivos JPG, PNG o GIF";
        }
        if (value.size > 5 * 1024 * 1024) {
          // 5MB
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

    // Validar en tiempo real
    const fieldError = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  // Manejar cambios en dirección
  const handleDireccionChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      direccion: {
        ...prev.direccion,
        [field]: value,
      },
    }));
    // Limpiar errores de dirección
    setDirectionErrors({});
  };

  // Manejar selección de región
  const handleRegionSelect = (option) => {
    const regionId = option?.value || "";
    handleDireccionChange("idRegion", regionId);
    handleDireccionChange("idComuna", ""); // Limpiar comuna al cambiar región

    // Limpiar mapLocation si no hay coordenadas guardadas
    if (!formData.direccion?.latitud) {
      setMapLocation(null);
    }

    if (regionId) {
      fetchComunasByRegion(regionId);
    }
  };

  // Manejar selección de comuna
  const handleComunaSelect = (option) => {
    const comunaId = option?.value || "";
    handleDireccionChange("idComuna", comunaId);

    // Limpiar mapLocation si no hay coordenadas guardadas
    if (!formData.direccion?.latitud) {
      setMapLocation(null);
    }
  };

  // Manejar selección de ubicación en el mapa
  const handleLocationSelect = (location) => {
    if (!location) {
      setMapLocation(null);
      handleDireccionChange("latitud", null);
      handleDireccionChange("longitud", null);
      return;
    }

    if (location && typeof location.lat === "number" && typeof location.lng === "number") {
      setMapLocation(location);
      handleDireccionChange("latitud", location.lat);
      handleDireccionChange("longitud", location.lng);
    }
  };

  // Manejar subida de imagen con recorte 1:1
  const handleImageSelect = (file) => {
    if (file) {
      // Validar archivo
      const fieldError = validateField("logo", file);
      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          logo: fieldError,
        }));
        return;
      }

      // Crear preview del archivo recortado
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          logo: file,
          logoPreview: e.target.result,
        }));
      };
      reader.readAsDataURL(file);

      // Limpiar error si existe
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
      // Validar archivo
      const fieldError = validateField("banner", file);
      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          banner: fieldError,
        }));
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          banner: file,
          bannerPreview: e.target.result,
        }));
      };
      reader.readAsDataURL(file);

      // Limpiar error si existe
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

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

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
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (formDataFromForm) => {
    // Mergear datos del formulario con datos de dirección que están en el estado
    const currentFormData = {
      ...(formDataFromForm || formData),
      // Asegurar que siempre tenemos los datos de dirección del estado
      direccion: formData.direccion,
      idDireccion: formData.idDireccion,
    };

    if (!validateForm()) {
      return;
    }

    console.log("[handleSubmit] currentFormData.direccion:", currentFormData.direccion);

    setLoading(true);
    setErrors({});
    setDirectionErrors({});
    if (onUpdatingChange) {
      onUpdatingChange(true);
    }

    try {
      // Preparar datos para envío
      const dataToSend = {
        nombre: currentFormData.nombre.trim(),
        ...(currentFormData.email &&
          currentFormData.email.trim() !== "" && { email: currentFormData.email.trim() }),
        ...(currentFormData.telefono &&
          currentFormData.telefono.trim() !== "" && { telefono: currentFormData.telefono.trim() }),
        ...(currentFormData.fechaFundacion &&
          currentFormData.fechaFundacion.trim() !== "" && {
            fechaFundacion: currentFormData.fechaFundacion,
          }),
        ...(currentFormData.descripcion &&
          currentFormData.descripcion.trim() !== "" && {
            descripcion: currentFormData.descripcion.trim(),
          }),
        ...(currentFormData.sitioWeb &&
          currentFormData.sitioWeb.trim() !== "" && { sitioWeb: currentFormData.sitioWeb.trim() }),
      };

      // Manejar dirección: crear, actualizar o eliminar
      let newIdDireccion = currentFormData.idDireccion;

      // Verificar si hay datos de dirección a guardar
      const hasDireccionData =
        currentFormData.direccion &&
        (currentFormData.direccion.idRegion ||
          currentFormData.direccion.idComuna ||
          currentFormData.direccion.calle ||
          currentFormData.direccion.numero);

      console.log("[handleSubmit] hasDireccionData:", hasDireccionData);
      console.log("[handleSubmit] direccion object:", currentFormData.direccion);

      if (hasDireccionData) {
        // Validar que los campos obligatorios de dirección estén llenos
        if (
          !currentFormData.direccion.idRegion ||
          !currentFormData.direccion.idComuna ||
          !currentFormData.direccion.calle ||
          !currentFormData.direccion.numero
        ) {
          console.log("[handleSubmit] Validación de dirección falló:", {
            idRegion: currentFormData.direccion.idRegion,
            idComuna: currentFormData.direccion.idComuna,
            calle: currentFormData.direccion.calle,
            numero: currentFormData.direccion.numero,
          });
          setDirectionErrors({
            general: "Región, Comuna, Calle y Número son campos obligatorios para la dirección",
          });
          setLoading(false);
          if (onUpdatingChange) {
            onUpdatingChange(false);
          }
          return;
        }

        // Preparar datos de dirección
        const direccionData = {
          idComuna: Number.parseInt(currentFormData.direccion.idComuna),
          calle: currentFormData.direccion.calle.trim(),
          numero: currentFormData.direccion.numero.trim(),
          ...(currentFormData.direccion.depto &&
            currentFormData.direccion.depto.trim() && {
              depto: currentFormData.direccion.depto.trim(),
            }),
          ...(currentFormData.direccion.codigoPostal &&
            currentFormData.direccion.codigoPostal.trim() && {
              codigoPostal: currentFormData.direccion.codigoPostal.trim(),
            }),
          ...(currentFormData.direccion.referencia &&
            currentFormData.direccion.referencia.trim() && {
              referencia: currentFormData.direccion.referencia.trim(),
            }),
          ...(currentFormData.direccion.latitud && { latitud: currentFormData.direccion.latitud }),
          ...(currentFormData.direccion.longitud && {
            longitud: currentFormData.direccion.longitud,
          }),
        };

        console.log("[handleSubmit] direccionData a enviar:", direccionData);

        try {
          if (newIdDireccion) {
            // Actualizar dirección existente
            console.log("[handleSubmit] Actualizando dirección existente:", newIdDireccion);
            // Agregar idCompania y datos para punto geográfico si hay coordenadas
            const updateDataWithCompania = {
              ...direccionData,
              idCompania: companiaData.id,
            };
            if (direccionData.latitud && direccionData.longitud) {
              updateDataWithCompania.nombrePunto = `Cuartel ${currentFormData.nombre}`;
              updateDataWithCompania.descripcionPunto = `Ubicación de ${currentFormData.nombre}`;
            }
            const updateResult = await direccionService.updateDireccion(
              newIdDireccion,
              updateDataWithCompania
            );
            console.log("[handleSubmit] Dirección actualizada:", updateResult);
          } else {
            // Crear nueva dirección
            console.log("[handleSubmit] Creando nueva dirección");
            // Agregar idCompania al crear la dirección
            const createDataWithCompania = {
              ...direccionData,
              idCompania: companiaData.id,
            };
            if (direccionData.latitud && direccionData.longitud) {
              createDataWithCompania.nombrePunto = `Cuartel ${currentFormData.nombre}`;
              createDataWithCompania.descripcionPunto = `Ubicación de ${currentFormData.nombre}`;
            }
            const newDireccion = await direccionService.createDireccion(createDataWithCompania);
            console.log("[handleSubmit] Respuesta de creación:", newDireccion);
            newIdDireccion = newDireccion.data?.id || newDireccion.id;
            console.log("[handleSubmit] Dirección creada con ID:", newIdDireccion);
          }

          // Agregar idDireccion a los datos a enviar
          dataToSend.idDireccion = newIdDireccion;
          console.log("[handleSubmit] dataToSend con idDireccion:", dataToSend);
        } catch (dirError) {
          console.error("[handleSubmit] Error completo al guardar dirección:", dirError);
          console.error("[handleSubmit] Response data:", dirError.response?.data);
          setDirectionErrors({
            general:
              dirError.response?.data?.message ||
              dirError.message ||
              "Error al guardar la dirección",
          });
          setLoading(false);
          if (onUpdatingChange) {
            onUpdatingChange(false);
          }
          return;
        }
      } else {
        console.log("[handleSubmit] Sin datos de dirección a guardar");
      }

      console.log("[handleSubmit] Actualizando compañía con:", dataToSend);
      const result = await updateCompania(
        companiaData.id,
        dataToSend,
        formData.logo,
        formData.banner
      );
      console.log("[handleSubmit] Resultado de updateCompania:", result);

      if (result.success) {
        // Mostrar notificación de éxito
        toast.success(`¡Compañía "${currentFormData.nombre}" actualizada exitosamente!`, {
          position: "bottom-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        handleClose();
        if (onCompaniaUpdated) {
          onCompaniaUpdated();
        }
      } else {
        // Manejar errores de validación del campo (unicidad)
        if (result.message && result.message.includes("Ya existe otra compañía con ese nombre")) {
          setErrors({ nombre: "Ya existe otra compañía con ese nombre" });
        } else if (
          result.message &&
          result.message.includes("Ya existe otra compañía con ese correo electrónico")
        ) {
          setErrors({ email: "Ya existe otra compañía con ese correo electrónico" });
        }
        // Los demás errores ya los maneja el hook con FireAlert
      }
    } catch (error) {
      console.error("[handleSubmit] Error updating compañía:", error);
      console.error("[handleSubmit] Error response:", error.response?.data);

      // Manejar errores de unicidad del backend
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes("Ya existe otra compañía con ese nombre")) {
          setErrors({ nombre: "Ya existe otra compañía con ese nombre" });
        } else if (message.includes("Ya existe otra compañía con ese correo electrónico")) {
          setErrors({ email: "Ya existe otra compañía con ese correo electrónico" });
        }
      }
      // Los demás errores ya los maneja el hook con FireAlert
    } finally {
      setLoading(false);
      if (onUpdatingChange) {
        onUpdatingChange(false);
      }
    }
  };

  if (!show || !companiaData) return null;

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
                <h2 className="text-xl font-bold text-white">Editar Compañía</h2>
                <p className="text-blue-100 text-sm">Modifique la información de la compañía</p>
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
                    defaultValue: formData.nombre,
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
                    defaultValue: formData.email,
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
                    defaultValue: formData.telefono,
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
                    defaultValue: formData.fechaFundacion,
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
                    defaultValue: formData.descripcion,
                  },
                  {
                    label: "Sitio Web (Opcional)",
                    name: "sitioWeb",
                    fieldType: "input",
                    type: "url",
                    placeholder: "https://www.ejemplo.com",
                    errorMessageData: errors.sitioWeb,
                    onChange: (e) => handleInputChange("sitioWeb", e.target.value),
                    defaultValue: formData.sitioWeb,
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
                onSubmit={handleSubmit}
                backgroundColor={"#fff"}
                defaultValues={{
                  nombre: formData.nombre,
                  email: formData.email,
                  telefono: formData.telefono,
                  fechaFundacion: formData.fechaFundacion,
                  descripcion: formData.descripcion,
                  sitioWeb: formData.sitioWeb,
                }}
              />

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
                  previewUrl={formData.logoPreview && !formData.logo ? formData.logoPreview : null}
                  error={errors.logo}
                  placeholder="Seleccionar logo de la compañía..."
                  className="w-full"
                  acceptedTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.logoPreview && !formData.logo
                    ? "Logo actual mostrado arriba. Selecciona uno nuevo para reemplazarlo y se recortará automáticamente en formato cuadrado 1:1."
                    : "Se recortará automáticamente en formato cuadrado 1:1. JPG, PNG, WEBP o GIF (máx. 5MB)"}
                </p>
              </div>

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
                      isDisabled={loading}
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
                      isDisabled={loading || !formData.direccion?.idRegion}
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
                      disabled={loading}
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

                {directionErrors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <MdError className="text-red-600 flex-shrink-0" size={18} />
                    <p className="text-red-700 text-sm">{directionErrors.general}</p>
                  </div>
                )}
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
                onClick={() => {
                  // Activar el submit del formulario
                  const form = document.querySelector("form");
                  if (form) {
                    const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner variant="spinner" size="sm" color="white" />
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <MdSave className="w-4 h-4" />
                    <span>Actualizar Compañía</span>
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

UpdateCompaniaPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  companiaData: PropTypes.object,
  onCompaniaUpdated: PropTypes.func,
  onUpdatingChange: PropTypes.func,
};
