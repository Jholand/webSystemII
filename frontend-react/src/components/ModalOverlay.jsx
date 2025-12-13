import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ModalOverlay = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      // Add blur and reduce opacity to sidebar, header, and main content
      const sidebar = document.getElementById('app-sidebar') || document.querySelector('aside');
      const mainContent = document.getElementById('main-content');
      const header = document.querySelector('header') || document.querySelector('[class*="header"]');
      
      const applyModalStyles = (element) => {
        if (element) {
          element.style.filter = 'blur(4px)';
          element.style.opacity = '0.6';
          element.style.transition = 'filter 0.2s ease-in-out, opacity 0.2s ease-in-out';
          element.style.pointerEvents = 'none';
          element.style.userSelect = 'none';
        }
      };
      
      const removeModalStyles = (element) => {
        if (element) {
          element.style.filter = 'none';
          element.style.opacity = '1';
          element.style.pointerEvents = 'auto';
          element.style.userSelect = 'auto';
        }
      };
      
      applyModalStyles(sidebar);
      applyModalStyles(mainContent);
      applyModalStyles(header);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Remove blur when modal closes
        removeModalStyles(sidebar);
        removeModalStyles(mainContent);
        removeModalStyles(header);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default ModalOverlay;
