import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PasosScreen from './src/screens/PasosScreen';
import UtilsScreen from './src/screens/UtilsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#161b22' },
          headerTintColor: '#58a6ff',
          headerTitleStyle: { fontWeight: '700' },
          tabBarStyle: {
            backgroundColor: '#161b22',
            borderTopColor: '#21262d',
            paddingBottom: 8,
            paddingTop: 6,
            height: 62,
          },
          tabBarActiveTintColor: '#58a6ff',
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
