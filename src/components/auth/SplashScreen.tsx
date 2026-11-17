
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import { Colors } from "../../constants/colors";

export function SplashScreen() {
  const logoScale = useSharedValue(0.75);
  const logoOpacity = useSharedValue(0);

  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(15);

  useEffect(() => {
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    logoOpacity.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.ease),
    });

    textOpacity.value = withDelay(
      250,
      withTiming(1, { duration: 650 })
    );

    textTranslate.value = withDelay(
      250,
      withTiming(0, {
        duration: 650,
        easing: Easing.out(Easing.ease),
      })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.circleOne} />
      <View style={styles.circleTwo} />
      <View style={styles.circleThree} />

      <View style={styles.content}>
        <Animated.View style={[styles.brand, logoStyle]}>
          {/*
            BUSINESS LOGO SLOT

            When your logo is ready, add it here:

            <Image
              source={require("../../assets/images/express-laundry-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          */}

          <Text style={styles.brandName}>Express Laundry</Text>
        </Animated.View>

        <Animated.View style={[styles.subtitleContainer, textStyle]}>
          <Text style={styles.subtitle}>
            Fresh. Clean. Ready.
          </Text>
          <Text style={styles.description}>
            Your business, beautifully organized.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.loadingTrack}>
          <View style={styles.loadingProgress} />
        </View>
        <Text style={styles.footer}>EXPRESS LAUNDRY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  circleOne: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.055)",
    top: -140,
    right: -130,
  },

  circleTwo: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.045)",
    bottom: -100,
    left: -140,
  },

  circleThree: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: "25%",
    left: -70,
  },

  content: {
    alignItems: "center",
    gap: 20,
  },

  brand: {
    alignItems: "center",
  },

  brandName: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },

  subtitleContainer: {
    alignItems: "center",
    gap: 7,
  },

  subtitle: {
    color: Colors.white,
    fontSize: 19,
    fontWeight: "600",
  },

  description: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },

  bottom: {
    position: "absolute",
    bottom: 65,
    alignItems: "center",
    gap: 12,
  },

  loadingTrack: {
    width: 100,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    overflow: "hidden",
  },

  loadingProgress: {
    width: "65%",
    height: "100%",
    backgroundColor: Colors.white,
    borderRadius: 10,
  },

  footer: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
  },

  // Logo image dimensions, ready for your asset.
  logo: {
    width: 100,
    height: 100,
  },
});
