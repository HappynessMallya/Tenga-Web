// @ts-ignore
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
// Backend-dependent logic removed for UI-only phase

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(false);

  // No side effects while backend/APIs are not integrated

  const handleSignUpWithEmail = async () => {
    if (!isLoading) {
      setIsLoading(true);
      try {
        router.push('/(auth)/signup');
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignInWithGoogle = () => {
    // Temporarily route directly to sign-in until backend is ready
    if (!isLoading) router.push('/(auth)/signin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Background with Tenga image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../../assets/Tenga.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>
            Give us your Tenga and we will wash your laundry, {' '}
            <Text style={styles.highlightText}>Hustle free</Text>
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* Sign up */}
          <TouchableOpacity
            onPress={handleSignUpWithEmail}
            disabled={isLoading}
            style={[styles.primaryButton, styles.signUpButton]}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Google sign in button */}
          <TouchableOpacity
            onPress={handleSignInWithGoogle}
            disabled={isLoading}
            style={[styles.secondaryButton, styles.googleButton]}
          >
            {/* <Image
              source={require('../../assets/google.png')}
              style={styles.googleIconImage}
              resizeMode="contain"
            /> */}
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: screenWidth,
    height: screenHeight,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  textContainer: {
    marginBottom: 60,
  },
  mainText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 36,
    textAlign: 'left',
  },
  highlightText: {
    color: '#9334ea', // Purple color to match the button
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#9334ea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signUpButton: {
    // Additional styles for sign up button if needed
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  googleButton: {
    // Additional styles for Google button if needed
  },
  googleIconImage: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  },
});
