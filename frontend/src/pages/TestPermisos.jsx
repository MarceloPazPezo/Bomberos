import React from 'react';
import { useAuth } from '@hooks/auth/useAuth';

const TestPermisos = () => {
  const { bombero, hasPermiso, bomberoPermisos } = useAuth();

  const permisosToTest = [
    'disponibilidad:obtener',
    'disponibilidad:crear', 
    'disponibilidad:actualizar',
    'disponibilidad:admin',
    'bombero:obtener',
    'bombero:obtener_perfil',
    'bombero:admin'
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test de Permisos</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Información del Usuario:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Nombre:</strong> {bombero?.nombres} {bombero?.apellidos}</p>
          <p><strong>Email:</strong> {bombero?.email}</p>
          <p><strong>Roles:</strong> {bombero?.roles?.map(r => r.nombre || r.name || r).join(', ') || 'Sin roles'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Permisos del Usuario:</h2>
        <div className="bg-gray-100 p-4 rounded">
          {bomberoPermisos && bomberoPermisos.length > 0 ? (
            <ul className="list-disc pl-5">
              {bomberoPermisos.map((permiso, index) => (
                <li key={index} className="text-sm">
                  {typeof permiso === 'string' ? permiso : permiso.nombre || JSON.stringify(permiso)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500">No se encontraron permisos</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Test de Permisos Específicos:</h2>
        <div className="grid grid-cols-1 gap-2">
          {permisosToTest.map(permiso => (
            <div key={permiso} className={`p-3 rounded ${hasPermiso(permiso) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <span className="font-mono text-sm">{permiso}</span>
              <span className="ml-2">
                {hasPermiso(permiso) ? '✅ TIENE' : '❌ NO TIENE'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Datos Raw:</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify({ 
            bombero: bombero, 
            bomberoPermisos: bomberoPermisos,
            rolesExtracted: bombero?.roles?.map(role => ({
              nombre: role.nombre || role.name,
              permisos: role.permisos
            }))
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestPermisos;