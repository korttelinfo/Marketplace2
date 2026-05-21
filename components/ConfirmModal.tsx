'use client';

import React from 'react';

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = 'Vahvista poisto',
  children,
  confirmLabel = 'Poista',
  cancelLabel = 'Peruuta',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative mx-4 w-full max-w-md transform rounded-2xl bg-white p-6 shadow-lg transition-all duration-200 ease-out sm:mx-0">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm text-slate-600">{children}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            {loading ? 'Poistetaan...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
