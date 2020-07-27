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


const provider = new firebase.auth.GoogleAuthProvider();
const signInWithGoogle = () => {
  auth.signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.idToken;
    console.log('Token is ' + token);
    localStorage.setItem('Token', token);
  }).catch(function(error) {
    console.log(error)
  });
};
const signOut = () =>{
  auth.signOut().then(function() {
      console.log("Signed out")
      localStorage.setItem('Token','N/A');
  }).catch(function(error) {
      throw ("Error is" + error)
  });
}
export const getUserID = () =>{
  var user = firebase.auth().currentUser;
  if (user != null) 
  {
    return user.uid;
  }
  else
  {
    throw "Null User"
  }
};
export {db, fire, auth, firestore,signOut, signInWithGoogle};
