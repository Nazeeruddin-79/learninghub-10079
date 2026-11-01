export default function ProgressBar({ value = 0, color = 'purple' }) {
  const numericValue = Number(value)

  const safeValue = Number.isFinite(numericValue)
    ? Math.min(100, Math.max(0, numericValue))
    : 0

  return (
    <div
      className={`progress-track ${color}`}
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Course completion"
    >
      <span style={{ width: `${safeValue}%` }} />
    </div>
  )
}