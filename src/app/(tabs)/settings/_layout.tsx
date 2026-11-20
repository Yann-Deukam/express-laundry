
import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="business-information" />
      <Stack.Screen name="team-members" />
      <Stack.Screen name="pricing-payments" />
      <Stack.Screen name="account-profile" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="about-legal" />
    </Stack>
  );
}
