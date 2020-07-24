import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArVyBRB-XMiStAmjP5mCV2v2PmScbEpi8",
  authDomain: "integrity-step-capstone.firebaseapp.com",
  databaseURL: "https://integrity-step-capstone.firebaseio.com",
  projectId: "integrity-step-capstone",
  storageBucket: "integrity-step-capstone.appspot.com",
  messagingSenderId: "359578935158",
  appId: "1:359578935158:web:89d46122b0609b4a95a457",
  measurementId: "G-GMNRGZQ858"
};

const fire = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const db = firebase.firestore();
const fval = firebase.firestore.FieldValue;

const provider = new firebase.auth.GoogleAuthProvider();
const signInWithGoogle = () => {
  auth.signInWithPopup(provider);
};

export {db, fire, auth, firestore,fval, signInWithGoogle};

export const getUserID = () =>{
  var user = firebase.auth().currentUser;
  if (user != null) {
    return user.uid;
  } else {
    throw "Null User"
  }
};
