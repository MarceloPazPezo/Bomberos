import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import { FaUsers, FaChartBar, FaTruck } from 'react-icons/fa';

const FeatureList = [
  {
    title: 'Gestión de Personal',
    icon: FaUsers,
    description: (
      <>
        Administración completa de bomberos, voluntarios, turnos y disponibilidad.
        Control de roles, permisos y estado operativo del personal.
      </>
    ),
  },
  {
    title: 'Reportes y Estadísticas',
    icon: FaChartBar,
    description: (
      <>
        Generación de informes operativos, estadísticas de rendimiento
        y análisis de datos para la toma de decisiones.
      </>
    ),
  },
  {
    title: 'Gestión de Recursos',
    icon: FaTruck,
    description: (
      <>
        Inventario de equipos, vehículos y materiales.
        Control de mantenimiento y disponibilidad de recursos.
      </>
    ),
  },
];

function Feature({icon: Icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon}>
          <Icon />
        </div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
