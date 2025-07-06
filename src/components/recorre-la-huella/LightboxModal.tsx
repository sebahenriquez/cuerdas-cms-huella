
import React from 'react';

interface LightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const LightboxModal: React.FC<LightboxModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-auto"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt="Imagen ampliada"
          className="max-w-full max-h-full object-contain"
          style={{
            maxWidth: '95vw',
            maxHeight: '95vh',
          }}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LightboxModal;
