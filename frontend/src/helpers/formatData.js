function capitalizeSpanish(str) {
    if (!str) return str;
    return str.split(' ').map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}

function startCase(str) {
    if (!str) return str;
    return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

function formatRut(run) {
    if (!run) return run;
    const cleanRut = run.toString().replace(/[.-]/g, '');
    if (cleanRut.length >= 8) {
        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1);
        return body.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + dv;
    }
    return run;
}

function normalizeRutForBackend(run) {
    if (!run) return run;
    // Quitar puntos pero mantener el guión
    return run.toString().replace(/\./g, '');
}

function formatTempo(date, format) {
    if (!date) return date;
    const d = new Date(date);
    
    // Verificar si la fecha es válida
    if (isNaN(d.getTime())) {
        console.warn('Fecha inválida recibida:', date);
        return 'Fecha inválida';
    }
    
    if (format === "DD-MM-YYYY") {
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }
    return date;
}

function formatTelefono(telefono) {
    if (!telefono) return telefono;
    
    // Limpiar el número de cualquier carácter no numérico
    const cleanPhone = telefono.toString().replace(/\D/g, '');
    
    // Formatear según el tipo de número chileno
    if (cleanPhone.length === 9) {
        // Celular: +56 9 XXXX XXXX
        if (cleanPhone.startsWith('9')) {
            return `+56 9 ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
        }
        // Fijo: +56 X XXXX XXXX (donde X es el código de área)
        return `+56 ${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
    } else if (cleanPhone.length === 8) {
        // Número fijo sin código de área: XXXX XXXX
        return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4)}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('56')) {
        // Número con código de país: 56XXXXXXXXX
        const localNumber = cleanPhone.slice(2);
        if (localNumber.startsWith('9')) {
            return `+56 9 ${localNumber.slice(1, 5)} ${localNumber.slice(5)}`;
        }
        return `+56 ${localNumber.slice(0, 1)} ${localNumber.slice(1, 5)} ${localNumber.slice(5)}`;
    }
    
    // Si no coincide con ningún formato conocido, devolver el original
    return telefono;
}

export function formatUserData(user) {
    return {
        ...user,
        nombres: Array.isArray(user.nombres) ? user.nombres.map(nombre => startCase(nombre)) : startCase(user.nombres),
        apellidos: Array.isArray(user.apellidos) ? user.apellidos.map(apellido => startCase(apellido)) : startCase(user.apellidos),
        run: formatRut(user.run),
        telefono: formatTelefono(user.telefono),
        fechaNacimiento: user.fechaNacimiento ? formatTempo(user.fechaNacimiento, "DD-MM-YYYY") : null,
        fechaIngreso: user.fechaIngreso ? formatTempo(user.fechaIngreso, "DD-MM-YYYY") : null,
        direccion: user.direccion || null,
        tipoSangre: user.tipoSangre || null,
        alergias: user.alergias || null,
        medicamentos: user.medicamentos || null,
        condiciones: user.condiciones || null,
        activo: user.activo,
        roles: Array.isArray(user.roles) ? user.roles.map(role => startCase(role)) : [],
        // Mantener las fechas originales sin formatear para conservar la información completa
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        createdBy: user.createdBy,
        updatedBy: user.updatedBy
    };
}

export function convertirMinusculas(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].toLowerCase();
        }
    }
    return obj;
}

export function formatPostUpdate(user) {
    return {
        nombres: Array.isArray(user.nombres) ? user.nombres.map(nombre => startCase(nombre)) : startCase(user.nombres),
        apellidos: Array.isArray(user.apellidos) ? user.apellidos.map(apellido => startCase(apellido)) : startCase(user.apellidos),
        run: formatRut(user.run),
        email: user.email,
        telefono: formatTelefono(user.telefono),
        fechaNacimiento: user.fechaNacimiento ? formatTempo(user.fechaNacimiento, "DD-MM-YYYY") : null,
        fechaIngreso: user.fechaIngreso ? formatTempo(user.fechaIngreso, "DD-MM-YYYY") : null,
        direccion: user.direccion || null,
        tipoSangre: user.tipoSangre || null,
        alergias: user.alergias || null,
        medicamentos: user.medicamentos || null,
        condiciones: user.condiciones || null,
        activo: user.activo,
        roles: Array.isArray(user.roles) ? user.roles.map(role => startCase(role)) : [],
        createdAt: formatTempo(user.createdAt, "DD-MM-YYYY"),
        updatedAt: formatTempo(user.updatedAt, "DD-MM-YYYY"),
        createdBy: user.createdBy,
        updatedBy: user.updatedBy
    };
}

export { normalizeRutForBackend, formatRut, formatTelefono };