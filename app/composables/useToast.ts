export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

const toasts = ref<ToastMessage[]>([]);

export const useToast = () => {
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    toasts.value.push(newToast);

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
  };

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const success = (message: string, title?: string, duration?: number) => addToast({ type: 'success', message, title, duration });
  const error = (message: string, title?: string, duration?: number) => addToast({ type: 'error', message, title, duration });
  const info = (message: string, title?: string, duration?: number) => addToast({ type: 'info', message, title, duration });
  const warning = (message: string, title?: string, duration?: number) => addToast({ type: 'warning', message, title, duration });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
};
