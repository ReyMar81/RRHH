// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCiG4zJFxl3sYGX9in4vidMK4mSG54xui8",
    authDomain: "rrhh-2bbb0.firebaseapp.com",
    projectId: "rrhh-2bbb0",
    storageBucket: "rrhh-2bbb0.firebasestorage.app",
    messagingSenderId: "645221967987",
    appId: "1:645221967987:web:8dd0831d4c41c0ecb5e206"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

// Export storage
export { storage };