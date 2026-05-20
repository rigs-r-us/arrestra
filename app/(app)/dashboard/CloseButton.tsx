'use client';

export function CloseButton() {
  return (
    <button
      onClick={(e) => {
        const details = (e.target as HTMLElement).closest('details');
        if (details) (details as HTMLDetailsElement).open = false;
      }}
      style={{
        background: 'transparent',
        border: 'none',
        color: '#9CA3AF',
        fontSize: 20,
        fontWeight: 700,
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}
    >
      ✕
    </button>
  );
}
