import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { MainTabParamList, RootStackParamList } from "./routes";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { RegisterPlaceholderScreen } from "../screens/RegisterPlaceholderScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { TasksScreen } from "../screens/TasksScreen";
import { useAppTheme } from "../theme/AppThemeProvider";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.medium,
          fontSize: 12
        }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Hoje" }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: "Tarefas" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Ajustes" }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { navigationTheme } = useAppTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Register" component={RegisterPlaceholderScreen} />
        <RootStack.Screen name="MainTabs" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
