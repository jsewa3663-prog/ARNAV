import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ScrollView
} from 'react-native';

export default function App() {
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  function submit() {
    if (signup && !name.trim()) {
      Alert.alert('ARNAV CHAT', 'Apna naam likho');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('ARNAV CHAT', '10 digit mobile number likho');
      return;
    }
    if (password.length < 6) {
      Alert.alert('ARNAV CHAT', 'Password kam se kam 6 characters ka ho');
      return;
    }
    Alert.alert(
      'ARNAV CHAT',
      'Screen ready hai. Real account banane ke liye backend authentication jodna baaki hai.'
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>A</Text>
        </View>

        <Text style={styles.title}>ARNAV CHAT</Text>
        <Text style={styles.subtitle}>Connect. Chat. Share.</Text>

        <View style={styles.card}>
          <Text style={styles.heading}>
            {signup ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.description}>
            {signup ? 'Create your ARNAV account' : 'Login to continue'}
          </Text>

          {signup && (
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#8795A5"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="10 digit mobile number"
            placeholderTextColor="#8795A5"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={styles.input}
            placeholder="Password (minimum 6 characters)"
            placeholderTextColor="#8795A5"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={submit}>
            <Text style={styles.buttonText}>
              {signup ? 'CREATE ACCOUNT' : 'LOGIN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSignup(!signup)}
            style={styles.switch}
          >
            <Text style={styles.switchText}>
              {signup
                ? 'Already have an account? Login'
                : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Made with ARNAV</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#071B24'},
  content: {
    flexGrow: 1, justifyContent: 'center',
    alignItems: 'center', padding: 22
  },
  logo: {
    width: 76, height: 76, borderRadius: 24,
    backgroundColor: '#16B889',
    justifyContent: 'center', alignItems: 'center'
  },
  logoText: {fontSize: 44, color: '#fff', fontWeight: 'bold'},
  title: {
    color: '#fff', fontSize: 29,
    fontWeight: 'bold', marginTop: 15
  },
  subtitle: {color: '#A9C2C8', marginTop: 5, marginBottom: 30},
  card: {
    width: '100%', maxWidth: 430,
    backgroundColor: '#102D38',
    padding: 22, borderRadius: 20
  },
  heading: {color: '#fff', fontSize: 24, fontWeight: 'bold'},
  description: {color: '#A9C2C8', marginTop: 7, marginBottom: 22},
  input: {
    backgroundColor: '#193D49', color: '#fff',
    padding: 15, borderRadius: 11,
    marginBottom: 14, fontSize: 15
  },
  button: {
    backgroundColor: '#16B889', padding: 16,
    borderRadius: 11, alignItems: 'center', marginTop: 5
  },
  buttonText: {color: '#06251D', fontWeight: 'bold', fontSize: 16},
  switch: {alignItems: 'center', padding: 18},
  switchText: {color: '#57DDB5', fontWeight: '600'},
  footer: {color: '#829AA1', marginTop: 25}
});
