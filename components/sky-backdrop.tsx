"use client"

export function SkyBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.72),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(255,214,170,0.45),transparent_36%),linear-gradient(180deg,#9fd4ff_0%,#c9e7ff_38%,#e7f4ff_72%,#f7fbff_100%)]" />
      <div className="sun-glow absolute top-[7%] right-[12%] size-36 rounded-full bg-[radial-gradient(circle,rgba(255,236,170,0.95)_0%,rgba(255,210,120,0.35)_42%,transparent_70%)]" />
      <Cloud className="cloud-drift-slow left-[-18%] top-[12%] w-[42%]" />
      <Cloud className="cloud-drift left-[-8%] top-[28%] w-[28%] opacity-80" />
      <Cloud className="cloud-drift-fast left-[-22%] top-[58%] w-[36%] opacity-70" />
      <Cloud className="cloud-drift-slow left-[-30%] top-[74%] w-[48%] opacity-55" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-sky-100/80 to-transparent" />
    </div>
  )
}

function Cloud({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 140"
      fill="none"
      aria-hidden="true"
    >
      <g fill="white" fillOpacity="0.78">
        <ellipse cx="110" cy="86" rx="78" ry="38" />
        <ellipse cx="176" cy="70" rx="90" ry="46" />
        <ellipse cx="250" cy="86" rx="72" ry="34" />
        <ellipse cx="86" cy="70" rx="42" ry="28" />
      </g>
    </svg>
  )
}
