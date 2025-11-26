import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ModalOverlay = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      // Add blur to sidebar and main content
      const sidebar = document.getElementById('app-sidebar');
      const mainContent = document.getElementById('main-content');
      
      if (sidebar) {
        sidebar.classList.add('blur-sm', 'pointer-events-none');
      }
      if (mainContent) {
        mainContent.classList.add('blur-sm', 'pointer-events-none');
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Remove blur when modal closes
        if (sidebar) {
          sidebar.classList.remove('blur-sm', 'pointer-events-none');
        }
        if (mainContent) {
          mainContent.classList.remove('blur-sm', 'pointer-events-none');
        }
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      {children}
    </div>,
    document.body
  );
};

export default ModalOverlay;
