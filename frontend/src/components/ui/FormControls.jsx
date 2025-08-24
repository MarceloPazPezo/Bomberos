// src/components/ui/FormControls.jsx
import React from "react";

export const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm mb-1 text-gray-700">{label}</span>
    {children}
  </label>
);

export const Input = React.forwardRef(({ label, className = "", error, ...props }, ref) => (
  <label className="block">
    <span className="block text-sm mb-1 text-gray-700">{label}</span>
    <input
      ref={ref}
      {...props}
      className={`w-full border ${error ? "border-red-400" : "border-gray-300"} rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${error ? "focus:ring-red-200 focus:border-red-400" : "focus:ring-gray-300 focus:border-gray-400"} ${className}`}
    />
    {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
  </label>
));

export const Textarea = React.forwardRef(({ label, className = "", rows = 3, error, ...props }, ref) => (
  <label className="block">
    <span className="block text-sm mb-1 text-gray-700">{label}</span>
    <textarea
      ref={ref}
      rows={rows}
      {...props}
      className={`w-full border ${error ? "border-red-400" : "border-gray-300"} rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${error ? "focus:ring-red-200 focus:border-red-400" : "focus:ring-gray-300 focus:border-gray-400"} ${className}`}
    />
    {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
  </label>
));

export function Label({ children }) {
  return <div className="text-sm font-medium text-gray-700 mb-2">{children}</div>;
}
