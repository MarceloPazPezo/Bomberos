import { useMemo } from "react";
import PropTypes from "prop-types";
import { Calendar } from "primereact/calendar";
import { locale as setLocale } from "primereact/api";

const PRIME_LOCALE_KEY = "es";

const toDate = (value, hourFormat) => {
  if (!value || typeof value !== "string") return null;
  let hours;
  let minutes;
  if (/^\d{2}:\d{2}$/.test(value)) {
    [hours, minutes] = value.split(":").map(Number);
  } else {
    const ampmMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!ampmMatch) return null;
    hours = Number(ampmMatch[1]);
    minutes = Number(ampmMatch[2]);
    if (ampmMatch[3].toUpperCase() === "PM" && hours < 12) hours += 12;
    if (ampmMatch[3].toUpperCase() === "AM" && hours === 12) hours = 0;
  }
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hourFormat === "12") {
    if (hours > 23) return null;
  }
  return new Date(1970, 0, 1, hours, minutes, 0, 0);
};

const toString = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "";
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const parseManualInput = (value, hourFormat) => {
  if (!value || typeof value !== "string") return null;
  if (hourFormat === "12") {
    const match = value
      .trim()
      .toUpperCase()
      .match(/^(\d{1,2})(?::?(\d{0,2}))?\s*(AM|PM)?$/);
    if (!match) return null;
    const rawHour = Number(match[1]);
    const rawMinutes = match[2] ? Number(match[2]) : 0;
    if (!Number.isInteger(rawHour) || !Number.isInteger(rawMinutes)) return null;
    if (rawHour < 1 || rawHour > 12 || rawMinutes < 0 || rawMinutes > 59) return null;
    const period = match[3] || (rawHour >= 12 ? "PM" : "AM");
    let hours = rawHour % 12;
    if (period === "PM") hours += 12;
    return new Date(1970, 0, 1, hours, rawMinutes, 0, 0);
  }
  const normalized = value.replace(/[^0-9:]/g, "").slice(0, 5);
  const match = normalized.match(/^(\d{1,2}):?(\d{0,2})$/);
  if (!match) return null;
  const hours = match[1].padStart(2, "0");
  const minutes = (match[2] || "").padEnd(2, "0");
  const hh = Number(hours);
  const mm = Number(minutes);
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null;
  if (hh > 23 || mm > 59) return null;
  return new Date(1970, 0, 1, hh, mm, 0, 0);
};

const PrimeTimePicker = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Seleccionar hora",
  className = "",
  inputClassName = "",
  error = false,
  showIcon = true,
  showButtonBar = true,
  disabled = false,
  stepMinute = 1,
  mask,
  allowManualInput = true,
  hourFormat = "24",
  autoSelectNowOnFocus = true,
}) => {
  const resolvedMask = useMemo(() => {
    if (!allowManualInput) return undefined;
    if (mask) return mask;
    return hourFormat === "12" ? "99:99 aa" : "99:99";
  }, [allowManualInput, mask, hourFormat]);

  const parsedValue = useMemo(() => toDate(value, hourFormat), [value, hourFormat]);

  const getNowTime = () => {
    const now = new Date();
    return new Date(1970, 0, 1, now.getHours(), now.getMinutes(), 0, 0);
  };

  const handleChange = (event) => {
    if (!onChange) return;
    const rawValue = event?.value;
    let next = "";
    if (rawValue instanceof Date) {
      next = toString(rawValue);
    } else if (typeof rawValue === "string") {
      const parsed = parseManualInput(rawValue, hourFormat);
      next = parsed ? toString(parsed) : "";
    }
    onChange(next, event);
  };

  const handleTodayClick = () => {
    const nowDate = getNowTime();
    const next = toString(nowDate);
    onChange?.(next, { value: nowDate, type: "today" });
  };

  const handleFocus = () => {
    if (!autoSelectNowOnFocus || value) return;
    const nowDate = getNowTime();
    const next = toString(nowDate);
    onChange?.(next, { value: nowDate, type: "focus-auto" });
  };

  return (
    <Calendar
      id={id}
      value={parsedValue}
      onChange={handleChange}
      onBlur={onBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      showIcon={showIcon}
      showButtonBar={showButtonBar}
      onTodayButtonClick={handleTodayClick}
      locale={PRIME_LOCALE_KEY}
      timeOnly
      hourFormat={hourFormat}
      stepMinute={stepMinute}
      mask={resolvedMask}
      inputMode={hourFormat === "12" ? "text" : "numeric"}
      className={`w-full ${error ? "p-invalid" : ""} ${className}`}
      inputClassName={`w-full text-sm ${inputClassName}`}
      disabled={disabled}
    />
  );
};

PrimeTimePicker.propTypes = {
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
  stepMinute: PropTypes.number,
  mask: PropTypes.string,
  allowManualInput: PropTypes.bool,
  hourFormat: PropTypes.oneOf(["12", "24"]),
  autoSelectNowOnFocus: PropTypes.bool,
};

export default function PrimeTimePickerWithLocale(props) {
  setLocale(PRIME_LOCALE_KEY);
  return <PrimeTimePicker {...props} />;
}
