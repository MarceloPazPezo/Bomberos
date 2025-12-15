import React, { useState, useRef, useEffect } from "react";
import Form from "../Form";
import LoadingSpinner from "@components/LoadingSpinner";
import ModalPortal from "@components/ModalPortal";
import {
  MdClose,
  MdSecurity,
  MdSave,
  MdCheck,
  MdExpandMore,
  MdExpandLess,
  MdSelectAll,
  MdClear,
  MdShield,
  MdNotes,
  MdCalendarToday,
  MdLocalFireDepartment,
  MdHealthAndSafety,
  MdVisibility,
} from "react-icons/md";
import PropTypes from "prop-types";
import usePermisos from "@hooks/permisos/usePermisos";

export default function CreateRolPopup({ show, setShow, onRoleCreated }) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  // Estado para los permisos seleccionados
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Hook para permisos
  const { permisosByCategory, loading: permisosLoading, refreshPermisosByCategory } = usePermisos();

  // Paquetes de permisos predefinidos
  const permissionPackages = {
    "Administrador Completo": {
      description: "Acceso total al sistema",
      icon: MdShield,
      permissions: ["*:admin"], // Placeholder - se expandirá a todos los permisos
    },
    "Gestor de Bomberos": {
      description: "Crear, editar y eliminar bomberos",
      icon: MdLocalFireDepartment,
      permissions: [
        "bombero:crear",
        "bombero:actualizar",
        "bombero:eliminar",
        "bombero:obtener",
        "bombero:listar",
      ],
    },
    "Gestor de Partes": {
      description: "Crear y gestionar partes de emergencia",
      icon: MdNotes,
      permissions: [
        "parte_emergencia:crear",
        "parte_emergencia:actualizar",
        "parte_emergencia:eliminar",
        "parte_emergencia:obtener",
        "parte_emergencia:listar",
        "parte_emergencia:revisar",
      ],
    },
    "Gestor de Calendario": {
      description: "Administrar eventos y calendario operativo",
      icon: MdCalendarToday,
      permissions: [
        "evento:crear",
        "evento:actualizar",
        "evento:eliminar",
        "evento:obtener",
        "evento:listar",
        "calendario_operativo:crear",
        "calendario_operativo:actualizar",
      ],
    },
    "Gestor de Carros": {
      description: "Gestionar carros y materiales",
      icon: MdLocalFireDepartment,
      permissions: [
        "carro:crear",
        "carro:actualizar",
        "carro:eliminar",
        "carro:obtener",
        "carro:listar",
      ],
    },
    "Gestor de EPP": {
      description: "Administrar equipos de protección personal",
      icon: MdHealthAndSafety,
      permissions: [
        "epp:crear",
        "epp:actualizar",
        "epp:eliminar",
        "epp:obtener",
        "epp:listar",
        "estado_epp:crear",
        "estado_epp:actualizar",
      ],
    },
    "Solo Lectura": {
      description: "Visualizar información sin modificar",
      icon: MdVisibility,
      permissions: [
        "bombero:obtener",
        "bombero:listar",
        "parte_emergencia:obtener",
        "parte_emergencia:listar",
        "evento:obtener",
        "evento:listar",
        "carro:obtener",
        "carro:listar",
        "epp:obtener",
        "epp:listar",
      ],
    },
  };

  // Función para enfocar el primer campo con error
  const focusFirstErrorField = () => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];

      // Buscar el elemento del campo con error
      const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (fieldElement) {
        // Hacer scroll hasta el elemento
        fieldElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Enfocar el elemento después de un pequeño delay para que el scroll termine
        setTimeout(() => {
          fieldElement.focus();
        }, 300);
      }
    }
  };

  // useEffect para enfocar automáticamente cuando hay errores
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      focusFirstErrorField();
    }
  }, [errors]);

  // useEffect para manejar tecla Escape y scroll lock
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && show) {
        handleClose();
      }
    };

    if (show) {
      // Bloquear scroll del body cuando el popup está abierto
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      // Restaurar scroll del body cuando el popup se cierra
      document.body.style.overflow = "unset";
    }

    return () => {
      // Limpiar al desmontar el componente
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [show]);

  // Cargar permisos cuando se abre el modal
  useEffect(() => {
    if (show) {
      refreshPermisosByCategory();
      // Expandir todas las categorías por defecto
      if (Object.keys(permisosByCategory).length > 0) {
        setExpandedCategories(new Set(Object.keys(permisosByCategory)));
      }
    }
  }, [show]);

  // Expandir categorías cuando se cargan los permisos
  useEffect(() => {
    if (show && Object.keys(permisosByCategory).length > 0) {
      setExpandedCategories(new Set(Object.keys(permisosByCategory)));
    }
  }, [show, permisosByCategory]);

  // Función para manejar click fuera del modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleInputChange = (field, value) => {
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Manejar selección/deselección de permisos
  const handlePermisoToggle = (permisoName) => {
    setSelectedPermisos((prev) =>
      prev.includes(permisoName) ? prev.filter((p) => p !== permisoName) : [...prev, permisoName]
    );
  };

  // Seleccionar/deseleccionar todos los permisos de una categoría
  const handleCategoryToggle = (category) => {
    const categoryPermisos = permisosByCategory[category].map((p) => p.nombre);
    const allSelected = categoryPermisos.every((p) => selectedPermisos.includes(p));

    setSelectedPermisos((prev) =>
      allSelected
        ? prev.filter((p) => !categoryPermisos.includes(p))
        : [...new Set([...prev, ...categoryPermisos])]
    );
  };

  // Aplicar paquete de permisos
  const applyPackage = (packageName) => {
    const pkg = permissionPackages[packageName];
    if (!pkg) return;

    // Si es admin completo, seleccionar todos los permisos
    if (pkg.permissions.includes("*:admin")) {
      const allPermisos = Object.values(permisosByCategory)
        .flat()
        .map((p) => p.nombre);
      setSelectedPermisos(allPermisos);
    } else {
      // Agregar permisos del paquete a los ya seleccionados
      setSelectedPermisos((prev) => [...new Set([...prev, ...pkg.permissions])]);
    }
  };

  // Filtrar permisos por búsqueda
  const filteredPermisosByCategory = React.useMemo(() => {
    if (!searchTerm.trim()) return permisosByCategory;

    const filtered = {};
    const search = searchTerm.toLowerCase();

    Object.entries(permisosByCategory).forEach(([category, permisos]) => {
      const matchingPermisos = permisos.filter(
        (permiso) =>
          permiso.nombre.toLowerCase().includes(search) ||
          permiso.descripcion.toLowerCase().includes(search) ||
          permiso.ruta.toLowerCase().includes(search) ||
          category.toLowerCase().includes(search)
      );

      if (matchingPermisos.length > 0) {
        filtered[category] = matchingPermisos;
      }
    });

    return filtered;
  }, [permisosByCategory, searchTerm]);

  // Alternar expansión de categoría
  const toggleCategoryExpansion = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const errorData = (errorDetails) => {
    setErrors(errorDetails || {});
  };

  const handleSubmit = async (createdRoleData) => {
    if (createdRoleData) {
      setLoading(true);
      try {
        // Validaciones adicionales antes de enviar
        const validationErrors = {};

        // Validar nombre según patrón del backend
        const nombrePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-_]+$/;
        if (!nombrePattern.test(createdRoleData.nombre)) {
          validationErrors.nombre =
            "El nombre del rol solo puede contener letras, números, espacios, guiones o guiones bajos.";
        }

        // Validar longitud de descripción
        if (createdRoleData.descripcion && createdRoleData.descripcion.length > 500) {
          validationErrors.descripcion =
            "La descripción del rol debe tener como máximo 500 caracteres.";
        }

        // Validar permisos (deben ser strings válidos)
        if (selectedPermisos.length > 0) {
          const permisoPattern = /^[a-zA-Z0-9_:]+$/;
          const invalidPermisos = selectedPermisos.filter(
            (permiso) => !permisoPattern.test(permiso)
          );
          if (invalidPermisos.length > 0) {
            validationErrors.permisos = "Algunos permisos contienen caracteres no permitidos.";
          }
        }

        // Si hay errores de validación, mostrarlos
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setLoading(false);
          return;
        }

        // Combinar datos del formulario básico con los permisos seleccionados
        const roleData = {
          ...createdRoleData,
          permisos: selectedPermisos,
        };

        // Pasar los datos al callback para que el componente padre maneje la creación
        if (onRoleCreated) {
          const result = await onRoleCreated(roleData);
          if (result.success) {
            setShow(false);
            setErrors({});
            setSelectedPermisos([]);
          } else if (result.error && typeof result.error === "object") {
            // Si el error es un objeto, son errores específicos por campo
            errorData(result.error);
          } else if (result.error) {
            // Si el error es un string, es un error general
            console.error("Error general:", result.error);
          }
        }
      } catch (error) {
        console.error("Error creating role:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedPermisos([]);
    setErrors({});
  };

  if (!show) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="relative w-full max-w-xs sm:max-w-4xl h-auto p-0 animate-fade-in flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 max-h-[90vh]">
          {/* Header mejorado */}
          <div className="flex items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
            <div className="flex items-center space-x-3 flex-1">
              <div className="p-2 bg-white/20 rounded-lg">
                <MdSecurity className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Crear Rol</h2>
            </div>
            <button
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 group"
              onClick={handleClose}
              aria-label="Cerrar (Esc)"
              title="Cerrar (Esc)"
            >
              <MdClose className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Contenido mejorado */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-h-[70vh] bg-gray-50/50">
            {/* Mostrar error general si existe */}
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Formulario básico */}
            <Form
              ref={formRef}
              title={null}
              autoComplete="off"
              size="max-w-xs sm:max-w-4xl"
              fields={[
                {
                  label: "Nombre del rol",
                  name: "nombre",
                  placeholder: "Ej: Supervisor, Moderador, etc.",
                  fieldType: "input",
                  type: "text",
                  required: true,
                  minLength: 2,
                  maxLength: 50,
                  pattern: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-_]+$/,
                  patternMessage:
                    "Solo se permiten letras, números, espacios, guiones y guiones bajos",
                  errorMessageData: errors.nombre,
                  onChange: (e) => handleInputChange("nombre", e.target.value),
                  autoComplete: "off",
                },
                {
                  label: "Descripción",
                  name: "descripcion",
                  placeholder: "Describe las responsabilidades de este rol...",
                  fieldType: "textarea",
                  required: false,
                  minLength: 0,
                  maxLength: 500,
                  errorMessageData: errors.descripcion,
                  onChange: (e) => handleInputChange("descripcion", e.target.value),
                  autoComplete: "off",
                  rows: 3,
                },
              ]}
              onSubmit={handleSubmit}
              backgroundColor={"#fff"}
              hideSubmitButton={true}
            />

            {/* Selección de permisos */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">Permisos del Rol</h3>
                <span className="text-sm text-gray-600">
                  {selectedPermisos.length} de {Object.values(permisosByCategory).flat().length}{" "}
                  permisos seleccionados
                </span>
              </div>

              {/* Paquetes de permisos predefinidos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MdSecurity className="text-blue-600" size={20} />
                  <h4 className="font-medium text-gray-800">Paquetes de Permisos</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(permissionPackages).map(([name, pkg]) => {
                    const IconComponent = pkg.icon;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => applyPackage(name)}
                        className="flex flex-col items-start gap-1 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                        title={pkg.description}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-800">{name}</span>
                        </div>
                        <span className="text-xs text-gray-600 line-clamp-2">
                          {pkg.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buscador de permisos */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar permisos por nombre, descripción o ruta..."
                  className="w-full px-4 py-2.5 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#4EB9FA] transition-colors"
                />
                <MdSecurity
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <MdClose size={20} />
                  </button>
                )}
              </div>
              {/* Loading state para permisos */}
              {permisosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner variant="spinner" size="md" color="blue" />
                  <span className="ml-2 text-gray-600">Cargando permisos...</span>
                </div>
              ) : Object.keys(filteredPermisosByCategory).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MdSecurity size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No se encontraron permisos que coincidan con "{searchTerm}"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(filteredPermisosByCategory).map(
                    ([category, categoryPermisos]) => {
                      const isExpanded = expandedCategories.has(category);
                      const selectedCount = categoryPermisos.filter((p) =>
                        selectedPermisos.includes(p.nombre)
                      ).length;
                      const allSelected = selectedCount === categoryPermisos.length;

                      return (
                        <div key={category} className="border border-gray-200 rounded-lg">
                          {/* Header de categoría */}
                          <div className="p-3 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => toggleCategoryExpansion(category)}
                                className="flex items-center gap-2 text-left flex-1"
                              >
                                {isExpanded ? (
                                  <MdExpandLess size={20} />
                                ) : (
                                  <MdExpandMore size={20} />
                                )}
                                <span className="font-medium text-gray-800">{category}</span>
                                <span className="text-sm text-gray-600">
                                  ({selectedCount}/{categoryPermisos.length})
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCategoryToggle(category)}
                                className={`p-1 rounded transition-colors ${
                                  allSelected
                                    ? "text-red-600 hover:text-red-800"
                                    : "text-green-600 hover:text-green-800"
                                }`}
                                title={allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                              >
                                {allSelected ? <MdClear size={18} /> : <MdSelectAll size={18} />}
                              </button>
                            </div>
                          </div>

                          {/* Permisos de la categoría */}
                          {isExpanded && (
                            <div className="p-3 space-y-2">
                              {categoryPermisos.map((permiso) => {
                                const isSelected = selectedPermisos.includes(permiso.nombre);

                                return (
                                  <label
                                    key={permiso.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                      isSelected
                                        ? "bg-green-50 border-green-200"
                                        : "bg-white border-gray-200 hover:bg-gray-50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handlePermisoToggle(permiso.nombre)}
                                      className="mt-1 rounded border-gray-300 text-[#4EB9FA] focus:ring-[#4EB9FA]"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        {isSelected && (
                                          <MdCheck className="text-green-600" size={16} />
                                        )}
                                        <span className="font-medium text-gray-800">
                                          {permiso.nombre}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {permiso.descripcion}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                          {permiso.metodo}
                                        </span>
                                        <span>{permiso.ruta}</span>
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones mejorados */}
          <div className="flex justify-end space-x-3 px-4 sm:px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              disabled={loading}
            >
              <MdClose className="w-4 h-4" />
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
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <MdSave className="w-4 h-4" />
                  <span>Crear Rol</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

CreateRolPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  onRoleCreated: PropTypes.func.isRequired,
};
