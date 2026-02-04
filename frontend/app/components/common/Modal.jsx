export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      data-testid="modal-overlay"
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-content"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-aa-dark-blue">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            data-testid="modal-close-btn"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
