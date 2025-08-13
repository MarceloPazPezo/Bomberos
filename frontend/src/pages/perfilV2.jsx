// src/pages/Profile.jsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  MdEmail, MdPhone, MdCalendarToday, MdEdit, MdSave, MdCancel, MdPerson,
  MdShield, MdLocationOn, MdLocalHospital, MdPeopleAlt,
  MdHistory, MdSchool, MdCheckCircle, MdErrorOutline, MdAdd, MdDelete
} from 'react-icons/md';
import { useProfile } from '@hooks/useProfile';
import { formatRut, formatTelefono } from '@helpers/formatData';
import {
  getContactosEmergencia,
  addContactoEmergencia,
  updateContactoEmergencia,
  deleteContactoEmergencia,
} from '@services/perfil.service';

/* ================= Utils ================= */
const joinNames = (nombres, apellidos) => {
  const n = Array.isArray(nombres) ? nombres.join(' ') : (nombres || '');
  const a = Array.isArray(apellidos) ? apellidos.join(' ') : (apellidos || '');
  return `${n} ${a}`.trim() || '—';
};
const toCLDate = (d, opts) =>
  d ? new Date(d).toLocaleDateString('es-CL', opts || { day: '2-digit', month: 'long', year: 'numeric' })
    : 'No especificado';
const calcEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const fn = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fn.getFullYear();
  const m = hoy.getMonth() - fn.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) edad--;
  return edad;
};
const isVoluntario = (roles = []) => {
  const raw = roles.map((r) => r?.nombre || r?.name || r).join(' ').toLowerCase();
  return raw.includes('voluntario');
};
const getUserIdFromProfile = (p) => p?.id ?? p?.usuarioId ?? p?.usuario_id;

/* ================= UI helpers (inline) ================= */
const Chip = ({ color = 'blue', children, icon: Icon }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${colors[color]}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );
};

const SectionCard = ({ title, children, right }) => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {right}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const KV = ({ label, value, icon: Icon, hint }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
    <div className="mt-0.5 flex items-center gap-2 text-gray-900">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <span className="text-sm">{value ?? '—'}</span>
      {hint && <span className="text-xs text-gray-500">({hint})</span>}
    </div>
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      active
        ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {Icon && <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />}
    {children}
  </button>
);

const Field = ({ as = 'input', name, value, onChange, error, ...rest }) => {
  const base =
    'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2';
  const cls = error ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200';
  const common = { name, value, onChange, className: `${base} ${cls}`, ...rest };
  if (as === 'textarea') return <textarea {...common} />;
  if (as === 'select') return <select {...common} />;
  return <input {...common} />;
};

const Empty = ({ children }) => (
  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
    {children}
  </div>
);

