// 暗色加载态（SPEC-U-09）：金色旋转星点
export default function Loading({ label = '载入中…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div
        className="h-8 w-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin-slow"
        role="status"
        aria-label={label}
      />
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  )
}
