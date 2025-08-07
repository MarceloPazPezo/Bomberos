import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const Tooltip = ({ 
  id, 
  content, 
  place = 'top', 
  variant = 'dark',
  delay = 300,
  className = '',
  children,
  ...props 
}) => {
  return (
    <>
      <div data-tooltip-id={id} className={className}>
        {children}
      </div>
      <ReactTooltip
        id={id}
        place={place}
        variant={variant}
        content={content}
        delayShow={delay}
        style={{
          backgroundColor: variant === 'dark' ? '#1f2937' : '#ffffff',
          color: variant === 'dark' ? '#ffffff' : '#1f2937',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: variant === 'light' ? '1px solid #e5e7eb' : 'none',
          zIndex: 9999
        }}
        {...props}
      />
    </>
  );
};

export default Tooltip;