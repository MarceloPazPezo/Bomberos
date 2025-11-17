import React, { useState, useEffect, useRef, useMemo } from 'react';
import Select from 'react-select';
import { 
    MdLocationOn, MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdRefresh,
    MdCheckCircle, MdWarning, MdCancel, MdBuild, MdBusiness,
    MdVisibility, MdVisibilityOff
} from 'react-icons/md';
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
import 'maplibre-gl/dist/maplibre-gl.css';
import BomberosLoader from '@components/BomberosLoader';

const PuntosInteres = () => {
    const { bombero: user } = useAuth();
    
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef({});
    const tempMarkerRef = useRef(null); // Marcador temporal para nueva ubicación
    const modoAgregarRef = useRef(false);
    const openPopupRef = useRef(null); // Referencia al popup abierto actualmente
    const [maplibregl, setMaplibregl] = useState(null);
    const [isMapReady, setIsMapReady] = useState(false);
    
    // Funciones helper para formateo
    const toStartCase = (text) => {
        if (!text) return '';
        // Convertir a minúsculas y capitalizar la primera letra de cada palabra
        // Usando una regex que funciona correctamente con caracteres acentuados
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
    
    // Estados
    const [puntos, setPuntos] = useState([]);
    const [tiposPunto, setTiposPunto] = useState([]);
    const [jurisdicciones, setJurisdicciones] = useState([]);
    const [mostrarJurisdicciones, setMostrarJurisdicciones] = useState(true);
    const [jurisForm, setJurisForm] = useState({ nombre: '', descripcion: '', color: '#22c55e' });
    // Modo dibujo en el mapa
    const [dibujarJuris, setDibujarJuris] = useState(false);
    const dibujarJurisRef = useRef(false);
    const [coordsDibujo, setCoordsDibujo] = useState([]); // [[lng,lat], ...]
    const [editingJurisId, setEditingJurisId] = useState(null); // ID de la jurisdicción que se está editando
    const [loading, setLoading] = useState(false);
    const [modoAgregar, setModoAgregar] = useState(false);
    
    // Formulario - idCompania se asigna automáticamente de la compañía del usuario
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

    // Estilos para los Select (igual que en crear parte)
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
        // Si el tipo es grifo, muestra un hidrante custom
        if (nombre && nombre.toLowerCase().includes('grifo')) {
            return (
                <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white shadow"
                    style={{ color: color || '#333' }}
                    dangerouslySetInnerHTML={{ __html: getIconoSvg('CustomHydrant').replace('24 24','20 20') }}
                />
            );
        }
        // Si no, muestra el SVG normal
        return (
            <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white shadow"
                style={{ color: color || '#333' }}
                dangerouslySetInnerHTML={{ __html: getIconoSvg(icono) }}
            />
        );
    };

    // Sincronizar modoAgregar con la referencia y limpiar marcador temporal
    useEffect(() => {
        modoAgregarRef.current = modoAgregar;
        
        // Si salimos del modo agregar, eliminar marcador temporal
        if (!modoAgregar && tempMarkerRef.current) {
            tempMarkerRef.current.remove();
            tempMarkerRef.current = null;
        }

        // Forzar resize del mapa cuando el sidebar aparece/desaparece para evitar tirones
        if (map.current) {
            setTimeout(() => {
                try { map.current.resize(); } catch {}
            }, 0);
        }
    }, [modoAgregar]);

    // Cargar MapLibre
    useEffect(() => {
        const loadMapLibre = async () => {
            try {
                const maplibreModule = await import('maplibre-gl');
                const maplibre = maplibreModule.default || maplibreModule;
                console.log('MapLibre GL cargado exitosamente');
                setMaplibregl(maplibre);
            } catch (error) {
                console.error('Error cargando MapLibre:', error);
                toast.error('Error al cargar el mapa');
            }
        };
        loadMapLibre();
    }, []);

    // Inicializar mapa
    useEffect(() => {
        if (!mapContainer.current || map.current || !maplibregl) return;

        // Usar setTimeout para asegurar que el DOM esté completamente renderizado
        const initMap = setTimeout(() => {
            if (!mapContainer.current || map.current) return;

            // Verificar que el contenedor tenga dimensiones
            const containerRect = mapContainer.current.getBoundingClientRect();
            console.log('Dimensiones del contenedor:', containerRect);
            
            if (containerRect.width === 0 || containerRect.height === 0) {
                console.warn('Contenedor del mapa no tiene dimensiones, esperando...');
                return;
            }

            try {
                console.log('Inicializando mapa MapLibre GL...');
                
                map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: {
                    version: 8,
                    sources: {
                        'osm': {
                            type: 'raster',
                            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                            tileSize: 256,
                            attribution: '© OpenStreetMap contributors'
                        }
                    },
                    layers: [{
                        id: 'osm',
                        type: 'raster',
                        source: 'osm'
                    }]
                },
                center: [-72.4000, -37.0333], // Cabrero, Región del Bío-Bío
                zoom: 13,
                attributionControl: true
            });

            // Esperar a que el mapa esté completamente cargado
            map.current.on('load', () => {
                console.log('Mapa cargado y listo');
                setIsMapReady(true);
                toast.success('Mapa cargado exitosamente');
            });

            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
            map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

            // Click en el mapa para agregar puntos
            map.current.on('click', (e) => {
                console.log('Click en mapa detectado. Modo agregar:', modoAgregarRef.current);
                if (dibujarJurisRef.current) {
                    const { lng, lat } = e.lngLat;
                    setCoordsDibujo(prev => [...prev, [lng, lat]]);
                    return;
                }
                if (modoAgregarRef.current) {
                    const lat = e.lngLat.lat;
                    const lng = e.lngLat.lng;
                    console.log('Ubicación seleccionada:', { lat, lng });
                    
                    // Eliminar marcador temporal anterior si existe
                    if (tempMarkerRef.current) {
                        tempMarkerRef.current.remove();
                    }
                    
                    // Crear marcador temporal con estilo personalizado
                    const el = document.createElement('div');
                    el.className = 'temp-marker';
                    el.style.width = '40px';
                    el.style.height = '40px';
                    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGNkIwMCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyQzguMTMgMiA1IDUuMTMgNSA5YzAgNS4yNSA3IDEzIDcgMTNzNy03Ljc1IDctMTNjMC0zLjg3LTMuMTMtNy03LTd6bTAgOS41Yy0xLjM4IDAtMi41LTEuMTItMi41LTIuNXMxLjEyLTIuNSAyLjUtMi41IDIuNSAxLjEyIDIuNSAyLjUtMS4xMiAyLjUtMi41IDIuNXoiLz48L3N2Zz4=)';
                    el.style.backgroundSize = 'contain';
                    el.style.backgroundRepeat = 'no-repeat';
                    el.style.cursor = 'pointer';
                    el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
                    el.style.animation = 'bounce 0.5s ease';
                    
                    // Agregar animación CSS
                    const style = document.createElement('style');
                    style.textContent = `
                        @keyframes bounce {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-10px); }
                        }
                    `;
                    if (!document.head.querySelector('style[data-marker-animation]')) {
                        style.setAttribute('data-marker-animation', 'true');
                        document.head.appendChild(style);
                    }
                    
                    tempMarkerRef.current = new maplibregl.Marker(el)
                        .setLngLat([lng, lat])
                        .addTo(map.current);
                    
                    setFormData(prev => ({
                        ...prev,
                        lat,
                        lng
                    }));
                    toast.success(`Ubicación seleccionada: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                }
            });

            // Manejar pérdida de contexto WebGL
            map.current.on('webglcontextlost', (e) => {
                console.error('WebGL context lost', e);
                setIsMapReady(false);
                toast.error('Se perdió el contexto WebGL. Recarga la página.');
            });

            map.current.on('webglcontextrestored', () => {
                console.log('WebGL context restored');
                setIsMapReady(true);
                toast.success('Contexto WebGL restaurado');
            });

            map.current.on('error', (e) => {
                console.error('Error en el mapa:', e);
            });

            } catch (error) {
                console.error('Error inicializando mapa:', error);
                toast.error('Error al inicializar el mapa');
            }
        }, 100); // Esperar 100ms para que el DOM esté listo

        return () => {
            clearTimeout(initMap);
            if (map.current) {
                console.log('Limpiando instancia del mapa');
                map.current.remove();
                map.current = null;
                setIsMapReady(false);
            }
        };
    }, [maplibregl]);

    // Cargar datos iniciales cuando el mapa esté listo
    useEffect(() => {
        if (isMapReady) {
            cargarDatos();
        }
    }, [isMapReady]);

    // Actualizar contador de tiempo transcurrido cada segundo (solo cuando la página está visible)
    useEffect(() => {
        if (!ultimaActualizacion) return;

        // Función para actualizar el tiempo
        const updateTime = () => {
            const ahora = new Date();
            const diferencia = Math.floor((ahora - ultimaActualizacion) / 1000);
            setTiempoTranscurrido(diferencia);
        };

        // Actualizar inmediatamente
        updateTime();

        // Solo crear el interval si la página está visible
        const interval = setInterval(() => {
            // Verificar si la página está visible
            if (document.visibilityState === 'visible') {
                updateTime();
            }
        }, 1000);

        // Escuchar cambios de visibilidad de la página
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Actualizar inmediatamente cuando la página vuelve a ser visible
                updateTime();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup: limpiar interval y event listener cuando el componente se desmonte
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [ultimaActualizacion]);

    // Cleanup adicional cuando el componente se desmonta completamente
    useEffect(() => {
        return () => {
            // Limpiar cualquier timer que pueda quedar pendiente
            setTiempoTranscurrido(0);
            setUltimaActualizacion(null);
        };
    }, []);

    // Actualizar marcadores cuando cambien los puntos
    useEffect(() => {
        if (map.current && maplibregl && puntos.length > 0) {
            actualizarMarcadores();
        }
    }, [puntos, maplibregl]);

    // Re-render de jurisdicciones cuando cambia la visibilidad o el set de jurisdicciones
    useEffect(() => {
        if (map.current && maplibregl) {
            actualizarMarcadores();
        }
    }, [mostrarJurisdicciones, jurisdicciones]);

    // Sincronizar ref del modo dibujo
    useEffect(() => {
        dibujarJurisRef.current = dibujarJuris;
        if (!dibujarJuris) {
            setCoordsDibujo([]);
            setEditingJurisId(null);
            // limpiar capas temporales de dibujo
            if (map.current) {
                ['juris-draw-fill','juris-draw-line','juris-draw-points'].forEach(id => {
                    if (map.current.getLayer(id)) map.current.removeLayer(id);
                });
                ['juris-draw-line-src','juris-draw-poly-src','juris-draw-points-src'].forEach(id => {
                    if (map.current.getSource(id)) map.current.removeSource(id);
                });
            }
        }
    }, [dibujarJuris]);

    // Actualizar previsualización del polígono en dibujo
    useEffect(() => {
        if (!map.current || !maplibregl) return;
        // limpiar anteriores
        ['juris-draw-fill','juris-draw-line','juris-draw-points'].forEach(id => {
            if (map.current.getLayer(id)) map.current.removeLayer(id);
        });
        ['juris-draw-line-src','juris-draw-poly-src','juris-draw-points-src'].forEach(id => {
            if (map.current.getSource(id)) map.current.removeSource(id);
        });

        // puntos
        if (coordsDibujo.length > 0) {
            const pointsFc = {
                type: 'FeatureCollection',
                features: coordsDibujo.map(([lng,lat]) => ({
                    type: 'Feature', geometry: { type: 'Point', coordinates: [lng,lat] }, properties: {}
                }))
            };
            map.current.addSource('juris-draw-points-src', { type: 'geojson', data: pointsFc });
            map.current.addLayer({ id: 'juris-draw-points', type: 'circle', source: 'juris-draw-points-src', paint: {
                'circle-radius': 4, 'circle-color': '#0ea5e9', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
        }

        // línea
        if (coordsDibujo.length >= 2) {
            const line = { type: 'Feature', geometry: { type: 'LineString', coordinates: coordsDibujo }, properties: {} };
            map.current.addSource('juris-draw-line-src', { type: 'geojson', data: line });
            map.current.addLayer({ id: 'juris-draw-line', type: 'line', source: 'juris-draw-line-src', paint: {
                'line-color': '#0ea5e9', 'line-width': 2, 'line-dasharray': [2,2] } });
        }

        // polígono si hay 3 o más puntos
        if (coordsDibujo.length >= 3) {
            const closed = [...coordsDibujo, coordsDibujo[0]];
            const poly = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [closed] }, properties: {} };
            map.current.addSource('juris-draw-poly-src', { type: 'geojson', data: poly });
            map.current.addLayer({ id: 'juris-draw-fill', type: 'fill', source: 'juris-draw-poly-src', paint: {
                'fill-color': jurisForm.color || '#22c55e', 'fill-opacity': 0.15 } });
            map.current.addLayer({ id: 'juris-draw-line', type: 'line', source: 'juris-draw-poly-src', paint: {
                'line-color': jurisForm.color || '#16a34a', 'line-width': 2 } });
        }
    }, [coordsDibujo, maplibregl, jurisForm.color]);

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
            
            // Actualizar timestamp de última actualización
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

    const actualizarMarcadores = () => {
        // PRIMERO: Dibujar jurisdicciones como polígonos (DEBEN estar debajo de los puntos)
        if (map.current && maplibregl) {
            // Primero eliminar capas/fuentes anteriores para evitar duplicados
            jurisdicciones.forEach((j) => {
                const sourceId = `jurisdiccion-src-${j.id}`;
                const fillId = `jurisdiccion-fill-${j.id}`;
                const lineId = `jurisdiccion-line-${j.id}`;
                if (map.current.getLayer(fillId)) map.current.removeLayer(fillId);
                if (map.current.getLayer(lineId)) map.current.removeLayer(lineId);
                if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);
            });

            if (mostrarJurisdicciones) {
                jurisdicciones.forEach((j) => {
                    if (!Array.isArray(j.coordenadas) || j.coordenadas.length === 0) return;

                    const sourceId = `jurisdiccion-src-${j.id}`;
                    const fillId = `jurisdiccion-fill-${j.id}`;
                    const lineId = `jurisdiccion-line-${j.id}`;

                    const polygon = {
                        type: 'Feature',
                        properties: { id: j.id, nombre: j.nombre, color: j.color || '#22c55e' },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [j.coordenadas.map(c => [c.lng, c.lat])]
                        }
                    };

                    map.current.addSource(sourceId, {
                        type: 'geojson',
                        data: polygon
                    });

                    // Agregar capas AL PRINCIPIO del stack para que queden debajo de todo
                    // Usamos beforeId: undefined para insertar al inicio
                    const layers = map.current.getStyle().layers || [];
                    const firstSymbolLayer = layers.find(layer => layer.type === 'symbol')?.id;
                    
                    map.current.addLayer({
                        id: fillId,
                        type: 'fill',
                        source: sourceId,
                        beforeId: firstSymbolLayer || undefined, // Insertar antes de la primera capa de símbolos
                        paint: {
                            'fill-color': j.color || '#22c55e',
                            'fill-opacity': 0.15
                        }
                    });

                    map.current.addLayer({
                        id: lineId,
                        type: 'line',
                        source: sourceId,
                        beforeId: firstSymbolLayer || undefined,
                        paint: {
                            'line-color': j.color || '#16a34a',
                            'line-width': 2
                        }
                    });

                    // Interacción: popup con información de la jurisdicción (estilo similar a puntos)
                    const showJurisPopup = (e) => {
                        const center = e.lngLat;
                        if (openPopupRef.current && openPopupRef.current.isOpen()) {
                            openPopupRef.current.remove();
                        }
                        const jurisPopup = new maplibregl.Popup({ 
                            closeButton: true, 
                            closeOnClick: true, 
                            className: 'custom-popup',
                            closeOnMove: false,
                            maxWidth: '600px'
                        })
                            .setLngLat([center.lng, center.lat])
                            .setHTML(`
                                <div class="p-5 min-w-[450px] max-w-[600px]">
                                    <!-- Header con diseño horizontal -->
                                    <div class="flex items-start gap-4 mb-4 pb-4 border-b border-gray-200">
                                        <!-- Icono grande -->
                                        <div class="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg" style="background: linear-gradient(135deg, ${j.color || '#16a34a'} 0%, ${j.color ? j.color + 'dd' : '#16a34a'} 100%)">
                                            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2m4 0h14v-2H7v2m0 4h14v-2H7v2M3 17h2v-2H3v2m0-8h2V7H3v2m4 0h14V7H7v2Z"/></svg>
                                        </div>
                                        
                                        <!-- Información principal -->
                                        <div class="flex-1 min-w-0">
                                            <h3 class="text-xl font-bold text-gray-900 mb-1 leading-tight">${toStartCase(j.nombre || 'Jurisdicción')}</h3>
                                            <div class="flex items-center gap-2 flex-wrap">
                                                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style="background-color: ${j.color || '#16a34a'}20; color: ${j.color || '#16a34a'}">
                                                    Área de cobertura
                                                </span>
                                                ${j.compañia || j.compania ? `
                                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                                        </svg>
                                                        ${toStartCase((j.compania && j.compania.nombre) || '')}
                                                    </span>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Descripción -->
                                    ${j.descripcion ? `
                                        <div class="mb-4">
                                            <p class="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">${toStartCase(j.descripcion)}</p>
                                        </div>
                                    ` : ''}
                                    
                                    <!-- Información en grid horizontal -->
                                    <div class="grid grid-cols-2 gap-3 mb-4">
                                        <!-- Color -->
                                        <div class="bg-white border border-gray-200 rounded-lg p-3">
                                            <div class="text-xs font-medium text-gray-500 mb-2">Color</div>
                                            <div class="flex items-center gap-2">
                                                <span class="inline-block w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm" style="background-color:${j.color || '#16a34a'}"></span>
                                                <span class="text-sm text-gray-800 font-mono text-xs">${j.color || '#16a34a'}</span>
                                            </div>
                                        </div>
                                        
                                        <!-- Fecha -->
                                        <div class="bg-white border border-gray-200 rounded-lg p-3">
                                            <div class="text-xs font-medium text-gray-500 mb-2">Creada</div>
                                            <div class="flex items-center gap-1.5 text-sm text-gray-800">
                                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                <span class="font-medium font-mono text-xs">${j.creadoEl ? formatDate(j.creadoEl) : 'N/D'}</span>
                                            </div>
                                        </div>
                                    </div>
                                        
                                    <!-- Botones de acción -->
                                    <div class="flex gap-3 pt-3 border-t border-gray-200">
                                        <button 
                                            onclick="window.editarJurisdiccion && window.editarJurisdiccion(${j.id})"
                                            class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                            </svg>
                                            Editar Jurisdicción
                                        </button>
                                    </div>
                                </div>
                              `)
                            .addTo(map.current);
                        openPopupRef.current = jurisPopup;
                        jurisPopup.on('close', () => {
                            if (openPopupRef.current === jurisPopup) openPopupRef.current = null;
                        });
                    };
                    map.current.on('click', fillId, showJurisPopup);
                    map.current.setPaintProperty(fillId, 'fill-outline-color', j.color || '#16a34a');
                    map.current.on('mouseenter', fillId, () => { map.current.getCanvas().style.cursor = 'pointer'; });
                    map.current.on('mouseleave', fillId, () => { map.current.getCanvas().style.cursor = ''; });
                });
            }
        }

        // SEGUNDO: Limpiar marcadores anteriores
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};

        // Crear nuevos marcadores (sin filtro, mostrar todos)
        puntos.forEach(punto => {
            if (!punto.coordenadas) return;

            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.backgroundColor = punto.tipoPunto?.color || '#FF0000';
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.borderRadius = '50%';
            el.style.border = '3px solid white';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.fontSize = '20px';
            el.style.color = 'white';
            
            // Agregar icono si está disponible (forzar icono confiable para grifo)
            if (punto.tipoPunto?.icono) {
                // Inserta SVG y normaliza tamaño/ratio para evitar deformaciones
                const iconoSvg = document.createElement('div');
                const nombreTipo = (punto.tipoPunto?.nombre || '').toLowerCase();
                const iconOverride = nombreTipo.includes('grifo') ? 'CustomHydrant' : punto.tipoPunto.icono;
                iconoSvg.innerHTML = getIconoSvg(iconOverride);
                const svg = iconoSvg.querySelector('svg');
                if (svg) {
                    svg.setAttribute('width', '24');
                    svg.setAttribute('height', '24');
                    if (!svg.getAttribute('preserveAspectRatio')) {
                        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                    }
                    // Asegurar relleno por color del texto (blanco en el marcador)
                    if (!svg.getAttribute('fill')) svg.setAttribute('fill', 'currentColor');
                    svg.style.display = 'block';
                }
                iconoSvg.style.width = '24px';
                iconoSvg.style.height = '24px';
                iconoSvg.style.display = 'flex';
                iconoSvg.style.alignItems = 'center';
                iconoSvg.style.justifyContent = 'center';
                iconoSvg.style.pointerEvents = 'none';
                el.appendChild(iconoSvg);
            } else {
                // Fallback: mostrar las primeras letras del nombre
                el.textContent = punto.nombre?.substring(0, 2).toUpperCase() || '?';
            }
            
            // Crear el popup
            const popup = new maplibregl.Popup({
                    closeButton: true,
                    closeOnClick: false,
                className: 'custom-popup',
                closeOnMove: false,
                maxWidth: '550px'
                }).setHTML(`
                    <div class="p-4 min-w-[400px] max-w-[550px]">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm" style="background-color: ${punto.tipoPunto?.color || '#FF0000'}">
                                ${punto.tipoPunto?.icono ? getIconoSvg(punto.tipoPunto.icono).replace('currentColor', 'white').replace('24 24', '18 18') : ''}
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 leading-tight">${toStartCase(punto.nombre)}</h3>
                                <p class="text-sm text-gray-500 font-medium">${toStartCase(punto.tipoPunto?.nombre || 'Sin tipo')}</p>
                            </div>
                        </div>
                        
                        ${punto.descripcion ? `
                            <div class="mb-3">
                                <p class="text-sm text-gray-700 leading-relaxed">${toStartCase(punto.descripcion)}</p>
                            </div>
                        ` : ''}
                        
                        <div class="mb-4">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm" style="background-color: ${
                                punto.estado === 'BUENO' ? '#10B981' : 
                                punto.estado === 'REGULAR' ? '#F59E0B' : 
                                punto.estado === 'MALO' ? '#EF4444' : '#6B7280'
                            }">
                                <div class="w-2 h-2 rounded-full bg-white mr-2"></div>
                                ${punto.estado === 'BUENO' ? 'Bueno' : 
                                  punto.estado === 'REGULAR' ? 'Regular' : 
                                  punto.estado === 'MALO' ? 'Malo' : 'Fuera de Servicio'}
                            </span>
                        </div>
                        
                        <div class="space-y-2 mb-3">
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                <span class="font-medium">Compañía:</span>
                                <span class="text-gray-800">${toStartCase(punto.compania?.nombre || 'N/A')}</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span class="font-medium">Fecha:</span>
                                <span class="text-gray-800 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                           ${formatDate(punto.creadoEl)}
                                </span>
                            </div>
                        </div>
                        
                        <div class="flex gap-2 pt-2 border-t border-gray-100">
                            <button onclick="window.editarPunto(${punto.id})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Editar
                            </button>
                            <button onclick="window.eliminarPunto(${punto.id})" class="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Eliminar
                            </button>
                        </div>
                    </div>
                `);
            
            // Crear el marcador
            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([punto.coordenadas.lng, punto.coordenadas.lat])
                .setPopup(popup)
                .addTo(map.current);
            
            // Agregar eventos al popup para controlar qué popup está abierto
            popup.on('open', () => {
                // Si hay otro popup abierto, cerrarlo
                if (openPopupRef.current && openPopupRef.current !== popup && openPopupRef.current.isOpen()) {
                    openPopupRef.current.remove();
                }
                // Registrar este como el popup abierto
                openPopupRef.current = popup;
            });
            
            popup.on('close', () => {
                // Si este popup se cierra, limpiar la referencia
                if (openPopupRef.current === popup) {
                    openPopupRef.current = null;
                }
            });

            markersRef.current[punto.id] = marker;
        });
    };

    // Funciones globales para los popups
    useEffect(() => {
        window.editarPunto = (id) => {
            const punto = puntos.find(p => p.id === id);
            if (punto) {
                // Cerrar popup si está abierto
                if (openPopupRef.current) {
                    openPopupRef.current.remove();
                    openPopupRef.current = null;
                }
                
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
                
                // Ocultar el marcador original mientras se edita
                if (markersRef.current[id]) {
                    markersRef.current[id].getElement().style.display = 'none';
                }
                
                // Crear marcador temporal para el punto que se está editando
                setTimeout(() => {
                    if (maplibregl && map.current) {
                        if (tempMarkerRef.current) {
                            tempMarkerRef.current.remove();
                        }
                        
                        const el = document.createElement('div');
                        el.style.width = '50px';
                        el.style.height = '50px';
                        el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRFQjlGQSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyQzguMTMgMiA1IDUuMTMgNSA5YzAgNS4yNSA3IDEzIDcgMTNzNy03Ljc1IDctMTNjMC0zLjg3LTMuMTMtNy03LTd6bTAgOS41Yy0xLjM4IDAtMi41LTEuMTItMi41LTIuNXMxLjEyLTIuNSAyLjUtMi41IDIuNSAxLjEyIDIuNSAyLjUtMS4xMiAyLjUtMi41IDIuNXoiLz48L3N2Zz4=)';
                        el.style.backgroundSize = 'contain';
                        el.style.backgroundRepeat = 'no-repeat';
                        el.style.backgroundPosition = 'center';
                        el.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))';
                        el.style.cursor = 'grab';
                        el.style.zIndex = '1000';
                        el.title = 'Arrastra para mover el punto';
                        
                        // Crear marcador arrastrable cuando se está editando
                        tempMarkerRef.current = new maplibregl.Marker({
                            element: el,
                            draggable: true
                        })
                            .setLngLat([punto.coordenadas.lng, punto.coordenadas.lat])
                            .addTo(map.current);
                        
                        // Cambiar cursor cuando se arrastra
                        tempMarkerRef.current.on('dragstart', () => {
                            el.style.cursor = 'grabbing';
                        });
                        
                        tempMarkerRef.current.on('dragend', () => {
                            el.style.cursor = 'grab';
                            const lngLat = tempMarkerRef.current.getLngLat();
                            setFormData(prev => ({
                                ...prev,
                                lat: lngLat.lat,
                                lng: lngLat.lng
                            }));
                            toast.success(`Ubicación actualizada: ${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`, {
                                duration: 2000,
                                icon: '📍'
                            });
                        });
                            
                        // Centrar mapa en el punto
                        map.current.flyTo({
                            center: [punto.coordenadas.lng, punto.coordenadas.lat],
                            zoom: 15
                        });
                    }
                }, 100);
            }
        };

        window.eliminarPunto = async (id) => {
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

        window.editarJurisdiccion = (id) => {
            const jurisdiccion = jurisdicciones.find(j => j.id === id);
            if (jurisdiccion) {
                // Cerrar popup si está abierto
                if (openPopupRef.current) {
                    openPopupRef.current.remove();
                    openPopupRef.current = null;
                }
                
                // Cargar datos de la jurisdicción en el formulario
                setJurisForm({
                    nombre: jurisdiccion.nombre || '',
                    descripcion: jurisdiccion.descripcion || '',
                    color: jurisdiccion.color || '#22c55e'
                });
                
                // Cargar coordenadas de la jurisdicción
                if (jurisdiccion.coordenadas && Array.isArray(jurisdiccion.coordenadas) && jurisdiccion.coordenadas.length > 0) {
                    const coords = jurisdiccion.coordenadas.map(c => [c.lng, c.lat]);
                    setCoordsDibujo(coords);
                }
                
                // Activar modo edición
                setEditingJurisId(id);
                setDibujarJuris(true);
                
                // Centrar mapa en la jurisdicción
                if (map.current && jurisdiccion.coordenadas && jurisdiccion.coordenadas.length > 0) {
                    const firstCoord = jurisdiccion.coordenadas[0];
                    map.current.flyTo({
                        center: [firstCoord.lng, firstCoord.lat],
                        zoom: 13
                    });
                }
            }
        };

        return () => {
            delete window.editarPunto;
            delete window.eliminarPunto;
            delete window.editarJurisdiccion;
        };
    }, [puntos, jurisdicciones]);

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
            // Agregar idCompania del usuario automáticamente
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
            // Restaurar visibilidad de todos los marcadores después de guardar
            Object.values(markersRef.current).forEach(marker => {
                if (marker && marker.getElement()) {
                    marker.getElement().style.display = '';
                }
            });
        }
    };

    const cancelarFormulario = () => {
        // Eliminar marcador temporal si existe
        if (tempMarkerRef.current) {
            tempMarkerRef.current.remove();
            tempMarkerRef.current = null;
        }
        
        // Restaurar visibilidad de todos los marcadores
        Object.values(markersRef.current).forEach(marker => {
            if (marker && marker.getElement()) {
                marker.getElement().style.display = '';
            }
        });
        
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

    if (!maplibregl) {
        return <BomberosLoader fullScreen message="Cargando mapa..." size="lg" />;
    }

    return (
        <>
            {/* Estilos CSS personalizados para el popup */}
            <style>{`
                .custom-popup .maplibregl-popup-close-button {
                    font-size: 20px !important;
                    width: 32px !important;
                    height: 32px !important;
                    background-color: rgba(0, 0, 0, 0.7) !important;
                    color: white !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-weight: bold !important;
                    transition: all 0.2s ease !important;
                    border: 2px solid white !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                }
                
                .custom-popup .maplibregl-popup-close-button:hover {
                    background-color: rgba(0, 0, 0, 0.9) !important;
                    transform: scale(1.1) !important;
                }
                
                .custom-popup .maplibregl-popup-content {
                    border-radius: 12px !important;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
                    border: 1px solid rgba(0, 0, 0, 0.1) !important;
                }
                
                .custom-popup .maplibregl-popup-tip {
                    border-top-color: white !important;
                }
            `}</style>
            
            <div className="flex flex-col h-[calc(100dvh-8rem)] bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <MdLocationOn className="w-8 h-8 text-red-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Puntos de Interés</h1>
                            <p className="text-sm text-gray-600">Gestiona ubicaciones importantes en el mapa</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        {/* Grupo: Dibujar + Nuevo Punto */}
                        <div className="flex gap-2">
                        <button
                                type="button"
                                onClick={() => setDibujarJuris(v => !v)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white disabled:bg-gray-400"
                                title="Dibujar polígono de jurisdicción"
                            >
                                {dibujarJuris ? 'Finalizar Dibujo' : 'Dibujar Jurisdicción'}
                        </button>
                        <button
                            onClick={() => setModoAgregar(!modoAgregar)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white"
                        >
                            {modoAgregar ? <MdClose className="w-5 h-5" /> : <MdAdd className="w-5 h-5" />}
                            {modoAgregar ? 'Cancelar' : 'Nuevo Punto'}
                        </button>
                    </div>
                        {/* Botón de jurisdicciones movido al mapa como icono */}
                        
                        <button
                            onClick={cargarDatos}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Actualizando...' : 'Actualizar'}
                        </button>
                        
                        {ultimaActualizacion && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <span className="text-sm text-green-700 font-medium">
                                    Fecha de última actualización:
                                </span>
                                <span className="text-sm text-green-800 font-semibold">
                                    {formatTiempoTranscurrido(tiempoTranscurrido)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Mapa */}
                <div className="flex-1 relative min-w-0">
                    <div ref={mapContainer} className="w-full h-full" />
                    {/* Toggle jurisdicciones dentro del mapa */}
                    <button
                        type="button"
                        onClick={() => { setMostrarJurisdicciones(v => !v); }}
                        title={mostrarJurisdicciones ? 'Ocultar jurisdicciones' : 'Mostrar jurisdicciones'}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full shadow bg-white border ${mostrarJurisdicciones ? 'text-green-700 border-green-300' : 'text-gray-700 border-gray-300'} hover:bg-gray-50`}
                        aria-label={mostrarJurisdicciones ? 'Ocultar jurisdicciones' : 'Mostrar jurisdicciones'}
                    >
                        {mostrarJurisdicciones ? <MdVisibility className="w-6 h-6" /> : <MdVisibilityOff className="w-6 h-6" />}
                    </button>
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

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Instrucciones:</p>
                                    <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                                        <li>Clic en el mapa para agregar vértices</li>
                                        <li>Necesitas al menos 3 puntos para crear el polígono</li>
                                        <li>Usa los botones para deshacer o limpiar</li>
                                    </ul>
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
                                                const coordenadas = coordsDibujo.map(([lng,lat])=>({ lat, lng }));
                                                const first = coordenadas[0];
                                                const last = coordenadas[coordenadas.length-1];
                                                if (first.lat !== last.lat || first.lng !== last.lng) coordenadas.push({ ...first });
                                                
                                                if (editingJurisId) {
                                                    // Actualizar jurisdicción existente
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
                                                    // Crear nueva jurisdicción
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
                    {/* Leyenda: oculta mientras se dibuja o edita para no interferir */}
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

                    {/* Panel lateral - Formulario como overlay para evitar relayout del mapa */}
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
                                {/* Mostrar icono del tipo seleccionado */}
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

                            {/* Información de compañía (asignación automática) */}
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

            {/* Modal Nueva Jurisdicción eliminado: se usa solo el modo de dibujo */}

        </div>
        </>
    );
};

export default PuntosInteres;

