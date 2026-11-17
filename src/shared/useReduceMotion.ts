import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Whether the system asks apps to cut down on motion; follows changes. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduce(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduce,
    );
    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);
  return reduce;
}
