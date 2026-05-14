import type { BeltColor } from '../types/student'
import { getBelt } from '../data/belts'

interface Props {
  belt: BeltColor
  degree: number
  size?: 'sm' | 'md' | 'lg'
}

const DEGREE_COLORS = ['#FFDF00', '#FFDF00', '#FFDF00', '#FFDF00']

export default function BeltBadge({ belt, degree, size = 'md' }: Props) {
  const beltData = getBelt(belt)
  if (!beltData) return null

  const isGradient = beltData.hexColor.startsWith('linear-gradient')
  const isCoral = belt === 'Coral'

  const sizeClasses = {
    sm: 'h-5 w-24 rounded',
    md: 'h-7 w-36 rounded-md',
    lg: 'h-9 w-44 rounded-md',
  }

  const dotSize = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  const degrees = beltData.maxDegrees > 0 ? degree : 0

  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className={`relative flex items-center justify-center ${sizeClasses[size]} border border-black/20 shadow-sm overflow-hidden`}
        style={
          isGradient
            ? { background: 'linear-gradient(90deg, #dc2626 50%, #111111 50%)' }
            : { backgroundColor: beltData.hexColor }
        }
      >
        {/* Belt tip markers */}
        {degrees > 0 && (
          <div className="absolute right-1 flex items-center gap-0.5">
            {Array.from({ length: degrees }).map((_, i) => (
              <div
                key={i}
                className={`${dotSize[size]} rounded-full border border-black/30`}
                style={{ backgroundColor: DEGREE_COLORS[i] }}
              />
            ))}
          </div>
        )}
        {isCoral && (
          <span className="text-xs font-bold text-white/90 tracking-widest">MESTRE</span>
        )}
      </div>
      <span className="text-xs text-gray-500 font-medium">
        {beltData.label}
        {degrees > 0 && ` — ${degrees}° grau`}
      </span>
    </div>
  )
}
