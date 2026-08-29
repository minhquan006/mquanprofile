import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "...CỦA BẠN...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};

export const app = initializeApp(firebaseConfig);
