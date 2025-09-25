function Switch({ checked, onChange, label, id }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`h-6 w-11 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''
            }`}
        />
      </div>
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}
export default Switch;