import React from 'react';

export default function FieldError({ id, children }) {
  if (!children) return null;

  return (
    <p id={id} aria-live="polite" className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
      {children}
    </p>
  );
}
