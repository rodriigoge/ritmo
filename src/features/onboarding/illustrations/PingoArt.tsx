import Svg, { Circle, Path } from 'react-native-svg';
import { useColors } from '../../../design-system/theme/ThemeProvider';
import { Pingo, type PingoPose } from './Pingo';
import { useArtColors } from './useArtColors';


/** Pingo on his own, with a couple of sparkles, sized by height. */
export function PingoArt({
  pose,
  height,
}: {
  pose: PingoPose;
  height: number;
}) {
  const { INK } = useArtColors();
  const colors = useColors();
  const width = 240;
  const viewHeight = 220;
  return (
    <Svg
      width={(height * width) / viewHeight}
      height={height}
      viewBox={`0 0 ${width} ${viewHeight}`}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Sparkle x={30} y={56} size={11} />
      <Sparkle x={214} y={150} size={8} />
      <Circle cx={54} cy={28} r={4} fill={INK} />
      <Circle cx={208} cy={44} r={5} fill={colors.brand} />
      <Path
        d="M66 212 q18 -7 36 0 t36 0 t36 0"
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <Pingo x={120} y={116} pose={pose} />
    </Svg>
  );
}

function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  const { INK } = useArtColors();
  return (
    <Path
      d={`M${x} ${y - size} Q${x} ${y} ${x + size} ${y} Q${x} ${y} ${x} ${y + size} Q${x} ${y} ${x - size} ${y} Q${x} ${y} ${x} ${y - size} Z`}
      fill={INK}
    />
  );
}
