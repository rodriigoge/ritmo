import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import {} from '../../../design-system/theme/ThemeProvider';
import { Pingo } from './Pingo';
import { useArtColors } from './useArtColors';

export type OnboardingScene = 'welcome' | 'track' | 'rhythm';

export const ILLUSTRATION_ASPECT_RATIO = 320 / 280;


export function OnboardingIllustration({
  scene,
  width,
}: {
  scene: OnboardingScene;
  width: number;
}) {
  return (
    <Svg
      width={width}
      height={width / ILLUSTRATION_ASPECT_RATIO}
      viewBox="0 0 320 280"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {scene === 'welcome' && <WelcomeScene />}
      {scene === 'track' && <TrackScene />}
      {scene === 'rhythm' && <RhythmScene />}
    </Svg>
  );
}

function WelcomeScene() {
  const { INK, BRAND, line } = useArtColors();
  return (
    <>
      <Sparkle x={58} y={62} size={14} />
      <Sparkle x={268} y={196} size={9} />
      <Circle cx={84} cy={34} r={4} fill={INK} />
      <Circle cx={292} cy={100} r={5} fill={BRAND} />
      {/* Hand-lettered "oi!" */}
      <G transform="translate(234 52) rotate(-12)">
        <Path
          d="M0 -6 C6 -6 9 -1 9 4 C9 10 5 14 0 14 C-5 14 -9 10 -9 4 C-9 -1 -5 -6 0 -6 Z M20 -2 V14 M33 -12 V6"
          {...line}
          strokeWidth={4.5}
        />
        <Circle cx={20} cy={-10} r={3} fill={INK} />
        <Circle cx={33} cy={14} r={3} fill={INK} />
      </G>
      <Path
        d="M56 214 l-8 6 M50 202 l-12 0 M56 190 l-8 -6"
        {...line}
        strokeWidth={3.5}
      />
      <Ground x={80} y={246} width={140} />
      <Pingo x={150} y={150} pose="wave" />
      <Path
        d="M254 90 q10 8 6 20 M262 114 q6 4 4 12"
        {...line}
        strokeWidth={3.5}
      />
    </>
  );
}

function TrackScene() {
  const { INK, PAPER, BRAND, line } = useArtColors();
  return (
    <>
      {/* A habit card: four days done, today waiting. */}
      <G rotation={-5} originX={236} originY={66}>
        <Rect
          x={172}
          y={34}
          width={132}
          height={64}
          rx={16}
          fill={PAPER}
          stroke={INK}
          strokeWidth={5}
        />
        <Path d="M190 56 H240" {...line} strokeWidth={5} />
        {[194, 214, 234, 254].map((cx) => (
          <Circle key={cx} cx={cx} cy={78} r={6.5} fill={INK} />
        ))}
        <Circle
          cx={276}
          cy={78}
          r={6.5}
          fill={PAPER}
          stroke={INK}
          strokeWidth={3.5}
          strokeDasharray="3 3"
        />
      </G>
      <Path
        d="M276 104 q-4 14 -14 24"
        {...line}
        strokeWidth={3}
        strokeDasharray="4 6"
      />
      <Circle
        cx={246}
        cy={164}
        r={34}
        fill={BRAND}
        stroke={INK}
        strokeWidth={6}
      />
      <Path
        d="M231 165 L242 176 L262 152"
        {...line}
        stroke={PAPER}
        strokeWidth={7}
      />
      <Path
        d="M292 136 l10 -8 M296 158 h13 M288 182 l10 8"
        {...line}
        strokeWidth={3.5}
      />
      <Sparkle x={40} y={64} size={12} />
      <Circle cx={70} cy={40} r={4} fill={INK} />
      <Ground x={40} y={252} width={140} />
      <Pingo x={110} y={156} pose="tap" />
    </>
  );
}

function RhythmScene() {
  const { INK, BRAND, line } = useArtColors();
  const streak = [60, 90, 120, 150, 180, 210];
  return (
    <>
      <Note x={34} y={126} />
      <BeamedNotes x={256} y={122} />
      <Sparkle x={290} y={196} size={10} />
      <Sparkle x={46} y={176} size={8} />
      <Circle cx={96} cy={40} r={4} fill={INK} />
      <Circle cx={214} cy={26} r={4} fill={BRAND} />
      <Path
        d="M146 212 v12 M160 216 v14 M174 212 v12"
        {...line}
        strokeWidth={3.5}
      />
      {/* The streak: a beat line of completed days leading to today. */}
      <Path
        d="M60 252 q15 -14 30 0 t30 0 t30 0 t30 0 t30 0 t30 0"
        {...line}
        strokeWidth={4}
      />
      {streak.map((cx) => (
        <Circle key={cx} cx={cx} cy={252} r={7} fill={INK} />
      ))}
      <Circle
        cx={242}
        cy={252}
        r={12}
        fill={BRAND}
        stroke={INK}
        strokeWidth={4}
      />
      <Pingo x={160} y={122} pose="cheer" />
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

function Ground({ x, y, width }: { x: number; y: number; width: number }) {
  const { line } = useArtColors();
  const third = width / 3;
  return (
    <Path
      d={`M${x} ${y} q${third / 2} -8 ${third} 0 t${third} 0 t${third} 0`}
      {...line}
      strokeWidth={4}
    />
  );
}

function NoteHead({ x, y }: { x: number; y: number }) {
  const { INK } = useArtColors();
  return (
    <Path
      d={`M${x - 7} ${y + 1} C${x - 7} ${y - 4} ${x + 1} ${y - 7} ${x + 5} ${y - 5} C${x + 9} ${y - 3} ${x + 7} ${y + 3} ${x + 1} ${y + 5} C${x - 4} ${y + 7} ${x - 7} ${y + 5} ${x - 7} ${y + 1} Z`}
      fill={INK}
    />
  );
}

function Note({ x, y }: { x: number; y: number }) {
  const { line } = useArtColors();
  return (
    <G transform={`translate(${x} ${y}) rotate(-10)`}>
      <NoteHead x={0} y={0} />
      <Path d="M6 -2 V-30 Q14 -24 18 -16" {...line} strokeWidth={4} />
    </G>
  );
}

function BeamedNotes({ x, y }: { x: number; y: number }) {
  const { line } = useArtColors();
  return (
    <G transform={`translate(${x} ${y}) rotate(8)`}>
      <NoteHead x={0} y={0} />
      <NoteHead x={24} y={-4} />
      <Path d="M6 -2 V-30 L30 -34 V-6" {...line} strokeWidth={4} />
    </G>
  );
}
