import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MessageCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MessageCircle size={60} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Family Chat Coming Soon</Text>

        <Text style={styles.description}>
          We're working on a new feature that will allow you to chat with your family members directly in the app.
          Stay tuned for updates!
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Group chats with your family</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Share location directly in chat</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Send photos and videos</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>End-to-end encryption</Text>
          </View>
        </View>

        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' }}
          style={styles.image}
          resizeMode="cover"
        />

        <Button
          title="Get Notified When Available"
          onPress={() => {}}
          fullWidth
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 32,
  },
  button: {
    marginTop: 'auto',
  },
});
