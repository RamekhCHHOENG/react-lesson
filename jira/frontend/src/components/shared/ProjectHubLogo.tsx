import { cn } from "@/lib/utils"

export function ProjectHubLogo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="ph-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#ph-bg)" />
      {/* Column 1 */}
      <rect x="80" y="120" width="100" height="280" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="92" y="140" width="76" height="36" rx="6" fill="rgba(255,255,255,0.9)" />
      <rect x="92" y="186" width="76" height="28" rx="6" fill="rgba(255,255,255,0.5)" />
      <rect x="92" y="224" width="76" height="28" rx="6" fill="rgba(255,255,255,0.5)" />
      {/* Column 2 */}
      <rect x="200" y="120" width="100" height="280" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="212" y="140" width="76" height="36" rx="6" fill="rgba(255,255,255,0.9)" />
      <rect x="212" y="186" width="76" height="28" rx="6" fill="rgba(255,255,255,0.5)" />
      {/* Column 3 - P letter */}
      <rect x="320" y="120" width="112" height="280" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="332" y="140" width="28" height="240" rx="6" fill="white" />
      <rect x="332" y="140" width="86" height="28" rx="6" fill="white" />
      <rect x="390" y="140" width="28" height="108" rx="6" fill="white" />
      <rect x="332" y="220" width="86" height="28" rx="6" fill="white" />
    </svg>
  )
}
