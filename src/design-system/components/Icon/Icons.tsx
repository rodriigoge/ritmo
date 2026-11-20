import Svg, { Circle, Path } from 'react-native-svg';
import { useColors } from '../../theme/ThemeProvider';

// Small line icons in the same ink stroke as the illustrations. They are
// decorative: the control that holds one always carries its own label.

type IconProps = { size?: number; color?: string };

function Line({
  d,
  size = 20,
  color,
  strokeWidth = 2.2,
}: IconProps & { d: string; strokeWidth?: number }) {
  const colors = useColors();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d={d}
        stroke={color ?? colors.ink}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return <Line d="M15 5 L8 12 L15 19" strokeWidth={2.5} {...props} />;
}

export function ChevronRightIcon(props: IconProps) {
  return <Line d="M9 5 L16 12 L9 19" strokeWidth={2.5} {...props} />;
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Line d="M5 12 H19 M13 6 L19 12 L13 18" strokeWidth={2.4} {...props} />
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Line
      d="M12 21 C8 21 5.5 18.4 5.5 15 C5.5 11.5 8.5 9.5 9.5 6.5 C10 5 9.8 3.8 9.5 3 C13 4.2 15 7 15 10 C16 9.2 16.6 8.2 16.8 7 C18.2 8.6 18.5 11 18.5 14.5 C18.5 18.4 15.8 21 12 21 Z M12 21 C10.3 21 9.2 19.8 9.2 18.2 C9.2 16.2 11 15.4 11.6 13.6 C13.6 14.6 14.8 16.2 14.8 18.2 C14.8 19.8 13.7 21 12 21 Z"
      strokeWidth={1.8}
      {...props}
    />
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Line
      d="M4 20 L4.8 16 L15.6 5.2 A2.3 2.3 0 0 1 18.8 8.4 L8 19.2 Z M13.8 7 L17 10.2"
      {...props}
    />
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Line
      d="M4 7 H20 M9 7 V4.5 H15 V7 M6.5 7 L7.5 20 H16.5 L17.5 7 M10.2 11 V16 M13.8 11 V16"
      {...props}
    />
  );
}

export function SignOutIcon(props: IconProps) {
  return (
    <Line
      d="M10 4 H6 A2 2 0 0 0 4 6 V18 A2 2 0 0 0 6 20 H10 M15 8 L19 12 L15 16 M19 12 H9"
      {...props}
    />
  );
}

export function MoreIcon({ size = 20, color }: IconProps) {
  const colors = useColors();
  const fill = color ?? colors.ink;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Circle cx={5} cy={12} r={2} fill={fill} />
      <Circle cx={12} cy={12} r={2} fill={fill} />
      <Circle cx={19} cy={12} r={2} fill={fill} />
    </Svg>
  );
}

/** Half-filled circle: light and dark. */
export function ThemeIcon({ size = 20, color }: IconProps) {
  const colors = useColors();
  const ink = color ?? colors.ink;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Circle
        cx={12}
        cy={12}
        r={8.5}
        stroke={ink}
        strokeWidth={2.2}
        fill="none"
      />
      <Path d="M12 3.5 A8.5 8.5 0 0 1 12 20.5 Z" fill={ink} />
    </Svg>
  );
}

/** Arrow leaving a tray. */
export function ExportIcon(props: IconProps) {
  return (
    <Line d="M12 15 V4 M7.5 8.5 L12 4 L16.5 8.5 M5 14 V19 H19 V14" {...props} />
  );
}

/** Arrow landing in a tray. */
export function ImportIcon(props: IconProps) {
  return (
    <Line
      d="M12 4 V15 M7.5 10.5 L12 15 L16.5 10.5 M5 14 V19 H19 V14"
      {...props}
    />
  );
}

/** Bell for notifications. */
export function BellIcon(props: IconProps) {
  return (
    <Line
      d="M6 16.5 V11 A6 6 0 0 1 18 11 V16.5 L19.5 18 H4.5 Z M10 20.5 A2 2 0 0 0 14 20.5"
      {...props}
    />
  );
}

/** Two columns of dots: "hold here to drag". */
export function GripVerticalIcon({ size = 20, color }: IconProps) {
  const colors = useColors();
  const fill = color ?? colors.textMuted;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {[5, 12, 19].map((cy) => (
        <Circle key={`l${cy}`} cx={9} cy={cy} r={1.8} fill={fill} />
      ))}
      {[5, 12, 19].map((cy) => (
        <Circle key={`r${cy}`} cx={15} cy={cy} r={1.8} fill={fill} />
      ))}
    </Svg>
  );
}

/** Circle with a check: completed days. */
export function CheckCircleIcon(props: IconProps) {
  return (
    <Line
      d="M12 3.5 A8.5 8.5 0 1 1 11.99 3.5 Z M8.2 12.3 L10.8 14.9 L15.9 9.6"
      {...props}
    />
  );
}

/** Stacked cards: Home layout. */
export function LayoutIcon(props: IconProps) {
  return (
    <Line
      d="M5 4.5 H19 A1.5 1.5 0 0 1 20.5 6 V10 A1.5 1.5 0 0 1 19 11.5 H5 A1.5 1.5 0 0 1 3.5 10 V6 A1.5 1.5 0 0 1 5 4.5 Z M5 14.5 H19 A1.5 1.5 0 0 1 20.5 16 V18 A1.5 1.5 0 0 1 19 19.5 H5 A1.5 1.5 0 0 1 3.5 18 V16 A1.5 1.5 0 0 1 5 14.5 Z"
      {...props}
    />
  );
}
