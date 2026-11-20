import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  ScrollView,
  View,
  type GestureResponderHandlers,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useReduceMotion } from '../../../shared/useReduceMotion';

// Drag-to-reorder list built on PanResponder and Animated only (no native
// dependency), so it ships in over-the-air updates. Only the handle starts
// a drag; the rest of each row keeps its own taps. While dragging, the row
// follows the finger, the others slide out of the way, and the list
// scrolls by itself near the top and bottom edges.

export type DragHandleProps = GestureResponderHandlers;

type Layout = { y: number; height: number };

const SHIFT_MS = 150;
const LIFT_SCALE = 1.025;
const DROP_MS = 140;
const EDGE = 96; // px from the viewport edge where auto-scroll starts
const MAX_SCROLL_STEP = 14; // px per frame at the very edge

/**
 * Where a dragged row lands: the number of other rows whose middle is above
 * the dragged row's middle. `layouts` are in list order.
 */
export function dropIndex(
  layouts: readonly Layout[],
  from: number,
  center: number,
): number {
  let index = 0;
  layouts.forEach((layout, position) => {
    if (position !== from && layout.y + layout.height / 2 < center) index += 1;
  });
  return index;
}

/** How far a row travels to take the place of the rows from..to. */
export function travel(
  layouts: readonly Layout[],
  from: number,
  to: number,
  gap: number,
): number {
  let distance = 0;
  if (to > from)
    for (let i = from + 1; i <= to; i += 1) distance += layouts[i].height + gap;
  else for (let i = to; i < from; i += 1) distance -= layouts[i].height + gap;
  return distance;
}

type Settings = {
  keys: string[];
  gap: number;
  onMove: (from: number, to: number) => void;
};

type Drag = {
  from: number;
  to: number;
  layouts: Layout[];
  startScroll: number;
  gestureDy: number;
  fingerY: number;
  viewport: { top: number; bottom: number };
};

/** Gesture state that lives outside React renders. */
class DragController {
  readonly dragY = new Animated.Value(0);
  private readonly shifts = new Map<string, Animated.Value>();
  private readonly layouts = new Map<string, Layout>();
  private settings: Settings = { keys: [], gap: 0, onMove: () => {} };
  private drag: Drag | null = null;
  private frame: number | null = null;
  private scrollView: ScrollView | null = null;
  private container: View | null = null;
  private scrollY = 0;
  private contentHeight = 0;
  private resetPending = false;

  constructor(private readonly setActiveKey: (key: string | null) => void) {}

  attachScroll(view: ScrollView | null) {
    this.scrollView = view;
  }

  attachContainer(view: View | null) {
    this.container = view;
  }

  onScroll = (y: number) => {
    this.scrollY = y;
  };

  onContentHeight = (height: number) => {
    this.contentHeight = height;
  };

  register(key: string, shift: Animated.Value) {
    this.shifts.set(key, shift);
    return () => {
      this.shifts.delete(key);
      this.layouts.delete(key);
    };
  }

  setLayout(key: string, layout: Layout) {
    this.layouts.set(key, layout);
  }

  /** Runs after each render; clears offsets once a drop has re-rendered. */
  afterRender(settings: Settings) {
    this.settings = settings;
    if (!this.resetPending) return;
    this.resetPending = false;
    this.resetMotion();
  }

  resetMotion() {
    this.dragY.setValue(0);
    this.shifts.forEach((value) => value.setValue(0));
  }

