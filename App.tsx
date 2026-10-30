import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ScoreProvider } from './src/context/ScoreContext';
import { RootStackParamList } from './src/navigation';
import { QuestionDetailScreen } from './src/screens/QuestionDetailScreen';
import { QuestionListScreen } from './src/screens/QuestionListScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <ScoreProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Questions"
              component={QuestionListScreen}
              options={{ title: 'Trivia Questions' }}
            />
            <Stack.Screen
              name="QuestionDetail"
              component={QuestionDetailScreen}
              options={{ title: 'Question' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </ScoreProvider>
    </SafeAreaProvider>
  );
}
