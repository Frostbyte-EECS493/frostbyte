import firebase from 'firebase'
import 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyDeOffdWrRWNqVEkE-A4ZA-VFIQ1jKZBt0",
    	authDomain: "frostbyte-d38da.firebaseapp.com",
   	databaseURL: "https://frostbyte-d38da.firebaseio.com",
   	projectId: "frostbyte-d38da",
   	storageBucket: "frostbyte-d38da.appspot.com",
    	messagingSenderId: "798175526214",
   	appId: "1:798175526214:web:e44436de77a484e5abb947",
   	measurementId: "G-HH4R0G8PXH"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
firebase.analytics()
const db = firebase.firestore()
const settings = {
	timestampsInSnapshots: true
}
db.settings(settings)

// firebase collections
const usersCollection = db.collection('users')
const postsCollection = db.collection('posts')
const commentsCollection = db.collection('comments')
const likesCollection = db.collection('likes')

export {
    db,
    auth,
    currentUser,
    usersCollection,
    postsCollection,
    commentsCollection,
    likesCollection
}