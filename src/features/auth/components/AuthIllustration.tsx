import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useColors } from '../../../design-system/theme/ThemeProvider';
import { Pingo } from '../../onboarding/illustrations/Pingo';
import { useArtColors } from '../../onboarding/illustrations/useArtColors';

export type AuthScene = 'hello' | 'mail';

const VIEW_BOXES: Record<AuthScene, { width: number; height: number }> = {
  hello: { width: 250, height: 216 },
  mail: { width: 310, height: 216 },
};

export function AuthIllustration({
  scene,
  height,
}: {
  scene: AuthScene;
  height: number;
}) {
  const box = VIEW_BOXES[scene];
  return (
    <Svg
      width={(height * box.width) / box.height}
      height={height}
      viewBox={`0 0 ${box.width} ${box.height}`}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {scene === 'hello' ? <HelloScene /> : <MailScene />}
    </Svg>
  );
}

function HelloScene() {
  const { INK, line } = useArtColors();
  const colors = useColors();
  return (
    <>
      <Sparkle x={40} y={44} size={12} />
      <Sparkle x={222} y={156} size={8} />
      <Circle cx={66} cy={22} r={4} fill={INK} />
      <Circle cx={234} cy={108} r={5} fill={colors.brand} />
      <Ground x={40} y={206} />
      <Pingo x={110} y={112} pose="wave" />
      <Path
        d="M214 52 q10 8 6 20 M222 76 q6 4 4 12"
        {...line}
        strokeWidth={3.5}
      />
    </>
  );
}

function MailScene() {
  const { INK, line } = useArtColors();
  const colors = useColors();
  return (
    <>
      <Sparkle x={36} y={40} size={10} />
      <Circle cx={60} cy={22} r={4} fill={INK} />
      <Rect
        x={196}
        y={78}
        width={84}
        height={58}
        rx={8}
        fill={colors.canvas}
        stroke={INK}
        strokeWidth={5}
      />
      <Path d="M201 84 L238 112 L275 84" {...line} strokeWidth={5} />
      <Circle
        cx={278}
        cy={78}
        r={11}
        fill={colors.brand}
        stroke={INK}
        strokeWidth={4}
      />
      <Path
        d="M292 112 h12 M288 136 l9 6 M288 92 l9 -6"
        {...line}
        strokeWidth={3.5}
      />
      <Ground x={30} y={206} />
      <Pingo x={100} y={112} pose="tap" />
    </>
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

function Ground({ x, y }: { x: number; y: number }) {
  const { line } = useArtColors();
  return (
    <Path d={`M${x} ${y} q23 -8 46 0 t46 0 t46 0`} {...line} strokeWidth={4} />
  );
}
