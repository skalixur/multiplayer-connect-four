export default function Circle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100">
      <defs>
        <radialGradient id="invertedShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0.5)" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="45" className={className} />

      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#invertedShadow)"
        opacity="0.5"
      />
    </svg>
  )
}
