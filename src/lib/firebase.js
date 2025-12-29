import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ADAUGĂ ACEST IMPORT
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDqFSoacRFSrXUquJEOrEjdQ7f6gTRouJo",
  authDomain: "recipe-platform-33d64.firebaseapp.com",
  projectId: "recipe-platform-33d64",
  storageBucket: "recipe-platform-33d64.firebasestorage.app",
  messagingSenderId: "255929466710",
  appId: "1:255929466710:web:64a2eec0e26683b9a7a0f7"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app); // ADAUGĂ ACEST EXPORT
export const storage = getStorage(app);