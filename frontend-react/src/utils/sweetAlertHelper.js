import Swal from 'sweetalert2';

// Success Toast
export const showSuccessToast = (title, text = '') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: 'success',
    title: title,
    text: text
  });
};

// Error Toast
export const showErrorToast = (title, text = '') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: 'error',
    title: title,
    text: text
  });
};

// Info Toast
export const showInfoToast = (title, text = '') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });

  Toast.fire({
    icon: 'info',
    title: title,
    text: text
  });
};

// Delete Confirmation
export const showDeleteConfirm = (title = 'Are you sure?', text = 'This action cannot be undone!') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });
};

// General Confirmation
export const showConfirm = (title, text, confirmText = 'Yes', cancelText = 'Cancel') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#6c757d',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  });
};

// Input Dialog (for text input like void reason)
export const showInputDialog = async ({
  title = 'Enter Information',
  text = '',
  inputPlaceholder = 'Enter text...',
  inputType = 'text',
  confirmButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  inputValidator = null
}) => {
  return Swal.fire({
    title: title,
    text: text,
    input: inputType,
    inputPlaceholder: inputPlaceholder,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#6c757d',
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    inputValidator: inputValidator
  });
};

// Success Alert
export const showSuccess = (title, text = '', timer = 2000) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    timer: timer,
    showConfirmButton: timer ? false : true
  });
};

// Error Alert
export const showError = (title, text = '') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'error'
  });
};

// Info Alert
export const showInfo = (title, text = '') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'info'
  });
};

// Loading
export const showLoading = (title = 'Processing...', text = 'Please wait') => {
  Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};
