import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, BarChart3 } from 'lucide-react-native';
import DashboardScreen from '../screens/DashboardScreen';
import AnalysisScreen from '../screens/AnalysisScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: '#ffffff',
                        borderTopWidth: 0,
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -3 },
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                        height: 70 + insets.bottom,
                        paddingBottom: 10 + insets.bottom,
                        paddingTop: 10,
                    },
                    tabBarActiveTintColor: '#6366f1',
                    tabBarInactiveTintColor: '#94a3b8',
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                    },
                }}
            >
                <Tab.Screen
                    name="Dashboard"
                    component={DashboardScreen}
                    options={{
                        tabBarLabel: 'Ana Sayfa',
                        tabBarIcon: ({ color, size }) => (
                            <LayoutDashboard size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Analysis"
                    component={AnalysisScreen}
                    options={{
                        tabBarLabel: 'Analiz',
                        tabBarIcon: ({ color, size }) => (
                            <BarChart3 size={size} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
