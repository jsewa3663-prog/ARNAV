import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { db } from "./firebase";

export async function sendMessage(chatId, text, user) {
  if (!text?.trim() || !user) return;

  await addDoc(
    collection(db, "chats", chatId, "messages"),
    {
      text: text.trim(),
      senderId: user.uid,
      senderName: user.displayName || user.email,
      createdAt: serverTimestamp()
    }
  );
}

export function listenMessages(chatId, callback) {
  const messagesRef = collection(
    db,
    "chats",
    chatId,
    "messages"
  );

  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, snapshot => {
    callback(
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );
  });
}

export async function createPersonalChat(user1, user2) {
  if (!user1?.uid || !user2?.uid) {
    throw new Error("Both users are required");
  }

  if (user1.uid === user2.uid) {
    throw new Error("You cannot chat with yourself");
  }

  const chatId = [user1.uid, user2.uid].sort().join("_");
  const chatRef = doc(db, "chats", chatId);
  const existingChat = await getDoc(chatRef);

  if (existingChat.exists()) {
    return chatId;
  }

  await setDoc(chatRef, {
    type: "personal",
    members: [user1.uid, user2.uid],
    createdBy: user1.uid,
    createdAt: serverTimestamp()
  });

  return chatId;
}
