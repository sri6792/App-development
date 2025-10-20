// firebaseConfig.js
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDkdhRszX1AgGQhraAHN9wu6NfA_2umMpc",
  authDomain: "to-do-list-app-f9dc0.firebaseapp.com",
  projectId: "to-do-list-app-f9dc0",
  storageBucket: "to-do-list-app-f9dc0.appspot.com",
  messagingSenderId: "438350310265",
  appId: "1:438350310265:web:0b48c73675071660861da8"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firestore
export const db = firebase.firestore();
