import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/AuthContext';

// Auth screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Courier screens
import CourierDashboard from './src/screens/courier/CourierDashboard';
import CourierOrderDetail from './src/screens/courier/CourierOrderDetail';
import CourierHistory from './src/screens/courier/CourierHistory';
import CourierEarnings from './src/screens/courier/CourierEarnings';

// Restaurant screens
import RestaurantDashboard from './src/screens/restaurant/RestaurantDashboard';
import RestaurantOrders from './src/screens/restaurant/RestaurantOrders';
import RestaurantNewOrder from './src/screens/restaurant/RestaurantNewOrder';
import RestaurantAnalytics from './src/screens/restaurant/RestaurantAnalytics';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const PURPLE = '#5C3EFF';

function CourierTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PURPLE,
        tabBarStyle: { paddingBottom: 8, height: 60 },
      }}
    >
      <Tab.Screen
        name="CourierDashboard"
        component={CourierDashboard}
        options={{ tabBarLabel: 'Siparişler', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📦</Text> }}
      />
      <Tab.Screen
        name="CourierHistory"
        component={CourierHistory}
        options={{ tabBarLabel: 'Geçmiş', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🕐</Text> }}
      />
      <Tab.Screen
        name="CourierEarnings"
        component={CourierEarnings}
        options={{ tabBarLabel: 'Kazançlar', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💰</Text> }}
      />
    </Tab.Navigator>
  );
}

function RestaurantTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PURPLE,
        tabBarStyle: { paddingBottom: 8, height: 60 },
      }}
    >
      <Tab.Screen
        name="RestaurantDashboard"
        component={RestaurantDashboard}
        options={{ tabBarLabel: 'Ana Sayfa', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="RestaurantOrders"
        component={RestaurantOrders}
        options={{ tabBarLabel: 'Siparişler', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text> }}
      />
      <Tab.Screen
        name="RestaurantNewOrder"
        component={RestaurantNewOrder}
        options={{ tabBarLabel: 'Yeni Sipariş', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text> }}
      />
      <Tab.Screen
        name="RestaurantAnalytics"
        component={RestaurantAnalytics}
        options={{ tabBarLabel: 'Analitik', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text> }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Auth stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user.role === 'courier' ? (
        // Courier stack
        <>
          <Stack.Screen name="CourierHome" component={CourierTabs} />
          <Stack.Screen name="CourierOrderDetail" component={CourierOrderDetail} />
        </>
      ) : user.role === 'restaurant' ? (
        // Restaurant stack
        <>
          <Stack.Screen name="RestaurantHome" component={RestaurantTabs} />
        </>
      ) : (
        // Fallback
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}