export default function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required = false,
  className = '',
  error,
  ...props 
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-aa-text-dark mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-aa-orange ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
        data-testid="input-field"
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
