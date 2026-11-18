import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { useColors } from '../../../design-system/theme/ThemeProvider';
import { useArtColors } from './useArtColors';

// Pingo is Ritmo's mascot: the round "o" of the logo wearing headphones,
// with a curl on top that echoes the logo's "r". Drawn around its body
// center (0, 0); the body has a radius of about 60 units.

export type PingoPose = 'wave' | 'tap' | 'cheer';

type PoseSpec = {
  arms: string[];
  hands: { x: number; y: number; r: number }[];
  jumping: boolean;
  joyful: boolean;
  look: number;
};

const POSES: Record<PingoPose, PoseSpec> = {
  wave: {
    arms: ['M-56 22 C-70 32 -74 44 -70 54', 'M56 18 C76 6 86 -14 88 -36'],
    hands: [
      { x: -70, y: 58, r: 7 },
      { x: 89, y: -44, r: 8 },
    ],
    jumping: false,
    joyful: false,
    look: 0,
  },
  tap: {
    arms: ['M-56 22 C-74 22 -78 38 -62 44', 'M57 12 C76 8 88 6 98 6'],
    hands: [{ x: 104, y: 6, r: 9 }],
    jumping: false,
    joyful: false,
    look: 4,
  },
  cheer: {
    arms: ['M-58 12 C-80 4 -88 -24 -86 -52', 'M58 12 C80 4 88 -24 86 -52'],
    hands: [
      { x: -86, y: -60, r: 8 },
      { x: 86, y: -60, r: 8 },
    ],
    jumping: true,
    joyful: true,
    look: 0,
  },
};


export type PingoProps = { x: number; y: number; pose: PingoPose };

export function Pingo({ x, y, pose }: PingoProps) {
  const { INK, PAPER, line } = useArtColors();
  const spec = POSES[pose];
  return (
    <G transform={`translate(${x} ${y})`}>
      {spec.jumping ? <JumpingLegs /> : <StandingLegs />}
      {spec.arms.map((d) => (
        <Path key={d} d={d} {...line} strokeWidth={6} />
      ))}
      {spec.hands.map((hand) => (
        <Circle
          key={`${hand.x},${hand.y}`}
          cx={hand.x}
          cy={hand.y}
          r={hand.r}
          fill={PAPER}
          stroke={INK}
          strokeWidth={5}
        />
      ))}
      <Head />
      {spec.joyful ? <JoyfulFace /> : <SmilingFace look={spec.look} />}
    </G>
  );
}

function Head() {
  const { INK, PAPER, line } = useArtColors();
  return (
    <>
      <Path
        d="M0 -60 C34 -61 61 -34 60 2 C59 36 33 60 -2 60 C-36 59 -61 33 -60 -1 C-59 -35 -34 -59 0 -60 Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth={6}
      />
      {/* Ink hatching gives the round body some volume. */}
      <Path
        d="M22 50 L30 44 M32 44 L42 36 M42 34 L50 24"
        {...line}
        strokeWidth={3}
      />
      <Path
        d="M-2 -59 C-8 -80 6 -96 16 -86 C24 -78 14 -68 6 -76"
        {...line}
        strokeWidth={6}
      />
      <Path d="M-60 -6 C-64 -100 64 -100 60 -6" {...line} strokeWidth={9} />
      <Rect x={-74} y={-28} width={24} height={42} rx={11} fill={INK} />
      <Rect x={50} y={-28} width={24} height={42} rx={11} fill={INK} />
      <Path
        d="M-66 -18 V-6 M58 -18 V-6"
        {...line}
        stroke={PAPER}
        strokeWidth={3}
      />
      <Path
        d="M-44 10 l-4 8 M-37 10 l-4 8 M44 10 l4 8 M37 10 l4 8"
        {...line}
        strokeWidth={2.5}
      />
    </>
  );
}

function SmilingFace({ look }: { look: number }) {
  const { INK, PAPER, line } = useArtColors();
  return (
    <>
      <Ellipse cx={-20 + look} cy={-6} rx={8} ry={11} fill={INK} />
      <Ellipse cx={20 + look} cy={-6} rx={8} ry={11} fill={INK} />
      <Circle cx={-17 + look} cy={-11} r={3} fill={PAPER} />
      <Circle cx={23 + look} cy={-11} r={3} fill={PAPER} />
      <Path d="M-10 14 Q0 24 10 14" {...line} strokeWidth={5} />
    </>
  );
}

function JoyfulFace() {
  const { INK, line } = useArtColors();
  const colors = useColors();
  return (
    <>
      <Path
        d="M-28 -4 Q-20 -16 -12 -4 M12 -4 Q20 -16 28 -4"
        {...line}
        strokeWidth={5}
      />
      <Path
        d="M-13 12 Q0 34 13 12 Z"
        fill={INK}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Path
        d="M-6 22 Q0 18 6 22 Q4 27 0 27 Q-4 27 -6 22 Z"
        fill={colors.brand}
      />
    </>
  );
}

function StandingLegs() {
  const { INK, line } = useArtColors();
  return (
    <>
      <Path d="M-18 58 L-20 80 M18 58 L20 80" {...line} strokeWidth={6} />
      <Ellipse cx={-26} cy={84} rx={13} ry={8} fill={INK} />
      <Ellipse cx={26} cy={84} rx={13} ry={8} fill={INK} />
    </>
  );
}

function JumpingLegs() {
  const { INK, line } = useArtColors();
  return (
    <>
      <Path
        d="M-18 58 Q-22 70 -32 74 M18 58 Q22 70 32 74"
        {...line}
        strokeWidth={6}
      />
      <Ellipse
        cx={-38}
        cy={76}
        rx={12}
        ry={7.5}
        rotation={-20}
        originX={-38}
        originY={76}
        fill={INK}
      />
      <Ellipse
        cx={38}
        cy={76}
        rx={12}
        ry={7.5}
        rotation={20}
        originX={38}
        originY={76}
        fill={INK}
      />
    </>
  );
}
