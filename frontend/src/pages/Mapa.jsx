import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Select from 'react-select';
import { 
    MdLocationOn, MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdRefresh,
    MdCheckCircle, MdWarning, MdCancel, MdBuild, MdBusiness,
    MdVisibility, MdVisibilityOff, MdMap, MdHelpOutline
} from 'react-icons/md';
import Tooltip from '@components/Tooltip.jsx';
import { FaFireExtinguisher } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '@hooks/auth/useAuth';
import { getTiposPunto } from '@services/tipoPunto.service';
import { renderIcon } from '@helpers/iconMapper';
import { getIconoSvg } from '@helpers/mapIcons';
import { showConfirmAlert } from '@helpers/fireAlert';
import { 
    getPuntosGeograficos, 
    createPuntoGeografico, 
    updatePuntoGeografico, 
    deletePuntoGeografico 
} from '@services/puntoGeografico.service';
import { getJurisdicciones, createJurisdiccion, updateJurisdiccion } from '@services/jurisdiccion.service';
import BomberosLoader from '@components/BomberosLoader';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polygon } from '@react-google-maps/api';

const libraries = ['drawing', 'geometry'];

const Mapa = () => {
    const { bombero: user } = useAuth();
    
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });
    
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    
    const modoAgregarRef = useRef(false);
    const [modoAgregar, setModoAgregar] = useState(false);
    
    // Estados
    const [puntos, setPuntos] = useState([]);
    const [tiposPunto, setTiposPunto] = useState([]);
    const [jurisdicciones, setJurisdicciones] = useState([]);
    const [mostrarJurisdicciones, setMostrarJurisdicciones] = useState(true);
    const [jurisForm, setJurisForm] = useState({ nombre: '', descripcion: '', color: '#22c55e' });
    const [dibujarJuris, setDibujarJuris] = useState(false);
    const [coordsDibujo, setCoordsDibujo] = useState([]);
    const [editingJurisId, setEditingJurisId] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Filtros de categoría
    const [filtrosCategorias, setFiltrosCategorias] = useState({
        PUNTO_INTERES: true,
        UBICACION_BOMBERO: true,
        INCIDENTE: true
    });
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        lat: null,
        lng: null,
        idTipoPunto: '',
        estado: 'BUENO'
    });
    const [editingId, setEditingId] = useState(null);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

    // Estados para selección (reemplazan popups nativos)
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [selectedJurisdiccion, setSelectedJurisdiccion] = useState(null);
    const [tempMarker, setTempMarker] = useState(null);

    // Funciones helper para formateo
    const toStartCase = (text) => {
        if (!text) return '';
        return text.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return date.toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    const formatTiempoTranscurrido = (segundos) => {
        if (segundos < 60) {
            return `hace ${segundos} segundo${segundos !== 1 ? 's' : ''}`;
        } else if (segundos < 3600) {
            const minutos = Math.floor(segundos / 60);
            return `hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
        } else {
            const horas = Math.floor(segundos / 3600);
            return `hace ${horas} hora${horas !== 1 ? 's' : ''}`;
        }
    };
    
    // Preparar opciones para los selects
    const tipoPuntoOptions = useMemo(() => {
        return tiposPunto.map(tipo => ({
            value: tipo.id.toString(),
            label: tipo.nombre
        }));
    }, [tiposPunto]);

    const estadoOptions = useMemo(() => [
        { value: 'BUENO', label: 'Bueno' },
        { value: 'REGULAR', label: 'Regular' },
        { value: 'MALO', label: 'Malo' },
        { value: 'FUERA_DE_SERVICIO', label: 'Fuera de Servicio' }
    ], []);

    const selectedTipoPuntoOption = useMemo(() => {
        if (!formData.idTipoPunto) return null;
        return tipoPuntoOptions.find(opt => opt.value === formData.idTipoPunto.toString()) || null;
    }, [formData.idTipoPunto, tipoPuntoOptions]);

    const selectedEstadoOption = useMemo(() => {
        return estadoOptions.find(opt => opt.value === formData.estado) || estadoOptions[0];
    }, [formData.estado, estadoOptions]);

    // Estilos para los Select
    const selectStyles = useMemo(() => ({
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? '#4EB9FA' : '#D1D5DB',
            borderWidth: '2px',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(78, 185, 250, 0.1)' : 'none',
            '&:hover': {
                borderColor: '#4EB9FA',
            },
            minHeight: '44px',
            borderRadius: '10px',
            fontSize: '0.9rem',
        }),
        menu: (base) => ({
            ...base,
            zIndex: 25,
            borderRadius: '10px',
            overflow: 'hidden',
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: '260px',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? '#4EB9FA'
                : state.isFocused
                    ? '#E0F2FE'
                    : 'white',
            color: state.isSelected ? '#FFFFFF' : '#1F2937',
            fontSize: '0.9rem',
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: '0.9rem',
            color: '#9CA3AF',
        }),
        input: (base) => ({
            ...base,
            fontSize: '0.9rem',
        }),
        singleValue: (base) => ({
            ...base,
            fontSize: '0.9rem',
            color: '#1F2937',
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    }), []);

    const selectMenuPortalTarget = typeof window !== 'undefined' ? document.body : null;

    // Renderiza el ícono SVG para la leyenda
    const renderLegendIcon = (icono, color, nombre) => {
        if (nombre && nombre.toLowerCase().includes('grifo')) {
            return (
                <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white shadow"
                    style={{ color: color || '#333' }}
                    dangerouslySetInnerHTML={{ __html: getIconoSvg('CustomHydrant').replace('24 24','20 20') }}
                />
            );
        }
        return (
            <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white shadow"
                style={{ color: color || '#333' }}
                dangerouslySetInnerHTML={{ __html: getIconoSvg(icono) }}
            />
        );
    };

    // Sincronizar modoAgregar con la referencia
    useEffect(() => {
        modoAgregarRef.current = modoAgregar;
        if (!modoAgregar) {
            setTempMarker(null);
        }
    }, [modoAgregar]);

    // Cargar datos iniciales
    useEffect(() => {
        if (isLoaded) {
            cargarDatos();
        }
    }, [isLoaded]);

    // Actualizar contador de tiempo
    useEffect(() => {
        if (!ultimaActualizacion) return;

        const updateTime = () => {
            const ahora = new Date();
            const diferencia = Math.floor((ahora - ultimaActualizacion) / 1000);
            setTiempoTranscurrido(diferencia);
        };

        updateTime();

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                updateTime();
            }
        }, 1000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateTime();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [ultimaActualizacion]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [puntosData, tiposData, jurisdiccionesData] = await Promise.all([
                getPuntosGeograficos(),
                getTiposPunto(),
                getJurisdicciones()
            ]);
            
            setPuntos(Array.isArray(puntosData) ? puntosData : []);
            setTiposPunto(Array.isArray(tiposData) ? tiposData : []);
            setJurisdicciones(Array.isArray(jurisdiccionesData) ? jurisdiccionesData : []);
            
            const ahora = new Date();
            setUltimaActualizacion(ahora);
            setTiempoTranscurrido(0);
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    // Google Maps Callbacks
    const onLoad = useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds();
        // Centrar en Cabrero, Chile por defecto
        map.setCenter({ lat: -37.0333, lng: -72.4000 }); 
        map.setZoom(13);
        setMap(map);
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
        mapRef.current = null;
    }, []);

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        if (modoAgregar) {
            setTempMarker({ lat, lng });
            setFormData(prev => ({
                ...prev,
                lat,
                lng
            }));
            toast.success(`Ubicación seleccionada: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } else if (dibujarJuris) {
            setCoordsDibujo(prev => [...prev, { lat, lng }]);
        } else {
            setSelectedMarker(null);
            setSelectedJurisdiccion(null);
        }
    };

    // Manejadores de acciones (reemplazan window globals)
    const handleEditPunto = (id) => {
        const punto = puntos.find(p => p.id === id);
        if (punto) {
            setSelectedMarker(null); // Cerrar InfoWindow
            
            setFormData({
                nombre: punto.nombre,
                descripcion: punto.descripcion || '',
                lat: punto.coordenadas.lat,
                lng: punto.coordenadas.lng,
                idTipoPunto: punto.tipoPunto?.id || '',
                estado: punto.estado || 'BUENO'
            });
            setEditingId(id);
            setModoAgregar(true);
            
            // Establecer marcador temporal para edición
            setTempMarker({
                lat: parseFloat(punto.coordenadas.lat),
                lng: parseFloat(punto.coordenadas.lng)
            });

            // Centrar mapa
            if (map) {
                map.panTo({ lat: parseFloat(punto.coordenadas.lat), lng: parseFloat(punto.coordenadas.lng) });
                map.setZoom(15);
            }
        }
    };

    const handleEliminarPunto = async (id) => {
        const punto = puntos.find(p => p.id === id);
        const nombrePunto = punto ? toStartCase(punto.nombre) : 'este punto';
        
        const confirmResult = await showConfirmAlert(
            '¿Confirmar Eliminación?',
            `¿Estás seguro de que quieres eliminar "${nombrePunto}"? Esta acción no se puede deshacer y el punto será eliminado permanentemente del sistema.`,
            'Sí, Eliminar',
            'Cancelar'
        );
        
        if (confirmResult.isConfirmed) {
            try {
                const result = await deletePuntoGeografico(id);
                if (result?.status === 'Success') {
                    toast.success('Punto eliminado correctamente');
                    setSelectedMarker(null);
                    cargarDatos();
                } else {
                    toast.error('Error al eliminar el punto');
                }
            } catch (error) {
                console.error('Error al eliminar punto:', error);
                toast.error('Error al eliminar el punto');
            }
        }
    };

    const handleEditJurisdiccion = (id) => {
        const jurisdiccion = jurisdicciones.find(j => j.id === id);
        if (jurisdiccion) {
            setSelectedJurisdiccion(null); // Cerrar InfoWindow
            
            // Cargar datos de la jurisdicción en el formulario
            setJurisForm({
                nombre: jurisdiccion.nombre || '',
                descripcion: jurisdiccion.descripcion || '',
                color: jurisdiccion.color || '#22c55e'
            });
            
            // Cargar coordenadas
            if (jurisdiccion.coordenadas && Array.isArray(jurisdiccion.coordenadas)) {
                const coords = jurisdiccion.coordenadas.map(c => ({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }));
                setCoordsDibujo(coords);
            }
            
            setEditingJurisId(id);
            setDibujarJuris(true);
            
            // Centrar mapa
            if (map && jurisdiccion.coordenadas && jurisdiccion.coordenadas.length > 0) {
                const firstCoord = jurisdiccion.coordenadas[0];
                map.panTo({ lat: parseFloat(firstCoord.lat), lng: parseFloat(firstCoord.lng) });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.lat || !formData.lng) {
            toast.error('Haz clic en el mapa para seleccionar una ubicación');
            return;
        }

        if (!user?.companiaId) {
            toast.error('No se pudo obtener la compañía del usuario');
            return;
        }

        setLoading(true);
        try {
            const dataToSend = {
                ...formData,
                idCompania: user.companiaId
            };

            const result = editingId
                ? await updatePuntoGeografico(editingId, dataToSend)
                : await createPuntoGeografico(dataToSend);

            if (result?.status === 'Success') {
                toast.success(editingId ? 'Punto actualizado' : 'Punto creado correctamente');
                cancelarFormulario();
                cargarDatos();
            } else {
                toast.error(result?.message || 'Error al guardar el punto');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar el punto');
        } finally {
            setLoading(false);
        }
    };

    const cancelarFormulario = () => {
        setTempMarker(null);
        
        setFormData({
            nombre: '',
            descripcion: '',
            lat: null,
            lng: null,
            idTipoPunto: '',
            estado: 'BUENO'
        });
        setEditingId(null);
        setModoAgregar(false);
    };

    // Generar icono para Google Maps
    const getMarkerIcon = (punto) => {
        const color = punto.tipoPunto?.color || '#FF0000';
        const nombreTipo = (punto.tipoPunto?.nombre || '').toLowerCase();
        const iconOverride = nombreTipo.includes('grifo') ? 'CustomHydrant' : punto.tipoPunto?.icono;
        
        // Si hay icono, construimos un marcador circular con el icono dentro
        if (iconOverride) {
            let originalSvg = getIconoSvg(iconOverride);
            
            // Extraer el contenido del path del SVG original
            // Asumimos que el SVG tiene formato estándar <svg ...>content</svg>
            let iconContent = originalSvg;
            const contentMatch = originalSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
            if (contentMatch && contentMatch[1]) {
                iconContent = contentMatch[1];
            }

            // Crear un nuevo SVG que sea un círculo con el icono blanco dentro
            // El viewBox es 0 0 40 40 para el marcador completo
            // El icono original (24x24) se centra con translate(8, 8)
            const svgString = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
                    <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2" shadow="true"/>
                    <g transform="translate(8, 8)" fill="white">
                        ${iconContent.replace(/fill="[^"]*"/g, 'fill="white"').replace(/currentColor/g, 'white')}
                    </g>
                </svg>
            `.trim();

            return {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString),
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20)
            };
        }

        // Fallback: Marcador por defecto
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                <path fill="${color}" stroke="white" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
            </svg>
        `;
        return {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 40)
        };
    };

    // Estilos del mapa (Ocultar POIs y tránsito)
    const mapStyles = [
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [
                { "visibility": "off" }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
                { "visibility": "off" }
            ]
        },
        {
            "featureType": "transit",
            "stylers": [
                { "visibility": "off" }
            ]
        }
    ];

    if (!isLoaded) {
        return <BomberosLoader fullScreen message="Cargando mapa..." size="lg" />;
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-8rem)] bg-gray-50 overflow-hidden">
            {/* Header principal con estilo glassmorphism */}
            <div className="px-4 py-3 w-full">
                <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Título con icono y tooltip */}
                        <div className="flex items-center gap-3">
                            <MdMap className="h-8 w-8 text-[#4EB9FA]" />
                            <div>
                                <h1 className="text-2xl font-bold text-[#2C3E50]">Mapa</h1>
                            </div>
                            <Tooltip
                                id="mapa-help"
                                content="Gestiona puntos de interés, ubicaciones de bomberos, incidentes y jurisdicciones en el mapa. Puedes agregar nuevos puntos, dibujar polígonos de jurisdicción, filtrar por categorías y visualizar información geográfica relevante."
                                place="right"
                                variant="dark"
                            >
                                <MdHelpOutline className="h-4 w-4 text-gray-400 hover:text-[#4EB9FA] transition-colors cursor-help" />
                            </Tooltip>
                        </div>

                        {/* Filtros de categoría */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Mostrar:</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filtrosCategorias.PUNTO_INTERES}
                                    onChange={(e) => setFiltrosCategorias(prev => ({ ...prev, PUNTO_INTERES: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Puntos de Interés</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filtrosCategorias.UBICACION_BOMBERO}
                                    onChange={(e) => setFiltrosCategorias(prev => ({ ...prev, UBICACION_BOMBERO: e.target.checked }))}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Ubicaciones Bomberos</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filtrosCategorias.INCIDENTE}
                                    onChange={(e) => setFiltrosCategorias(prev => ({ ...prev, INCIDENTE: e.target.checked }))}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">Incidentes</span>
                            </label>
                        </div>
                        
                        {/* Botones de acción */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDibujarJuris(v => !v)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white disabled:bg-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                                    title="Dibujar polígono de jurisdicción"
                                >
                                    {dibujarJuris ? 'Finalizar Dibujo' : 'Dibujar Jurisdicción'}
                                </button>
                                <button
                                    onClick={() => setModoAgregar(!modoAgregar)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {modoAgregar ? <MdClose className="w-5 h-5" /> : <MdAdd className="w-5 h-5" />}
                                    {modoAgregar ? 'Cancelar' : 'Nuevo Punto'}
                                </button>
                            </div>
                            
                            <button
                                onClick={cargarDatos}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Actualizando...' : 'Actualizar'}
                            </button>
                            
                            {ultimaActualizacion && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="text-sm text-green-700 font-medium">
                                        Última actualización:
                                    </span>
                                    <span className="text-sm text-green-800 font-semibold">
                                        {formatTiempoTranscurrido(tiempoTranscurrido)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Mapa */}
                <div className="flex-1 relative min-w-0">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onClick={handleMapClick}
                        options={{
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: true,
                            disableDefaultUI: false,
                            styles: mapStyles
                        }}
                    >
                        {/* Marcadores */}
                        {puntos.map(punto => {
                            // Debug log
                            // console.log('Renderizando punto:', punto);
                            
                            if (!punto.coordenadas) {
                                console.warn('Punto sin coordenadas:', punto);
                                return null;
                            }
                            
                            const isVisible = filtrosCategorias[punto.categoria || 'PUNTO_INTERES'];
                            if (!isVisible) {
                                // console.log('Punto filtrado por categoría:', punto.nombre, punto.categoria);
                                return null;
                            }
                            
                            try {
                                const icon = getMarkerIcon(punto);
                                const position = { lat: parseFloat(punto.coordenadas.lat), lng: parseFloat(punto.coordenadas.lng) };
                                
                                if (isNaN(position.lat) || isNaN(position.lng)) {
                                    console.error('Coordenadas inválidas para punto:', punto);
                                    return null;
                                }

                                return (
                                    <Marker
                                        key={punto.id}
                                        position={position}
                                        onClick={() => setSelectedMarker(punto)}
                                        icon={icon}
                                    />
                                );
                            } catch (err) {
                                console.error('Error renderizando marcador:', err, punto);
                                return null;
                            }
                        })}

                        {/* Marcador temporal al agregar/editar */}
                        {tempMarker && (
                            <Marker
                                position={tempMarker}
                                animation={window.google.maps.Animation.BOUNCE}
                                draggable={!!editingId}
                                onDragEnd={(e) => {
                                    const lat = e.latLng.lat();
                                    const lng = e.latLng.lng();
                                    setTempMarker({ lat, lng });
                                    setFormData(prev => ({ ...prev, lat, lng }));
                                }}
                            />
                        )}

                        {/* Jurisdicciones */}
                        {mostrarJurisdicciones && jurisdicciones.map(jurisdiccion => (
                            <Polygon
                                key={jurisdiccion.id}
                                paths={jurisdiccion.coordenadas.map(c => ({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }))}
                                options={{
                                    fillColor: jurisdiccion.color || '#22c55e',
                                    fillOpacity: 0.15,
                                    strokeColor: jurisdiccion.color || '#16a34a',
                                    strokeOpacity: 1,
                                    strokeWeight: 2,
                                }}
                                onClick={(e) => {
                                    setSelectedJurisdiccion({
                                        ...jurisdiccion,
                                        clickPosition: e.latLng
                                    });
                                    setSelectedMarker(null);
                                }}
                            />
                        ))}

                        {/* Polígono en dibujo */}
                        {dibujarJuris && coordsDibujo.length > 0 && (
                            <>
                                {coordsDibujo.map((coord, index) => (
                                    <Marker
                                        key={index}
                                        position={coord}
                                        icon={{
                                            path: window.google.maps.SymbolPath.CIRCLE,
                                            scale: 4,
                                            fillColor: '#0ea5e9',
                                            fillOpacity: 1,
                                            strokeColor: '#ffffff',
                                            strokeWeight: 2,
                                        }}
                                    />
                                ))}
                                <Polygon
                                    paths={coordsDibujo}
                                    options={{
                                        fillColor: jurisForm.color || '#22c55e',
                                        fillOpacity: 0.15,
                                        strokeColor: '#0ea5e9',
                                        strokeOpacity: 1,
                                        strokeWeight: 2,
                                        strokeDashArray: [2, 2]
                                    }}
                                />
                            </>
                        )}

                        {/* InfoWindow para Marcadores */}
                        {selectedMarker && (
                            <InfoWindow
                                position={{ lat: parseFloat(selectedMarker.coordenadas.lat), lng: parseFloat(selectedMarker.coordenadas.lng) }}
                                onCloseClick={() => setSelectedMarker(null)}
                            >
                                <div className="p-2 min-w-[300px]">
                                    <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-200">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${selectedMarker.tipoPunto?.color || '#FF0000'} 0%, ${selectedMarker.tipoPunto?.color ? selectedMarker.tipoPunto.color + 'dd' : '#CC0000'} 100%)` }}>
                                            {selectedMarker.tipoPunto?.icono ? (
                                                <div dangerouslySetInnerHTML={{ __html: getIconoSvg(selectedMarker.tipoPunto.icono).replace('currentColor', 'white').replace('width="24"', 'width="28"').replace('height="24"', 'height="28"') }} />
                                            ) : <span className="text-xl font-bold">?</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{toStartCase(selectedMarker.nombre)}</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${selectedMarker.tipoPunto?.color || '#FF0000'}20`, color: selectedMarker.tipoPunto?.color || '#FF0000' }}>
                                                    {toStartCase(selectedMarker.tipoPunto?.nombre || 'Sin tipo')}
                                                </span>
                                                {selectedMarker.compania?.nombre && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {toStartCase(selectedMarker.compania.nombre)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {selectedMarker.descripcion && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{toStartCase(selectedMarker.descripcion)}</p>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                                            <div className="text-xs font-medium text-gray-500 mb-2">Estado</div>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${
                                                selectedMarker.estado === 'BUENO' ? 'bg-green-500' : 
                                                selectedMarker.estado === 'REGULAR' ? 'bg-yellow-500' : 
                                                selectedMarker.estado === 'MALO' ? 'bg-red-500' : 'bg-gray-500'
                                            }`}>
                                                {selectedMarker.estado === 'BUENO' ? 'Bueno' : 
                                                  selectedMarker.estado === 'REGULAR' ? 'Regular' : 
                                                  selectedMarker.estado === 'MALO' ? 'Malo' : 'Fuera de Servicio'}
                                            </span>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                                            <div className="text-xs font-medium text-gray-500 mb-2">Registrado</div>
                                            <div className="text-sm text-gray-800 font-medium font-mono text-xs">
                                                {formatDate(selectedMarker.creadoEl)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                                        <button onClick={() => handleEditPunto(selectedMarker.id)} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105">
                                            <MdEdit className="w-4 h-4" /> Editar
                                        </button>
                                        <button onClick={() => handleEliminarPunto(selectedMarker.id)} className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105">
                                            <MdDelete className="w-4 h-4" /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}

                        {/* InfoWindow para Jurisdicciones */}
                        {selectedJurisdiccion && (
                            <InfoWindow
                                position={selectedJurisdiccion.clickPosition}
                                onCloseClick={() => setSelectedJurisdiccion(null)}
                            >
                                <div className="p-2 min-w-[300px]">
                                    <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-200">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${selectedJurisdiccion.color || '#16a34a'} 0%, ${selectedJurisdiccion.color ? selectedJurisdiccion.color + 'dd' : '#16a34a'} 100%)` }}>
                                            <MdMap className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{toStartCase(selectedJurisdiccion.nombre || 'Jurisdicción')}</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${selectedJurisdiccion.color || '#16a34a'}20`, color: selectedJurisdiccion.color || '#16a34a' }}>
                                                    Área de cobertura
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {selectedJurisdiccion.descripcion && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{toStartCase(selectedJurisdiccion.descripcion)}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                                        <button 
                                            onClick={() => handleEditJurisdiccion(selectedJurisdiccion.id)}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <MdEdit className="w-4 h-4" /> Editar Jurisdicción
                                        </button>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>

                    <button
                        type="button"
                        onClick={() => { setMostrarJurisdicciones(v => !v); }}
                        title={mostrarJurisdicciones ? 'Ocultar jurisdicciones' : 'Mostrar jurisdicciones'}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full shadow bg-white border ${mostrarJurisdicciones ? 'text-green-700 border-green-300' : 'text-gray-700 border-gray-300'} hover:bg-gray-50`}
                    >
                        {mostrarJurisdicciones ? <MdVisibility className="w-6 h-6" /> : <MdVisibilityOff className="w-6 h-6" />}
                    </button>

                    {/* Panel lateral de dibujo de jurisdicción */}
                    {dibujarJuris && (
                        <div className="absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-200 overflow-y-auto z-20 shadow-lg">
                            <div className="p-6 space-y-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {editingJurisId ? <MdEdit className="w-6 h-6" /> : <MdAdd className="w-6 h-6" />}
                                    {editingJurisId ? 'Editar Jurisdicción' : 'Nueva Jurisdicción'}
                                </h2>
                                
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-1">
                                        <MdLocationOn className="w-5 h-5" />
                                        {editingJurisId ? 'Modifica el polígono haciendo clic en el mapa' : 'Haz clic en el mapa para agregar vértices'}
                                    </p>
                                    <p className="text-xs text-blue-700">
                                        Puntos agregados: <span className="font-semibold">{coordsDibujo.length}</span> {coordsDibujo.length < 3 && '(mínimo 3)'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={jurisForm.nombre}
                                        onChange={(e)=>setJurisForm({ ...jurisForm, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Zona Norte"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={jurisForm.descripcion}
                                        onChange={(e)=>setJurisForm({ ...jurisForm, descripcion: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Descripción de la jurisdicción..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={jurisForm.color}
                                            onChange={(e)=>setJurisForm({ ...jurisForm, color: e.target.value })}
                                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={jurisForm.color}
                                            onChange={(e)=>setJurisForm({ ...jurisForm, color: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                            placeholder="#22c55e"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button 
                                        type="button" 
                                        onClick={()=>setCoordsDibujo(prev=>prev.slice(0,-1))} 
                                        disabled={coordsDibujo.length === 0}
                                        className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        Deshacer
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={()=>{ setCoordsDibujo([]); }} 
                                        disabled={coordsDibujo.length === 0}
                                        className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDibujarJuris(false);
                                            setCoordsDibujo([]);
                                            setEditingJurisId(null);
                                            setJurisForm({ nombre: '', descripcion: '', color: '#22c55e' });
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        <MdClose className="w-5 h-5" />
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={coordsDibujo.length < 3 || loading || !jurisForm.nombre.trim()}
                                        onClick={async()=>{
                                            if (!user?.companiaId) { toast.error('No se pudo obtener la compañía del usuario'); return; }
                                            try {
                                                setLoading(true);
                                                const coordenadas = coordsDibujo.map(({lng, lat})=>({ lat, lng }));
                                                const first = coordenadas[0];
                                                const last = coordenadas[coordenadas.length-1];
                                                if (first.lat !== last.lat || first.lng !== last.lng) coordenadas.push({ ...first });
                                                
                                                if (editingJurisId) {
                                                    const result = await updateJurisdiccion(editingJurisId, {
                                                        nombre: jurisForm.nombre || 'Jurisdicción',
                                                        descripcion: jurisForm.descripcion || '',
                                                        color: jurisForm.color || '#22c55e',
                                                        coordenadas
                                                    });
                                                    if (result?.status === 'Success') {
                                                        toast.success('Jurisdicción actualizada');
                                                    } else {
                                                        toast.error('Error al actualizar la jurisdicción');
                                                    }
                                                } else {
                                                    await createJurisdiccion({ 
                                                        nombre: jurisForm.nombre || 'Jurisdicción', 
                                                        descripcion: jurisForm.descripcion || '', 
                                                        color: jurisForm.color || '#22c55e', 
                                                        coordenadas, 
                                                        idCompania: user.companiaId 
                                                    });
                                                    toast.success('Jurisdicción creada');
                                                }
                                                
                                                setDibujarJuris(false);
                                                setCoordsDibujo([]);
                                                setEditingJurisId(null);
                                                setJurisForm({ nombre: '', descripcion: '', color: '#22c55e' });
                                                await cargarDatos();
                                            } catch (e) { 
                                                toast.error(editingJurisId ? 'Error al actualizar la jurisdicción' : 'Error al crear la jurisdicción'); 
                                            } finally { 
                                                setLoading(false); 
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        <MdSave className="w-5 h-5" />
                                        {loading ? 'Guardando…' : editingJurisId ? 'Actualizar' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!dibujarJuris && !modoAgregar && (
                        <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border border-gray-200 w-64 z-10">
                            <h4 className="text-md font-bold mb-3 text-gray-800">Leyenda de puntos</h4>
                            <ul className="space-y-3">
                                {tiposPunto.map(tipo => (
                                    <li key={tipo.id} className="flex items-center gap-3">
                                        {renderLegendIcon(tipo.icono, tipo.color, tipo.nombre)}
                                        <span className="text-sm text-gray-700 font-medium">{tipo.nombre}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {(modoAgregar || dibujarJuris) && (
                        <div className="absolute top-4 left-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 shadow-lg z-10">
                            <p className="text-sm font-medium text-yellow-800">
                                <MdLocationOn className="inline w-5 h-5 mr-1" />
                                {modoAgregar ? 'Haz clic en el mapa para seleccionar la ubicación' : 'Haz clic en el mapa para agregar vértices al polígono'}
                            </p>
                        </div>
                    )}

                    {/* Panel lateral - Formulario */}
                    {modoAgregar && (
                        <div className="absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-200 overflow-y-auto z-20 shadow-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {editingId ? <MdEdit className="w-6 h-6" /> : <MdAdd className="w-6 h-6" />}
                                {editingId ? 'Editar Punto' : 'Nuevo Punto'}
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Cuartel Central"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Punto *
                                </label>
                                <Select
                                    inputId="tipoPunto"
                                    isSearchable
                                    isClearable
                                    value={selectedTipoPuntoOption}
                                    options={tipoPuntoOptions}
                                    onChange={(option) => setFormData({ ...formData, idTipoPunto: option?.value || '' })}
                                    placeholder="Selecciona un tipo"
                                    styles={selectStyles}
                                    classNamePrefix="tipo-punto-select"
                                    menuPortalTarget={selectMenuPortalTarget}
                                />
                                {formData.idTipoPunto && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                        {renderIcon(
                                            tiposPunto.find(t => t.id === parseInt(formData.idTipoPunto))?.icono,
                                            { className: 'w-5 h-5', style: { color: tiposPunto.find(t => t.id === parseInt(formData.idTipoPunto))?.color } }
                                        )}
                                        <span>{tiposPunto.find(t => t.id === parseInt(formData.idTipoPunto))?.nombre}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado del Punto *
                                </label>
                                <Select
                                    inputId="estadoPunto"
                                    isSearchable={false}
                                    value={selectedEstadoOption}
                                    options={estadoOptions}
                                    onChange={(option) => setFormData({ ...formData, estado: option?.value || 'BUENO' })}
                                    placeholder="Selecciona un estado"
                                    styles={selectStyles}
                                    classNamePrefix="estado-punto-select"
                                    menuPortalTarget={selectMenuPortalTarget}
                                />
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                    {formData.estado === 'BUENO' && <><MdCheckCircle className="text-green-600" /> Estado Bueno</>}
                                    {formData.estado === 'REGULAR' && <><MdWarning className="text-yellow-600" /> Estado Regular</>}
                                    {formData.estado === 'MALO' && <><MdCancel className="text-red-600" /> Estado Malo</>}
                                    {formData.estado === 'FUERA_DE_SERVICIO' && <><MdBuild className="text-gray-600" /> Fuera de Servicio</>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Descripción adicional..."
                                />
                            </div>

                            {user?.companiaId && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                                        <MdBusiness className="w-4 h-4" /> Compañía:
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        ID: {user.companiaId}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Este punto se asignará automáticamente a tu compañía
                                    </p>
                                </div>
                            )}

                            {formData.lat && formData.lng && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm font-medium text-green-800">Ubicación seleccionada:</p>
                                    <p className="text-sm text-green-700 font-mono">
                                        {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    <MdSave className="w-5 h-5" />
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelarFormulario}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    <MdClose className="w-5 h-5" />
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default Mapa;
