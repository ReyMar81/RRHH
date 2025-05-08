// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBMXU4PvG-byLyuzkJ-qBTbSLRRbgph36Q",
    authDomain: "dmsclinica-e3104.firebaseapp.com",
    projectId: "dmsclinica-e3104",
    storageBucket: "dmsclinica-e3104.appspot.com",
    messagingSenderId: "732299773786",
    appId: "1:732299773786:web:83128c1d8b1f4c5da91563"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

// Export storage
export { storage };