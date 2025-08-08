/**
 * EJEMPLOS DE USO DEL HELPER DE FORMATEO DE RUT
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar el helper rutFormatter
 * en diferentes contextos y componentes.
 */

import { useRutFormatter, formatRutForAPI, formatRutForDisplay, isValidRut } from './rutFormatter.js';

// ============================================================================
// EJEMPLO 1: Uso básico en un formulario con react-hook-form
// ============================================================================

const ExampleFormWithRut = () => {
    const formRef = useRef(null);
    
    // Configurar el hook del formatter
    const rutFormatter = useRutFormatter(
        (fieldName, value) => formRef.current?.setValue(fieldName, value),
        'rut'
    );

    const onSubmit = (data) => {
        // Formatear RUT para envío al API
        const apiData = {
            ...data,
            rut: formatRutForAPI(data.rut) // Convierte "12.345.678-9" a "12345678-9"
        };
        
        console.log('Datos para API:', apiData);
        // Enviar apiData al backend...
    };

    return (
        <Form
            ref={formRef}
            fields={[
                {
                    ...rutFormatter.getFieldConfig(), // Configuración completa del campo RUT
                    // Puedes agregar propiedades adicionales si es necesario
                    errorMessageData: errorRut,
                    autoComplete: "off"
                },
                // ... otros campos
            ]}
            onSubmit={onSubmit}
        />
    );
};

// ============================================================================
// EJEMPLO 2: Uso con múltiples campos RUT en el mismo formulario
// ============================================================================

const ExampleMultipleRutForm = () => {
    const formRef = useRef(null);
    
    // Configurar formatters para diferentes campos RUT
    const rutTitularFormatter = useRutFormatter(
        (fieldName, value) => formRef.current?.setValue(fieldName, value),
        'rutTitular'
    );
    
    const rutRepresentanteFormatter = useRutFormatter(
        (fieldName, value) => formRef.current?.setValue(fieldName, value),
        'rutRepresentante'
    );

    const onSubmit = (data) => {
        const apiData = {
            ...data,
            rutTitular: formatRutForAPI(data.rutTitular),
            rutRepresentante: formatRutForAPI(data.rutRepresentante)
        };
        
        console.log('Datos para API:', apiData);
    };

    return (
        <Form
            ref={formRef}
            fields={[
                {
                    ...rutTitularFormatter.getFieldConfig(),
                    label: "RUT Titular",
                    name: "rutTitular"
                },
                {
                    ...rutRepresentanteFormatter.getFieldConfig(),
                    label: "RUT Representante Legal",
                    name: "rutRepresentante"
                },
                // ... otros campos
            ]}
            onSubmit={onSubmit}
        />
    );
};

// ============================================================================
// EJEMPLO 3: Uso manual de las funciones de formateo
// ============================================================================

const ExampleManualFormatting = () => {
    const [rutValue, setRutValue] = useState('');

    const handleRutChange = (e) => {
        const inputValue = e.target.value;
        
        // Formatear para visualización
        const formatted = formatRutForDisplay(inputValue);
        setRutValue(formatted);
    };

    const handleSubmit = () => {
        // Validar RUT antes de enviar
        if (!isValidRut(rutValue)) {
            alert('RUT inválido');
            return;
        }

        // Formatear para API
        const rutForAPI = formatRutForAPI(rutValue);
        
        console.log('RUT para mostrar:', rutValue);        // "12.345.678-9"
        console.log('RUT para API:', rutForAPI);           // "12345678-9"
        
        // Enviar al backend...
    };

    return (
        <div>
            <input
                type="text"
                value={rutValue}
                onChange={handleRutChange}
                placeholder="12.345.678-9"
                maxLength={12}
            />
            <button onClick={handleSubmit}>Enviar</button>
        </div>
    );
};

// ============================================================================
// EJEMPLO 4: Validación y formateo en tiempo real
// ============================================================================

