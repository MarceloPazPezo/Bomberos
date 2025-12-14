import { useMemo } from "react";
import PropTypes from "prop-types";
import { Calendar } from "primereact/calendar";
import { addLocale, locale as setLocale } from "primereact/api";

const PRIME_LOCALE_KEY = "es";

addLocale(PRIME_LOCALE_KEY, {
  firstDayOfWeek: 1,
  dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
  monthNames: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  monthNamesShort: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
  today: "Hoy",
  clear: "Limpiar",
  am: "AM",
  pm: "PM",
  hourText: "Hora",
  minuteText: "Minuto",
});

setLocale(PRIME_LOCALE_KEY);

const toDate = (value) => {
  if (!value) return null;
  const match = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!match) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const toString = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PrimeDatePicker = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Seleccionar fecha",
  className = "",
  inputClassName = "",
  error = false,
  showIcon = true,
  showButtonBar = true,
  disabled = false,
  minDate,
  maxDate,
}) => {
  const parsedValue = useMemo(() => toDate(value), [value]);
  const parsedMinDate = useMemo(() => toDate(minDate), [minDate]);
  const parsedMaxDate = useMemo(() => toDate(maxDate), [maxDate]);

  const handleChange = (event) => {
    if (!onChange) return;
    const next = event?.value instanceof Date ? toString(event.value) : "";
    onChange(next, event);
  };

  return (
    <Calendar
      id={id}
      value={parsedValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
      showIcon={showIcon}
      showButtonBar={showButtonBar}
      locale={PRIME_LOCALE_KEY}
      dateFormat="dd/mm/yy"
      disabled={disabled}
      minDate={parsedMinDate}
      maxDate={parsedMaxDate}
      className={`w-full ${error ? "p-invalid" : ""} ${className}`}
      inputClassName={`w-full text-sm ${inputClassName}`}
    />
  );
};

PrimeDatePicker.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  error: PropTypes.bool,
  showIcon: PropTypes.bool,
  showButtonBar: PropTypes.bool,
  disabled: PropTypes.bool,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
};

export default PrimeDatePicker;