/* ================= Página ================= */
const Profile = () => {
  const {
    profile,
    loading,
    error,
    fieldErrors,
    updating,
    updateProfile,
    setError,
    clearFieldError,
  } = useProfile();

  const [activeTab, setActiveTab] = useState('personal'); // personal | emergencia | capacitacion | medica | historial
  const [success, setSuccess] = useState('');

  // ====== Estado de edición POR ÁREA ======
  // --- Información de Contacto (con botón Actualizar) ---
  const [editContacto, setEditContacto] = useState(false);
  const [dirtyContacto, setDirtyContacto] = useState(false);
  const [formContacto, setFormContacto] = useState({
    email: '',
    telefono: '',
    direccion: '',
  });

  // --- Contactos de Emergencia (tarjetas + CRUD con services) ---
  const [editEmerg, setEditEmerg] = useState(false);
  const [dirtyEmerg, setDirtyEmerg] = useState(false);
  const [contactos, setContactos] = useState([]);         // estado actual (con _dbId / _tempId)
  const [originales, setOriginales] = useState([]);       // para diff
  const [errorEmerg, setErrorEmerg] = useState('');

  // ====== Derivados del perfil ======
  const nombreCompleto = useMemo(
    () => joinNames(profile?.nombres, profile?.apellidos),
    [profile]
  );
  const edad = useMemo(() => calcEdad(profile?.fechaNacimiento), [profile?.fechaNacimiento]);
  const estadoServicio = Boolean(profile?.activo ?? true);
  const voluntario = isVoluntario(profile?.roles);
  const userId = getUserIdFromProfile(profile);

  // ====== Carga inicial de forms y contactos ======
  useEffect(() => {
    if (!profile) return;
    setFormContacto({
      email: profile?.email || '',
      telefono: profile?.telefono || '',
      direccion: profile?.direccion || '',
    });
    setEditContacto(false);
    setDirtyContacto(false);
  }, [profile]);

  // cargar contactos desde API
  const fetchContactos = useCallback(async () => {
    if (!userId) return;
    try {
      setErrorEmerg('');
      const resp = await getContactosEmergencia(userId);
      const list = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
      const normalized = list.map((c) => ({
        _dbId: c.id,                 // id real en BD
        _tempId: `${c.id}`,          // key estable
        usuario_id: c.usuario_id ?? userId,
        nombres: c.nombres || '',
        apellidos: c.apellidos || '',
        vinculo: c.vinculo || '',
        telefono: c.telefono || '',
        email: c.email || '',
      }));
      setOriginales(normalized);
      setContactos(normalized);
      setEditEmerg(false);
      setDirtyEmerg(false);
    } catch (e) {
      setErrorEmerg('No se pudieron cargar los contactos de emergencia.');
    }
  }, [userId]);

  useEffect(() => {
    fetchContactos();
  }, [fetchContactos]);

  // ====== Cambio de pestaña con confirmación si hay cambios pendientes ======
  const requestTabChange = useCallback(async (nextTab) => {
    // Cambios en Información de Contacto (dentro de pestaña personal)
    if (activeTab === 'personal' && editContacto && dirtyContacto) {
      const wantSave = window.confirm(
        'Tienes cambios sin guardar en "Información de Contacto". ¿Deseas GUARDAR antes de salir?\nAceptar: Guardar · Cancelar: Descartar'
      );
      if (wantSave) {
        const ok = await onSaveContacto();
        if (!ok) return;
      } else {
        onCancelContacto(true);
      }
    }
    // Cambios en Contactos de Emergencia
    if (activeTab === 'emergencia' && editEmerg && dirtyEmerg) {
      const wantSave = window.confirm(
        'Tienes cambios sin guardar en "Contactos de Emergencia". ¿Deseas GUARDAR antes de salir?\nAceptar: Guardar · Cancelar: Descartar'
      );
      if (wantSave) {
        const ok = await onSaveEmerg();
        if (!ok) return;
      } else {
        onCancelEmerg(true);
      }
    }
    setActiveTab(nextTab);
  }, [activeTab, editContacto, dirtyContacto, editEmerg, dirtyEmerg]);

  // ====== Handlers: Información de Contacto ======
  const onStartContacto = () => {
    setEditContacto(true);
    setDirtyContacto(false);
    setError(null);
    setSuccess('');
  };
  const onChangeContacto = (field, value) => {
    clearFieldError(field);
    setFormContacto((p) => ({ ...p, [field]: value }));
    setDirtyContacto(true);
  };
  const onCancelContacto = (silent = false) => {
    setFormContacto({
      email: profile?.email || '',
      telefono: profile?.telefono || '',
      direccion: profile?.direccion || '',
    });
    setEditContacto(false);
    setDirtyContacto(false);
    if (!silent) setError(null);
  };
  const onSaveContacto = async () => {
    const payload = { ...formContacto };
    const result = await updateProfile(payload);
    if (result?.success) {
      setEditContacto(false);
      setDirtyContacto(false);
      setSuccess('Información de contacto actualizada.');
      setTimeout(() => setSuccess(''), 3500);
      return true;
    }
    return false;
  };

  // ====== Handlers: Contactos de Emergencia ======
  const addContacto = () => {
    setContactos((prev) => [
      ...prev,
      {
        _dbId: null,
        _tempId: `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
        usuario_id: userId,
        nombres: '',
        apellidos: '',
        vinculo: '',
        telefono: '',
        email: '',
      },
    ]);
    setDirtyEmerg(true);
  };
  const removeContacto = (tempId) => {
    setContactos((prev) => prev.filter((c) => c._tempId !== tempId));
    setDirtyEmerg(true);
  };
  const changeContacto = (tempId, field, value) => {
    setContactos((prev) => prev.map((c) => (c._tempId === tempId ? { ...c, [field]: value } : c)));
    setDirtyEmerg(true);
  };
  const onStartEmerg = () => {
    setEditEmerg(true);
    setDirtyEmerg(false);
    setErrorEmerg('');
    setSuccess('');
  };
  const onCancelEmerg = (silent = false) => {
    setContactos(originales);
    setEditEmerg(false);
    setDirtyEmerg(false);
    if (!silent) setErrorEmerg('');
  };

  // Diff y guardado usando tus services
  const onSaveEmerg = async () => {
    try {
      setErrorEmerg('');
      // crear índices
      const origById = new Map(originales.filter(c => c._dbId != null).map(c => [c._dbId, c]));
      const currentById = new Map(contactos.filter(c => c._dbId != null).map(c => [c._dbId, c]));

      // Borrados: presentes en originales y NO presentes ahora
      const toDeleteIds = originales
        .filter(c => c._dbId != null && !currentById.has(c._dbId))
        .map(c => c._dbId);

      // Nuevos: sin _dbId
      const toCreate = contactos.filter(c => !c._dbId).map(c => ({
        usuario_id: userId,
        nombres: c.nombres?.trim() || '',
        apellidos: c.apellidos?.trim() || '',
        vinculo: c.vinculo?.trim() || '',
        telefono: c.telefono?.trim() || '',
        email: c.email?.trim() || '',
      }));

      // Actualizados: con _dbId y con cambios respecto a originales
      const toUpdate = contactos
        .filter(c => c._dbId != null)
        .filter(c => {
          const o = origById.get(c._dbId);
          if (!o) return false;
          return (
            (o.nombres || '') !== (c.nombres || '') ||
            (o.apellidos || '') !== (c.apellidos || '') ||
            (o.vinculo || '') !== (c.vinculo || '') ||
            (o.telefono || '') !== (c.telefono || '') ||
            (o.email || '') !== (c.email || '')
          );
        })
        .map(c => ({
          id: c._dbId,
          data: {
            usuario_id: userId,
            nombres: c.nombres?.trim() || '',
            apellidos: c.apellidos?.trim() || '',
            vinculo: c.vinculo?.trim() || '',
            telefono: c.telefono?.trim() || '',
            email: c.email?.trim() || '',
          }
        }));

      // Ejecutar operaciones (primero borrados para evitar conflictos únicos)
      await Promise.all(toDeleteIds.map(id => deleteContactoEmergencia(id)));
      await Promise.all(toUpdate.map(u => updateContactoEmergencia(u.id, u.data)));
      await Promise.all(toCreate.map(c => addContactoEmergencia(c)));

      // refrescar
      await fetchContactos();
      setEditEmerg(false);
      setDirtyEmerg(false);
      setSuccess('Contactos de emergencia actualizados.');
      setTimeout(() => setSuccess(''), 3500);
      return true;
    } catch (e) {
      setErrorEmerg('No se pudo actualizar los contactos de emergencia.');
      return false;
    }
  };

  /* -------- loading / empty -------- */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">No se pudo cargar el perfil</p>
          <p className="text-gray-600">Recarga la página e inténtalo nuevamente.</p>
        </div>
      </div>
    );
  }

  /* ================= render ================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 place-content-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                <MdPerson className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{nombreCompleto}</h1>

                <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <MdEmail className="h-4 w-4 text-gray-400" />
                    {profile.email || 'correo@ejemplo.com'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MdPhone className="h-4 w-4 text-gray-400" />
                    {formatTelefono(profile.telefono) || '+56 9 XXXX XXXX'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MdCalendarToday className="h-4 w-4 text-gray-400" />
                    Ingreso: {toCLDate(profile.fechaIngreso)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Chip color={estadoServicio ? 'blue' : 'red'} icon={estadoServicio ? MdCheckCircle : MdErrorOutline}>
                    {estadoServicio ? 'Usuario vinculado' : 'Usuario desvinculado'}
                  </Chip>
                  {voluntario && <Chip color="purple">Voluntario</Chip>}
                </div>
              </div>
            </div>
          </div>

          {(error || success) && (
            <div className="px-6 pt-4">
              {error && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 px-6 pb-3 pt-2">
            <TabButton active={activeTab === 'personal'} onClick={() => requestTabChange('personal')} icon={MdPerson}>
              Información Personal
            </TabButton>
            <TabButton active={activeTab === 'emergencia'} onClick={() => requestTabChange('emergencia')} icon={MdPeopleAlt}>
              Contactos de Emergencia
            </TabButton>
            <TabButton active={activeTab === 'capacitacion'} onClick={() => requestTabChange('capacitacion')} icon={MdSchool}>
              Capacitación
            </TabButton>
            <TabButton active={activeTab === 'medica'} onClick={() => requestTabChange('medica')} icon={MdLocalHospital}>
              Información Médica
            </TabButton>
            <TabButton active={activeTab === 'historial'} onClick={() => requestTabChange('historial')} icon={MdHistory}>
              Historial
            </TabButton>
          </div>
        </div>

        {/* Contenido de pestañas */}
        <div className="mt-6 space-y-6">

          {/* ========= PERSONAL ========= */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Datos Personales (Solo lectura) */}
              <SectionCard title="Datos Personales">
                <div className="grid grid-cols-1 gap-5">
                  <KV label="Nombre Completo" value={joinNames(profile.nombres, profile.apellidos)} icon={MdPerson} />
                  <KV
                    label="Fecha de Nacimiento"
                    value={toCLDate(profile.fechaNacimiento)}
                    hint={edad != null ? `${edad} años` : null}
                    icon={MdCalendarToday}
                  />
                  <KV label="RUT" value={formatRut(profile.run)} icon={MdShield} />
                  <KV label="Fecha de Ingreso" value={toCLDate(profile.fechaIngreso)} icon={MdCalendarToday} />
                </div>
              </SectionCard>

              {/* Información de Contacto (Editable + Actualizar) */}
              <SectionCard
                title="Información de Contacto"
                right={
                  !editContacto ? (
                    <button
                      onClick={onStartContacto}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <MdEdit className="h-4 w-4" />
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={onSaveContacto}
                        disabled={updating}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        <MdSave className="h-4 w-4" />
                        {updating ? 'Actualizando…' : 'Actualizar'}
                      </button>
                      <button
                        onClick={() => onCancelContacto()}
                        disabled={updating}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                      >
                        <MdCancel className="h-4 w-4" />
                        Cancelar
                      </button>
                    </div>
                  )
                }
              >
                <div className="grid grid-cols-1 gap-5">
                  {/* Email */}
                  <div className="grid grid-cols-1 gap-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                    {!editContacto ? (
                      <div className="flex items-center gap-2 text-gray-900">
                        <MdEmail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{profile.email || 'No especificado'}</span>
                      </div>
                    ) : (
                      <>
                        <Field
                          type="email"
                          name="email"
                          value={formContacto.email}
                          onChange={(e) => onChangeContacto('email', e.target.value)}
                          placeholder="correo@ejemplo.com"
                          error={fieldErrors?.email}
                        />
                        {fieldErrors?.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
                      </>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div className="grid grid-cols-1 gap-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</p>
                    {!editContacto ? (
                      <div className="flex items-center gap-2 text-gray-900">
                        <MdPhone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatTelefono(profile.telefono) || 'No especificado'}</span>
                      </div>
                    ) : (
                      <>
                        <Field
                          type="tel"
                          name="telefono"
                          value={formContacto.telefono}
                          onChange={(e) => onChangeContacto('telefono', e.target.value)}
                          placeholder="+56 9 1234 5678"
                          error={fieldErrors?.telefono}
                        />
                        {fieldErrors?.telefono && (
                          <p className="text-xs text-red-600">{fieldErrors.telefono}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Dirección */}
                  <div className="grid grid-cols-1 gap-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dirección</p>
                    {!editContacto ? (
                      <div className="flex items-center gap-2 text-gray-900">
                        <MdLocationOn className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{profile.direccion || 'No especificado'}</span>
                      </div>
                    ) : (
                      <>
                        <Field
                          name="direccion"
                          value={formContacto.direccion}
                          onChange={(e) => onChangeContacto('direccion', e.target.value)}
                          placeholder="Av. Libertador 456, Cabrero"
                          error={fieldErrors?.direccion}
                        />
                        {fieldErrors?.direccion && (
                          <p className="text-xs text-red-600">{fieldErrors.direccion}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ========= EMERGENCIA (tarjetas) ========= */}
          {activeTab === 'emergencia' && (
            <SectionCard
              title="Contactos de Emergencia"
              right={
                !editEmerg ? (
                  <button
                    onClick={onStartEmerg}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <MdEdit className="h-4 w-4" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={onSaveEmerg}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                    >
                      <MdSave className="h-4 w-4" />
                      Actualizar
                    </button>
                    <button
                      onClick={() => onCancelEmerg()}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <MdCancel className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                )
              }
            >
              {errorEmerg && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorEmerg}
                </div>
              )}

              {!editEmerg ? (
                Array.isArray(contactos) && contactos.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {contactos.map((c) => (
                      <li key={c._tempId} className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {joinNames(c.nombres, c.apellidos) || 'Contacto'}
                        </p>
                        <p className="text-xs text-gray-600">{c.vinculo || '—'}</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-700">
                          <div className="inline-flex items-center gap-2">
                            <MdPhone className="h-4 w-4 text-gray-400" />
                            {c.telefono ? formatTelefono(c.telefono) : 'Sin teléfono'}
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <MdEmail className="h-4 w-4 text-gray-400" />
                            {c.email || 'Sin email'}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty>No hay contactos de emergencia registrados.</Empty>
                )
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={addContacto}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    >
                      <MdAdd className="h-4 w-4" />
                      Agregar contacto
                    </button>
                  </div>

                  {contactos.length === 0 && <Empty>Agrega tu primer contacto.</Empty>}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {contactos.map((c) => (
                      <div key={c._tempId} className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">
                            {c._dbId ? 'Contacto' : 'Nuevo contacto'}
                          </p>
                          <button
                            onClick={() => removeContacto(c._tempId)}
                            className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Eliminar"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <Field
                            name="nombres"
                            value={c.nombres}
                            onChange={(e) => changeContacto(c._tempId, 'nombres', e.target.value)}
                            placeholder="Nombres"
                          />
                          <Field
                            name="apellidos"
                            value={c.apellidos}
                            onChange={(e) => changeContacto(c._tempId, 'apellidos', e.target.value)}
                            placeholder="Apellidos"
                          />
                          <Field
                            name="vinculo"
                            value={c.vinculo}
                            onChange={(e) => changeContacto(c._tempId, 'vinculo', e.target.value)}
                            placeholder="Vínculo (Madre, Esposo/a, etc.)"
                          />
                          <Field
                            name="telefono"
                            value={c.telefono}
                            onChange={(e) => changeContacto(c._tempId, 'telefono', e.target.value)}
                            placeholder="+56 9 1234 5678"
                          />
                          <Field
                            type="email"
                            name="email"
                            value={c.email}
                            onChange={(e) => changeContacto(c._tempId, 'email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {/* ========= CAPACITACIÓN ========= */}
          {activeTab === 'capacitacion' && (
            <SectionCard title="Capacitación">
              {Array.isArray(profile.capacitaciones) && profile.capacitaciones.length > 0 ? (
                <ul className="space-y-3">
                  {profile.capacitaciones.map((cap, i) => (
                    <li key={i} className="rounded-lg border border-gray-200 p-3">
                      <p className="text-sm font-medium text-gray-900">{cap?.nombre || 'Curso'}</p>
                      <p className="text-xs text-gray-600">
                        {cap?.institucion ? `${cap.institucion} · ` : ''}
                        {cap?.fecha ? toCLDate(cap.fecha) : 'Fecha no disponible'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No hay registros de capacitación.</Empty>
              )}
            </SectionCard>
          )}

          {/* ========= MÉDICA (solo lectura por ahora) ========= */}
          {activeTab === 'medica' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <SectionCard title="Tipo de Sangre">
                <span className="text-sm text-gray-900">{profile.tipoSangre || 'No especificado'}</span>
              </SectionCard>

              <SectionCard title="Alergias">
                {profile.alergias && profile.alergias.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(profile.alergias) ? profile.alergias : String(profile.alergias).split(','))
                      .map((a, i) => (
                        <Chip key={i} color="gray">{String(a).trim()}</Chip>
                      ))}
                  </div>
                ) : (
                  <Empty>No especificado</Empty>
                )}
              </SectionCard>

              <SectionCard title="Medicamentos">
                {profile.medicamentos && profile.medicamentos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(profile.medicamentos) ? profile.medicamentos : String(profile.medicamentos).split(','))
                      .map((m, i) => (
                        <Chip key={i} color="gray">{String(m).trim()}</Chip>
                      ))}
                  </div>
                ) : (
                  <Empty>No especificado</Empty>
                )}
              </SectionCard>

              <SectionCard title="Condiciones Médicas">
                {profile.condiciones && profile.condiciones.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(profile.condiciones) ? profile.condiciones : String(profile.condiciones).split(','))
                      .map((c, i) => (
                        <Chip key={i} color="gray">{String(c).trim()}</Chip>
                      ))}
                  </div>
                ) : (
                  <Empty>No especificado</Empty>
                )}
              </SectionCard>
            </div>
          )}

          {/* ========= HISTORIAL ========= */}
          {activeTab === 'historial' && (
            <SectionCard title="Historial">
              {Array.isArray(profile.historial) && profile.historial.length > 0 ? (
                <ul className="space-y-3">
                  {profile.historial.map((h, i) => (
                    <li key={i} className="rounded-lg border border-gray-200 p-3">
                      <p className="text-sm font-medium text-gray-900">{h?.titulo || 'Registro'}</p>
                      <p className="text-xs text-gray-600">
                        {h?.detalle || 'Sin detalle'} · {h?.fecha ? toCLDate(h.fecha, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha no disponible'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No hay eventos en el historial.</Empty>
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