  start(key: string, fingerY: number) {
    const { keys } = this.settings;
    const from = keys.indexOf(key);
    const measured = keys.map((item) => this.layouts.get(item));
    if (from < 0 || measured.some((layout) => !layout)) return;
    this.drag = {
      from,
      to: from,
      layouts: measured as Layout[],
      startScroll: this.scrollY,
      gestureDy: 0,
      fingerY,
      viewport: { top: 0, bottom: Number.POSITIVE_INFINITY },
    };
    this.container?.measureInWindow((_x, y, _width, height) => {
      if (this.drag) this.drag.viewport = { top: y, bottom: y + height };
    });
    this.resetMotion();
    this.setActiveKey(key);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => {},
    );
    this.frame = requestAnimationFrame(this.autoScroll);
  }

  move(gestureDy: number, fingerY: number) {
    if (!this.drag) return;
    this.drag.gestureDy = gestureDy;
    this.drag.fingerY = fingerY;
    this.update();
  }

  finish = () => {
    const current = this.drag;
    if (!current) return;
    this.drag = null;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    const { from, to } = current;
    Animated.timing(this.dragY, {
      toValue: travel(current.layouts, from, to, this.settings.gap),
      duration: DROP_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      this.setActiveKey(null);
      if (from === to) {
        this.resetMotion();
        return;
      }
      // The list resets every offset in the same frame it renders the new
      // order (see the layout effect), so nothing jumps.
      this.resetPending = true;
      this.settings.onMove(from, to);
    });
  };

  private update() {
    const current = this.drag;
    if (!current) return;
    const offset = current.gestureDy + (this.scrollY - current.startScroll);
    this.dragY.setValue(offset);
    const own = current.layouts[current.from];
    const to = dropIndex(
      current.layouts,
      current.from,
      own.y + own.height / 2 + offset,
    );
    if (to === current.to) return;
    current.to = to;
    const step = own.height + this.settings.gap;
    this.settings.keys.forEach((key, index) => {
      if (index === current.from) return;
      const target =
        current.from < to && index > current.from && index <= to
          ? -step
          : current.from > to && index >= to && index < current.from
            ? step
            : 0;
      const shift = this.shifts.get(key);
      if (!shift) return;
      Animated.timing(shift, {
        toValue: target,
        duration: SHIFT_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
    void Haptics.selectionAsync().catch(() => {});
  }

  // Scrolls while the finger rests near an edge, carrying the row along.
  private autoScroll = () => {
    this.frame = null;
    const current = this.drag;
    if (!current) return;
    const { top, bottom } = current.viewport;
    const { fingerY } = current;
    const speed =
      fingerY < top + EDGE
        ? -MAX_SCROLL_STEP * Math.min(1, 1 - (fingerY - top) / EDGE)
        : fingerY > bottom - EDGE
          ? MAX_SCROLL_STEP * Math.min(1, 1 - (bottom - fingerY) / EDGE)
          : 0;
    const maxScroll = Math.max(0, this.contentHeight - (bottom - top));
    const next = Math.min(maxScroll, Math.max(0, this.scrollY + speed));
    if (speed !== 0 && next !== this.scrollY) {
      this.scrollY = next;
      this.scrollView?.scrollTo({ y: next, animated: false });
      this.update();
    }
    this.frame = requestAnimationFrame(this.autoScroll);
  };
}

export function ReorderableList<T>({
  data,
  keyExtractor,
  renderItem,
  onMove,
  gap,
  header,
  empty,
  footerSpace = 0,
  contentContainerStyle,
}: {
  data: readonly T[];
  keyExtractor: (item: T) => string;
  renderItem: (args: {
    item: T;
    index: number;
    dragHandleProps: DragHandleProps;
    active: boolean;
  }) => ReactNode;
  /** Called once, on drop, when the row ends up somewhere else. */
  onMove: (from: number, to: number) => void;
  gap: number;
  header?: ReactNode;
  empty?: ReactNode;
  /** Extra space below the last row (e.g. for a floating button). */
  footerSpace?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [controller] = useState(() => new DragController(setActiveKey));

  useLayoutEffect(() => {
    controller.afterRender({ keys: data.map(keyExtractor), gap, onMove });
  });
  const attachContainer = useCallback(
    (view: View | null) => controller.attachContainer(view),
    [controller],
  );
  const attachScroll = useCallback(
    (view: ScrollView | null) => controller.attachScroll(view),
    [controller],
  );

  return (
    <View ref={attachContainer} style={{ flex: 1 }} collapsable={false}>
      <ScrollView
        ref={attachScroll}
        scrollEnabled={activeKey === null}
        scrollEventThrottle={16}
        onScroll={(event) =>
          controller.onScroll(event.nativeEvent.contentOffset.y)
        }
        onContentSizeChange={(_width, height) =>
          controller.onContentHeight(height)
        }
        contentContainerStyle={contentContainerStyle}
      >
        {header}
        {data.length === 0 ? (
          empty
        ) : (
          <View style={{ gap, paddingBottom: footerSpace }}>
            {data.map((item, index) => {
              const key = keyExtractor(item);
              return (
                <Row
                  key={key}
                  rowKey={key}
                  controller={controller}
                  active={key === activeKey}
                >
                  {(dragHandleProps) =>
                    renderItem({
                      item,
                      index,
                      dragHandleProps,
                      active: key === activeKey,
                    })
                  }
                </Row>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Row({
  rowKey,
  controller,
  active,
  children,
}: {
  rowKey: string;
  controller: DragController;
  active: boolean;
  children: (dragHandleProps: DragHandleProps) => ReactNode;
}) {
  const [shift] = useState(() => new Animated.Value(0));
  const [responder] = useState(() =>
    PanResponder.create({
      // The handle claims the touch at once, so the list does not scroll.
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (_event, gesture) =>
        controller.start(rowKey, gesture.y0),
      onPanResponderMove: (_event, gesture) =>
        controller.move(gesture.dy, gesture.moveY),
      onPanResponderRelease: controller.finish,
      onPanResponderTerminate: controller.finish,
    }),
  );

  useEffect(
    () => controller.register(rowKey, shift),
    [controller, rowKey, shift],
  );

  // A slight lift while held: just enough to say "this one is moving".
  const [lift] = useState(() => new Animated.Value(1));
  const reduceMotion = useReduceMotion();
  useEffect(() => {
    const target = active && !reduceMotion ? LIFT_SCALE : 1;
    Animated.timing(lift, {
      toValue: target,
      duration: active ? 120 : 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [active, reduceMotion, lift]);

  return (
    <Animated.View
      onLayout={(event) => {
        const { y, height } = event.nativeEvent.layout;
        controller.setLayout(rowKey, { y, height });
      }}
      style={[
        {
          transform: [
            { translateY: active ? controller.dragY : shift },
            { scale: lift },
          ],
        },
        active && {
          zIndex: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.16,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        },
      ]}
    >
      {children(responder.panHandlers)}
    </Animated.View>
  );
}
