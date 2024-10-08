// components/ui/use-toast.tsx
import { useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState<{ title: string, description: string, variant?: string } | null>(null);

  const toast = (options: { title: string, description: string, variant?: string }) => {
    setMessage(options);
    // You could also add logic to automatically dismiss the toast after a timeout
  };

  const clearToast = () => {
    setMessage(null);
  };

  return { toast, message, clearToast };
}
