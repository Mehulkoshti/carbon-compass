export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-brand-700">
        <span
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"
        />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  );
}
