import { StyleSheet, View } from 'react-native';
import { makeStyles } from '../../theme/ThemeProvider';

export function Divider() {
  const styles = useStyles();
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.line}
    />
  );
}
const useStyles = makeStyles((colors) => ({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    alignSelf: 'stretch',
  },
}));
