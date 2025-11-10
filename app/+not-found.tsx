// @ts-ignore
import { router, Link } from 'expo-router';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router/stack';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-bold">This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-sm text-primary-600">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
