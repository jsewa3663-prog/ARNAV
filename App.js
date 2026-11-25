
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebase";

import {
  createPersonalChat,
  listenMessages,
  sendMessage
} from "./chatService";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otherUid, setOtherUid] = useState("");
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
      setChatId("");
      setMessages([]);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!chatId) return;
    return listenMessages(chatId, setMessages);
  }, [chatId]);

  async function handleAuth() {
    try {
      if (!email.trim() || !password) {
        Alert.alert("Error", "Email aur password bharo");
        return;
      }

      if (isSignup) {
        if (!name.trim()) {
          Alert.alert("Error", "Apna naam bharo");
          return;
        }

        const result = await createUserWithEmailAndPassword(
          auth, email.trim(), password
        );

        await updateProfile(result.user, {
          displayName: name.trim()
        });

        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name: name.trim(),
          email: email.trim(),
          createdAt: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(
          auth, email.trim(), password
        );
      }
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  }

  async function openChat() {
    if (!otherUid.trim() || otherUid.trim() === user.uid) {
      Alert.alert("Error", "Doosre account ka sahi UID enter karo");
      return;
    }

    try {
      setChatLoading(true);
      const id = await createPersonalChat(user, {
        uid: otherUid.trim()
      });
      setChatId(id);
    } catch (error) {
      Alert.alert("Chat Error", error.message);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSend() {
    if (!messageText.trim() || !chatId) return;

    try {
      await sendMessage(chatId, messageText, user);
      setMessageText("");
    } catch (error) {
      Alert.alert("Message Error", error.message);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#00d09c" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.logo}>ARNAV CHAT</Text>
        <Text style={styles.heading}>
          {isSignup ? "Create Account" : "Welcome Back"}
        </Text>

        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {isSignup ? "Sign Up" : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
          <Text style={styles.link}>
            {isSignup
              ? "Already have an account? Login"
              : "New user? Create account"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>ARNAV CHAT</Text>
      <Text style={styles.profile}>
        Logged in: {user.displayName || user.email}
      </Text>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {!chatId ? (
        <View>
          <Text style={styles.heading}>Personal Chat</Text>
          <TextInput
            style={styles.input}
            placeholder="Doosre test account ka UID"
            placeholderTextColor="#999"
            autoCapitalize="none"
            value={otherUid}
            onChangeText={setOtherUid}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={openChat}
            disabled={chatLoading}
          >
            <Text style={styles.buttonText}>
              {chatLoading ? "Opening..." : "Open Personal Chat"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.chatArea}>
          <Text style={styles.heading}>Personal Messages</Text>

          <ScrollView style={styles.messageList}>
            {messages.map(item => (
              <View
                key={item.id}
                style={[
                  styles.message,
                  item.senderId === user.uid
                    ? styles.myMessage
                    : styles.otherMessage
                ]}
              >
                <Text style={styles.sender}>
                  {item.senderId === user.uid
                    ? "You"
                    : item.senderName || "Other user"}
                </Text>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.sendRow}>
            <TextInput
              style={styles.messageInput}
              placeholder="Write a message..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
            >
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setChatId("")}>
            <Text style={styles.link}>Back to chat setup</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071526",
    padding: 20
  },
  center: {
    flex: 1,
    backgroundColor: "#071526",
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    color: "#00d09c",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20
  },
  heading: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 18
  },
  profile: {
    color: "#ddd",
    marginBottom: 10
  },
  input: {
    backgroundColor: "#182b40",
    color: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 14
  },
  button: {
    backgroundColor: "#00a982",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  },
  link: {
    color: "#00d09c",
    textAlign: "center",
    marginTop: 15
  },
  logout: {
    backgroundColor: "#a83c48",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20
  },
  chatArea: {
    flex: 1
  },
  messageList: {
    flex: 1,
    marginBottom: 10
  },
  message: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "85%"
  },
  myMessage: {
    backgroundColor: "#075e50",
    alignSelf: "flex-end"
  },
  otherMessage: {
    backgroundColor: "#25384d",
    alignSelf: "flex-start"
  },
  sender: {
    color: "#9ee8d4",
    fontSize: 11,
    marginBottom: 4
  },
  messageText: {
    color: "white",
    fontSize: 16
  },
  sendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#182b40",
    color: "white",
    padding: 12,
    borderRadius: 10
  },
  sendButton: {
    backgroundColor: "#00a982",
    padding: 14,
    borderRadius: 10
  }
});

