import React, { useEffect } from 'react';
import { useRoles } from '@hooks/roles/useRoles';

const TestRoles = () => {
  const { roles, loading, error, fetchRoles } = useRoles();

  const handleFetchRoles = () => {
    fetchRoles(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test de Roles</h1>
      
      <div className="mb-4">
        <button 
          onClick={handleFetchRoles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Cargar Roles'}
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Estado:</h2>
        <p>Loading: {loading ? 'Sí' : 'No'}</p>
        <p>Error: {error || 'Ninguno'}</p>
        <p>Cantidad de roles: {roles.length}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Roles:</h2>
        {roles.length > 0 ? (
          <ul className="list-disc pl-5">
            {roles.map((role, index) => (
              <li key={index} className="mb-1">
                <strong>{role.nombre}</strong> - {role.descripcion}
                {role.permisos && (
                  <ul className="list-disc pl-5 mt-1">
                    {role.permisos.map((permiso, pIndex) => (
                      <li key={pIndex} className="text-sm text-gray-600">
                        {permiso.nombre || permiso}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay roles disponibles</p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Datos Raw:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify({ roles, loading, error }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestRoles;