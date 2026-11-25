import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";

import { auth, db } from "./firebase";

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

export default function App() {
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });

    return unsubscribe;
  }, []);

  async function submit() {
    if (!email.trim() || password.length < 6) {
      Alert.alert(
        "ARNAV CHAT",
        "Valid email aur minimum 6 character password likho."
      );
      return;
    }

    if (signup && !name.trim()) {
      Alert.alert("ARNAV CHAT", "Apna naam likho.");
      return;
    }

    setLoading(true);

    try {
      if (signup) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

        await updateProfile(result.user, {
          displayName: name.trim()
        });

        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          createdAt: serverTimestamp()
        });

        Alert.alert(
          "ARNAV CHAT",
          "Account aur profile successfully created!"
        );

      } else {
        const result = await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

        await setDoc(
          doc(db, "users", result.user.uid),
          {
            uid: result.user.uid,
            name: result.user.displayName || "",
            email: result.user.email || "",
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );

        Alert.alert("ARNAV CHAT", "Welcome!");
      }

    } catch (error) {
      Alert.alert("Error", error.message);

    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  }

  if (checking) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#16B889" />
        <Text style={styles.loadingText}>
          Loading ARNAV CHAT...
        </Text>
      </SafeAreaView>
    );
  }

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.displayName || user.email || "A")
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <Text style={styles.title}>ARNAV CHAT</Text>
          <Text style={styles.heading}>My Profile</Text>

          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>
            {user.displayName || "No name"}
          </Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>
            {user.email}
          </Text>

          <Text style={styles.label}>User ID</Text>
          <Text style={styles.uid}>
            {user.uid}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={logout}
          >
            <Text style={styles.buttonText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>ARNAV CHAT</Text>

        <Text style={styles.heading}>
          {signup ? "Create Account" : "Welcome Back"}
        </Text>

        {signup && (
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor="#A9C2C8"
            value={name}
            onChangeText={setName}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#A9C2C8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (minimum 6 characters)"
          placeholderTextColor="#A9C2C8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#06251D" />
          ) : (
            <Text style={styles.buttonText}>
              {signup ? "CREATE ACCOUNT" : "LOGIN"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSignup(!signup)}
          disabled={loading}
        >
          <Text style={styles.switchText}>
            {signup
              ? "Already have an account? Login"
              : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071B24",
    justifyContent: "center",
    padding: 22
  },

  card: {
    backgroundColor: "#102D38",
    padding: 24,
    borderRadius: 20
  },

  avatar: {
    width: 85,
    height: 85,
    borderRadius: 50,
    backgroundColor: "#16B889",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18
  },

  avatarText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold"
  },

  title: {
    color: "#16B889",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20
  },

  heading: {
    color: "#fff",
    fontSize: 23,
    textAlign: "center",
    marginBottom: 20
  },

  label: {
    color: "#57DDB5",
    fontSize: 14,
    marginTop: 12
  },

  value: {
    color: "#fff",
    fontSize: 17,
    marginTop: 5
  },

  uid: {
    color: "#A9C2C8",
    fontSize: 11,
    marginTop: 5
  },

  input: {
    backgroundColor: "#193D49",
    color: "#fff",
    padding: 15,
    borderRadius: 11,
    marginBottom: 14
  },

  button: {
    backgroundColor: "#16B889",
    padding: 16,
    borderRadius: 11,
    alignItems: "center",
    marginVertical: 15
  },

  buttonText: {
    color: "#06251D",
    fontWeight: "bold",
    fontSize: 16
  },

  switchText: {
    color: "#57DDB5",
    textAlign: "center",
    padding: 12
  },

  loadingText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 15
  }
});
