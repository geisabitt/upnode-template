// src/components/WhatsAppButton.tsx
'use client';

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5521986369426"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 bg-[var(--color-success)] text-[var(--color-text-primary)] p-3 rounded-full shadow-lg hover:opacity-90 transition-colors z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30" height="30" fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20.52 3.48A11.92 11.92 0 0 0 12 0a11.94 11.94 0 0 0-10.4 17.6L0 24l6.64-1.74A11.93 11.93 0 0 0 12 24a11.92 11.92 0 0 0 8.48-20.52Zm-8.51 17.37a9.87 9.87 0 0 1-5.05-1.38l-.36-.21-3.94 1.04 1.05-3.84-.23-.4a9.86 9.86 0 0 1 15.31-12 9.89 9.89 0 0 1-6.78 16.79Zm5.44-7.4c-.3-.15-1.75-.86-2.02-.96s-.47-.15-.66.15-.76.96-.93 1.15-.34.22-.63.07a8 8 0 0 1-2.36-1.46 8.78 8.78 0 0 1-1.63-2c-.17-.3 0-.47.13-.62s.3-.34.45-.52a2.1 2.1 0 0 0 .3-.49.54.54 0 0 0 0-.52c-.07-.15-.66-1.6-.9-2.2s-.48-.5-.66-.51H7a1.3 1.3 0 0 0-.94.44 3.94 3.94 0 0 0-1.23 2.93 6.88 6.88 0 0 0 1.44 3.54A15.9 15.9 0 0 0 9.3 17.2a6.7 6.7 0 0 0 3.31.89 3.75 3.75 0 0 0 2.39-.81 3 3 0 0 0 .93-2.09c0-.31-.12-.46-.27-.51Z"/>
      </svg>
    </a>
  );
}