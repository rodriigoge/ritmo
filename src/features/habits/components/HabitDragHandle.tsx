import { View } from 'react-native';
import { GripVerticalIcon } from '../../../design-system/components/Icon/Icons';
import type { DragHandleProps } from '../../../design-system/components/ReorderableList/ReorderableList';
import { makeStyles } from '../../../design-system/theme/ThemeProvider';

/**
 * Grip at the top right of a habit card. Hold and drag it to reorder; screen
 * reader users get "Mover para cima / para baixo" actions instead.
 */
export function HabitDragHandle({
  name,
  index,
  count,
  dragHandleProps,
  onMove,
}: {
  name: string;
  index: number;
  count: number;
  dragHandleProps: DragHandleProps;
  onMove: (from: number, to: number) => void;
}) {
  const styles = useStyles();
  const actions = [
    ...(index > 0 ? [{ name: 'moveUp', label: 'Mover para cima' }] : []),
    ...(index < count - 1
      ? [{ name: 'moveDown', label: 'Mover para baixo' }]
      : []),
  ];
  return (
    <View
      {...dragHandleProps}
      accessible
      accessibilityLabel={`Reordenar ${name}`}
      accessibilityHint="Segure e arraste para mudar a posição na lista"
      accessibilityActions={actions}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'moveUp') onMove(index, index - 1);
        if (event.nativeEvent.actionName === 'moveDown')
          onMove(index, index + 1);
      }}
      hitSlop={6}
      style={styles.handle}
      testID={`reorder-${name}`}
    >
      <GripVerticalIcon size={20} />
    </View>
  );
}

// 40×40 touch area; the card offsets it so the icon lines up with the text.
const useStyles = makeStyles(() => ({
  handle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
