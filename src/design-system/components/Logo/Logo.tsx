import Svg, { Circle, G, Path } from 'react-native-svg';
import { useColors } from '../../theme/ThemeProvider';

// Vector port of assets/img/ritmo-logo.svg, cropped to the wordmark bounds.
const VIEW_BOX = { x: 32, y: 26, width: 580, height: 156 };

export type LogoProps = { height?: number };

export function Logo({ height = 24 }: LogoProps) {
  const colors = useColors();
  const width = (height * VIEW_BOX.width) / VIEW_BOX.height;
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
      accessibilityRole="image"
      accessibilityLabel="Ritmo"
    >
      <G
        fill="none"
        stroke={colors.ink}
        strokeWidth={27}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M53 157 V116 C53 84 75 64 103 64 C130 64 145 83 140 105 C136 124 122 133 105 133 C97 133 93 133 91 135 C98 149 113 156 135 157" />
        <Path d="M177 88 V157" />
        <Path d="M226 47 V123 C226 145 235 157 257 157" />
        <Path d="M226 87 H265" />
        <Path d="M302 157 V112 C302 88 316 74 337 74 C359 74 373 88 373 112 V157" />
        <Path d="M373 112 C373 88 387 74 409 74 C430 74 444 88 444 112 V157" />
        <Circle cx={515} cy={115} r={43} />
      </G>
      <Circle cx={177} cy={49} r={14} fill={colors.ink} />
      <Circle cx={588} cy={157} r={17} fill={colors.brand} />
    </Svg>
  );
}
