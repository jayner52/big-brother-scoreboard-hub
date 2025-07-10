import { useState, useCallback } from 'react';

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({
    title: '',
    description: ''
  });
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  const confirm = useCallback((
    options: ConfirmDialogOptions,
    callback: () => void
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options);
      setOnConfirm(() => () => {
        callback();
        setIsOpen(false);
        resolve(true);
      });
      setIsOpen(true);
    });
  }, []);

  const cancel = useCallback(() => {
    setIsOpen(false);
    setOnConfirm(null);
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  return {
    isOpen,
    options,
    confirm,
    cancel,
    handleConfirm
  };
};