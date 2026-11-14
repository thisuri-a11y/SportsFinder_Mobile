import { StyleSheet, View } from 'react-native';
import { colors } from './theme';

const STRINGS = [11, 19, 27];

export function SportsArt({ style, variant = 'racket' }) {
  const isTableTennis = variant === 'table-tennis';

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      pointerEvents="none"
      style={[styles.art, style]}
    >
      <View style={styles.court} />
      <View style={styles.courtLine} />
      {isTableTennis ? (
        <View style={styles.paddle}>
          <View style={styles.paddleHandle}>
            <View style={styles.handleStripe} />
          </View>
          <View style={styles.paddleFace}>
            <View style={styles.paddleHighlight} />
          </View>
        </View>
      ) : (
        <View style={styles.racket}>
          <View style={styles.rim}>
            {STRINGS.map((offset) => (
              <View key={offset} style={[styles.stringVertical, { left: offset }]} />
            ))}
            {STRINGS.map((offset) => (
              <View key={offset} style={[styles.stringHorizontal, { top: offset + 2 }]} />
            ))}
          </View>
          <View style={styles.shaft} />
          <View style={styles.grip} />
        </View>
      )}
      <View style={[styles.ball, isTableTennis && styles.tableTennisBall]}>
        {!isTableTennis && <View style={styles.ballSeam} />}
      </View>
    </View>
  );
}

const strings = {
  position: 'absolute',
  backgroundColor: colors.mint,
  opacity: 0.52,
};

const styles = StyleSheet.create({
  art: {
    width: 126,
    height: 116,
    overflow: 'hidden',
  },
  court: {
    position: 'absolute',
    width: 96,
    height: 96,
    top: 10,
    right: 12,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '#518F78',
    backgroundColor: '#235F4D',
  },
  courtLine: {
    position: 'absolute',
    width: 112,
    height: 42,
    top: 44,
    right: 4,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#518F78',
    transform: [{ rotate: '-30deg' }],
  },
  racket: {
    position: 'absolute',
    alignItems: 'center',
    top: 13,
    left: 43,
    width: 46,
    transform: [{ rotate: '36deg' }],
  },
  rim: {
    width: 46,
    height: 56,
    borderWidth: 3,
    borderColor: colors.mint,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: colors.forest,
  },
  stringVertical: {
    ...strings,
    width: 1,
    top: 0,
    bottom: 0,
  },
  stringHorizontal: {
    ...strings,
    height: 1,
    left: 0,
    right: 0,
  },
  shaft: {
    width: 4,
    height: 17,
    backgroundColor: colors.mint,
  },
  grip: {
    width: 8,
    height: 19,
    borderRadius: 3,
    backgroundColor: colors.amber,
  },
  paddle: {
    position: 'absolute',
    top: 14,
    left: 37,
    width: 58,
    height: 87,
    transform: [{ rotate: '33deg' }],
  },
  paddleFace: {
    width: 58,
    height: 59,
    borderWidth: 3,
    borderBottomWidth: 5,
    borderColor: colors.amber,
    borderRadius: 29,
    backgroundColor: colors.green,
  },
  paddleHighlight: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: 13,
    height: 17,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderTopLeftRadius: 14,
    borderColor: '#8FC5B0',
  },
  paddleHandle: {
    position: 'absolute',
    top: 50,
    left: 21,
    width: 16,
    height: 35,
    borderRadius: 5,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  handleStripe: {
    width: 3,
    height: 19,
    borderRadius: 2,
    backgroundColor: '#AA7339',
  },
  ball: {
    position: 'absolute',
    overflow: 'hidden',
    right: 10,
    bottom: 16,
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: colors.amber,
    transform: [{ rotate: '-32deg' }],
  },
  ballSeam: {
    position: 'absolute',
    top: -6,
    left: -8,
    width: 23,
    height: 40,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.forest,
  },
  tableTennisBall: {
    width: 19,
    height: 19,
    right: 14,
    bottom: 26,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
});
