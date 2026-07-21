export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--brand-background, #0B0F17)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">...</p>
      </div>
    </div>
  );
}
