import React from 'react';
import DocSidebarItemCategory from '@theme-original/DocSidebarItem/Category';
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

export default function DocSidebarItemCategoryWrapper(props) {
  return <DocSidebarItemCategory {...props} />;
}