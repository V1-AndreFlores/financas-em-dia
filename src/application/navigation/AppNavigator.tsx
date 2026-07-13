import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AddTransactionScreen } from '../../presentation/screens/AddTransactionScreen';
import { HomeScreen } from '../../presentation/screens/HomeScreen';
import { ReportsScreen } from '../../presentation/screens/ReportsScreen';
import { SettingsScreen } from '../../presentation/screens/SettingsScreen';
import { TransactionsScreen } from '../../presentation/screens/TransactionsScreen';
import { useAppTheme } from '../../presentation/theme/AppThemeProvider';

export type RootTabParamList = {
  Inicio: undefined;
  Lancamentos: undefined;
  Adicionar: undefined;
  Relatorios: undefined;
  Ajustes: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const iconMap: Record<keyof RootTabParamList, React.ComponentProps<typeof Ionicons>['name']> = {
  Inicio: 'home-outline',
  Lancamentos: 'list-outline',
  Adicionar: 'add-circle-outline',
  Relatorios: 'bar-chart-outline',
  Ajustes: 'settings-outline',
};

const labelMap: Record<keyof RootTabParamList, string> = {
  Inicio: 'Início',
  Lancamentos: 'Lançamentos',
  Adicionar: 'Adicionar',
  Relatorios: 'Relatórios',
  Ajustes: 'Ajustes',
};

export function AppNavigator() {
  const { theme, resolvedMode } = useAppTheme();

  const navigationTheme = {
    ...(resolvedMode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(resolvedMode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      border: theme.colors.border,
      primary: theme.colors.primary,
      text: theme.colors.text,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarLabel: labelMap[route.name],
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            height: 68,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconMap[route.name]} color={color} size={size} />
          ),
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Lancamentos" component={TransactionsScreen} />
        <Tab.Screen name="Adicionar" component={AddTransactionScreen} />
        <Tab.Screen name="Relatorios" component={ReportsScreen} />
        <Tab.Screen name="Ajustes" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
