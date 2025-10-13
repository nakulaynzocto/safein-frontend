import { toast } from 'sonner';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 3000,
  });
};

export const showInfoToast = (message: string) => {
  toast.info(message, {
    duration: 3000,
  });
};

export const showWarningToast = (message: string) => {
  toast.warning(message, {
    duration: 3000,
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};



