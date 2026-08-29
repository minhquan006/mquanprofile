import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCGWnyqNZKJ82XcmrxmrWhVPG7-jqU1XCE",
  authDomain: "mquan-profile.firebaseapp.com",
  databaseURL: "https://mquan-profile-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mquan-profile",
  storageBucket: "mquan-profile.firebasestorage.app",
  messagingSenderId: "1022414717838",
  appId: "1:1022414717838:web:ac7f6e01304806e7f8dadf"
};

export const app = initializeApp(firebaseConfig);