const ExampleRealTimeValidation = () => {
    const [rut, setRut] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    const handleRutChange = (e) => {
        const inputValue = e.target.value;
        
        // Formatear para visualización
        const formatted = formatRutForDisplay(inputValue);
        setRut(formatted);
        
        // Validar en tiempo real
        if (formatted.length >= 11) { // Mínimo formato: 1.234.567-8
            const valid = isValidRut(formatted);
            setIsValid(valid);
            setValidationMessage(valid ? '✓ RUT válido' : '✗ RUT inválido');
        } else {
            setIsValid(false);
            setValidationMessage('');
        }
    };

    return (
        <div>
            <input
                type="text"
                value={rut}
                onChange={handleRutChange}
                placeholder="12.345.678-9"
                className={`border ${isValid ? 'border-green-500' : 'border-gray-300'}`}
            />
            {validationMessage && (
                <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validationMessage}
                </p>
            )}
        </div>
    );
};

// ============================================================================
// EJEMPLO 5: Formateo de datos existentes (ej: desde base de datos)
// ============================================================================

const ExampleFormatExistingData = () => {
    // Datos que vienen del backend (sin puntos)
    const usersFromAPI = [
        { id: 1, name: 'Juan Pérez', rut: '12345678-9' },
        { id: 2, name: 'María González', rut: '18765432-1' },
        { id: 3, name: 'Carlos López', rut: '9876543-2' }
    ];

    return (
        <div>
            <h3>Lista de Usuarios</h3>
            {usersFromAPI.map(user => (
                <div key={user.id}>
                    <span>{user.name}</span>
                    <span>{formatRutForDisplay(user.rut)}</span> {/* Mostrar con puntos */}
                </div>
            ))}
        </div>
    );
};

// ============================================================================
// EJEMPLO 6: Búsqueda por RUT
// ============================================================================

const ExampleRutSearch = () => {
    const [searchRut, setSearchRut] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        if (!isValidRut(searchRut)) {
            alert('Ingrese un RUT válido');
            return;
        }

        // Formatear RUT para búsqueda en API
        const rutForAPI = formatRutForAPI(searchRut);
        
        try {
            // Buscar en el backend
            const response = await fetch(`/api/users/search?rut=${rutForAPI}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error en búsqueda:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={searchRut}
                onChange={(e) => setSearchRut(formatRutForDisplay(e.target.value))}
                placeholder="Buscar por RUT: 12.345.678-9"
            />
            <button onClick={handleSearch}>Buscar</button>
            
            {results.map(user => (
                <div key={user.id}>
                    {user.name} - {formatRutForDisplay(user.rut)}
                </div>
            ))}
        </div>
    );
};

// ============================================================================
// CASOS DE USO COMUNES
// ============================================================================

/*
1. FORMULARIO DE REGISTRO:
   - Usar rutFormatter.getFieldConfig() para el campo RUT
   - Formatear con formatRutForAPI() antes de enviar

2. FORMULARIO DE EDICIÓN:
   - Cargar datos con formatRutForDisplay() para mostrar con puntos
   - Formatear con formatRutForAPI() antes de actualizar

3. LISTADOS Y TABLAS:
   - Usar formatRutForDisplay() para mostrar RUT con formato chileno

4. BÚSQUEDAS:
   - Permitir búsqueda con cualquier formato
   - Usar formatRutForAPI() para consultar el backend

5. VALIDACIONES:
   - Usar isValidRut() para validar matemáticamente
   - Usar isValidRutFormat() para validar solo el formato

6. IMPORTACIÓN DE DATOS:
   - Limpiar datos con cleanRut()
   - Formatear con formatRutForAPI() antes de guardar
*/

export {
    ExampleFormWithRut,
    ExampleMultipleRutForm,
    ExampleManualFormatting,
    ExampleRealTimeValidation,
    ExampleFormatExistingData,
    ExampleRutSearch
};