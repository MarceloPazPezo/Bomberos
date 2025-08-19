import React from 'react';
import DocCategoryGeneratedIndexPage from '@theme-original/DocCategoryGeneratedIndexPage';
import { 
  FaUsers, 
  FaLock, 
  FaCog, 
  FaCode, 
  FaUserTag, 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaUser, 
  FaHeartbeat, 
  FaClock, 
  FaRocket 
} from 'react-icons/fa';

// Mapeo de nombres de iconos a componentes
const iconMap = {
  FaUsers,
  FaLock,
  FaCog,
  FaCode,
  FaUserTag,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaUser,
  FaHeartbeat,
  FaClock,
  FaRocket
};

export default function DocCategoryGeneratedIndexPageWrapper(props) {
  const { categoryGeneratedIndex } = props;
  
  // Obtener el icono de customProps si existe
  const iconName = categoryGeneratedIndex?.customProps?.icon;
  const IconComponent = iconName ? iconMap[iconName] : null;
  
  return (
    <div>
      {IconComponent && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1rem',
          fontSize: '1.5rem'
        }}>
          <IconComponent 
            style={{ 
              marginRight: '0.5rem', 
              color: 'var(--ifm-color-primary)',
              fontSize: '2rem'
            }} 
          />
          <h1 style={{ margin: 0 }}>{categoryGeneratedIndex.title}</h1>
        </div>
      )}
      <DocCategoryGeneratedIndexPage {...props} />
    </div>
  );
}