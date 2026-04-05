import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PasosScreen from './src/screens/PasosScreen';
import UtilsScreen from './src/screens/UtilsScreen';
import PlusScreen from './src/screens/PlusScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0a1628' },
          headerTintColor: '#00C853',
          headerTitleStyle: { fontWeight: '800' },
          tabBarStyle: {
            backgroundColor: '#0a1628',
            borderTopColor: '#1e2f4a',
            paddingBottom: 8,
            paddingTop: 6,
            height: 62,
          },
          tabBarActiveTintColor: '#00C853',
          tabBarInactiveTintColor: '#555',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Pasos"
          component={PasosScreen}
          options={{
            title: 'Mis Pasos',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🦶</Text>,
          }}
        />
        <Tab.Screen
          name="Plus"
          component={PlusScreen}
          options={{
            title: 'SoySaludable+ Plus',
            tabBarLabel: '🌿 Plus',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🌿</Text>,
          }}
        />
        <Tab.Screen
          name="Utilidades"
          component={UtilsScreen}
          options={{
            title: 'Utilidades',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔧</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
