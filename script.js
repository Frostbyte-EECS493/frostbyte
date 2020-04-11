var selectedFile;
var resultView = new Vue({
  el: '#app',
  data: {
    display: true, //modify this if needed next time,
    userNameSearch: '',
    userSearchData: [],

    logName: '',
    screenName:'',
    usernameInput: '',
    passwordInput: '',
    passwordDouble: '',

    logPage: false,
    loggedIn: false,
    createPage: false,

    commentFlag: false,
  },
  mounted: function() {
    var firebaseRef = firebase.storage().ref();
    let firebaseRefPosts = firebase.database().ref("posts");
    //console.log("loading images from database")
    firebaseRefPosts.once('value')
    .then((snapshot) => {
      snapshot.forEach( (childSnapshot) => {
        //let childKey = childSnapshot.key
        //let childData = childSnapshot.val()
        //console.log("loading...")
        //console.log(childSnapshot.val())
        resultView.userSearchData.push(childSnapshot.val())
      })
    })
  },
  methods: {
  likePost: function(pid){
    console.log("xxx")
    let firebaseRefPosts = firebase.database().ref("posts");
    firebaseRefPosts.orderByChild("postId").equalTo(pid).once('value')
		.then( (snap) => {
      // This only works when postID is unique
      var postHash = Object.keys(snap.val())[0];
      var numLikes = snap.val()[postHash].likes;

			var firebaseRefPostLike = firebase.database().ref("posts/" + postHash + "/likes");
      firebaseRefPostLike.set(numLikes + 1)
      console.log(pid)
      console.log(this.userSearchData.filter(post=>post.postId===pid))
      this.userSearchData.filter(post=>post.postId===pid)[0].likes = numLikes + 1;
  		});
  },
  // log out of account
  logOut: function(){
    this.loggedIn = false;
    // update user's attribute to false
    firebase.database().ref("Credentials/" + resultView.usernameInput).update({loggedIn: "false"});
    console.log("updated " + resultView.usernameInput + " to false");
    // reset all typed user input
    this.logName = '';
    this.screenName = '',
    this.usernameInput = '';
    this.passwordInput = '';
    this.passwordDouble = '';
  },
  // takes user to login page (but not logged in yet)
  logIn: function(){
    this.logPage = true;
    this.createPage = false;
  },
  home_logged_in: function() {
    this.logPage = false
    this.createPage = false
    if (this.loggedIn) {
      var firebaseRef = firebase.storage().ref();
      let firebaseRefPosts = firebase.database().ref("posts");
      this.userSearchData = []
      firebaseRefPosts.once('value').then((snapshot) => {
        snapshot.forEach( (childSnapshot) => {
          resultView.userSearchData.push(childSnapshot.val())
        })
      })
    }
  },
  // checks username/password to log user in
  checkCredentials: function(){

    let user = this.usernameInput;
    let pass = this.passwordInput;
    let userDatabase = '';
    let passDatabase = '';
    let found = false;
    let userNum = 1;

    let creds = firebase.database().ref("Credentials");
    creds.orderByChild("owner").once('value')
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          userDatabase = childSnapshot.val()["username"];
          passDatabase = childSnapshot.val()["password"];

          if(user===userDatabase && pass===passDatabase) {
            found = true;
            resultView.loggedIn = true;
            resultView.logPage = false;
            resultView.logName = user;
            resultView.screenName = childSnapshot.val()["name"];
            firebase.database().ref("Credentials/" + resultView.usernameInput).update({loggedIn: "true"});
            console.log("updated " + userNum + " to true");
            return;
          }
          userNum +=1;
        });
        if (!found) {
          alert("Please enter a valid username/password.");
          return;
        }
      });
  },
  // takes user to create account page
  createAccountPage: function(){
    this.createPage = true;
    this.logPage = false;
    this.loggedIn = false;
  },

  // creates account for user
  createAccount: function(){

    // check that no user inputs are empty
    let name = this.usernameInput;
    let userTaken = false;

    if (name === '' || this.screenName === '' || this.passwordInput === '') {
      alert("Please make sure all fields are filled out.");
            return;
    }

    // check that no username is taken before creating accounts
    var query = firebase.database().ref("Credentials").orderByKey();
    query.once("value")
    .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      // childData will be the actual contents of the child
      var username = childSnapshot.val()["username"];
      if(name===username) {
        alert("Username taken. Please select a different username.");
        userTaken = true;
        return;
      }
    });
    // check that passwords match
    if (this.passwordInput !== this.passwordDouble) {
      alert("Please make sure passwords match.");
      return;
    }
    if (userTaken) {
      return;
    }
    // add account to firebase database
    //increment userCount in database
    let numUsers = 1;
    firebase.database().ref("userCount").once('value').then(function(snapshot) {
      numUsers += snapshot.val();
      firebase.database().ref().update({userCount: numUsers});
      firebase.database().ref("Credentials/" + resultView.usernameInput).set({
        loggedIn: "true",
        name: resultView.screenName,
        password: resultView.passwordInput,
        username: resultView.usernameInput
      });
    });

    alert("Welcome to FrostByte, " + resultView.screenName + "!");
    resultView.createPage = false;
    resultView.loggedIn = true;

  });
  },

  setComment: function(pid) {
    let firebaseRefPosts = firebase.database().ref("posts");
    firebaseRefPosts.orderByChild("postId").equalTo(pid).once('value')
		.then( (snap) => {
      // This only works when postID is unique
      var postHash = Object.keys(snap.val())[0];
      let new_comments = snap.val()[postHash].comments;
      // TODO: change user1 to whoever is logged in
      let added_comment = document.getElementById('query'+pid).value;
      new_comments = Object.assign({"user1": added_comment}, new_comments)
      let firebaseCommentUpdate = firebase.database().ref("posts/" + postHash)
      firebaseCommentUpdate.once('value').then( (snap) => {
        firebaseCommentUpdate.update({ comments: new_comments })
      })
      //(this.userSearchData.filter(post=>post.postId===pid)[0].comments);

      if (this.userSearchData.filter(post=>post.postId===pid)[0].comments === undefined) {
        resultView.userSearchData.find(post=>post.postId===pid)["comments"] = new_comments
      } else {
        this.userSearchData.filter(post=>post.postId===pid)[0].comments = new_comments
      }
      //console.log(this.userSearchData.filter(post=>post.postId===pid)[0])
      resultView.commentFlag = !resultView.commentFlag
    });
  },
  setComment2: function(post_index) {
    let term = this.userNameSearch + '/photos/' + post_index.toString();
    let firebaseRefPosts = firebase.database().ref(term);
    firebaseRefPosts.once('value')
		.then( (snap) => {
      // This only works when postID is unique
      //var postHash = Object.keys(snap.val())[0];
      //var numLikes = snap.val()[postHash].likes;;
      let ed = (snap.val()['comments']);
      ed = Object.assign({"user5": "Hi Jannah"}, ed)
      //console.log(ed)
      //let number_likes = snap.val()
      firebaseRefPosts.update({ comments: ed });
      this.userSearchData[post_index]['comments'] = ed
    })
  },
    setUploadImg: function() { 
	    this.userSearchData = []
  	  console.log("choosing");
      var pic = document.getElementById("setUploadImg"); 
  
      // selected file is that file which user chosen by html form 
      selectedFile = pic.files[0];
      console.log("File")
      console.log(selectedFile)
  
        // Make save button disabled for few seconds that has id='submitImg'
        // Avoid spam saving
        document.getElementById('submitImg').setAttribute('disabled', 'true'); 
        // Save to firebase storage
        resultView.uploadImg();
    },
    //This function retrieves user's photos from database based on username (if exists)
    viewOwnerImgs: function() {
      firebase.database().ref("posts").orderByChild("owner").equalTo(this.userNameSearch).once('value')
      .then(function(snapshot) {
        let returnArr = [];
        snapshot.forEach(function(childSnapshot) {
          returnArr.push(childSnapshot.val())
          //this.userSearchData.push(childSnapshot.val())
          // this.userSearchData.push(childSnapshot.val());
        });
        if(!returnArr.length) {
          alert("Please enter a valid username/this user has not uploaded any photos.");
          return;
        }
        resultView.userSearchData = returnArr;
      });
    },
    uploadImg: function() {
      // references to database objects
      let firebaseRefPosts = firebase.database().ref("posts")
      let firebaseRefPostCount = firebase.database().ref("postCount")

     	let name = Date.now();
     	console.log("Uploading at " + name);
     	let storageRef = firebase.storage().ref('/images/'+ name);
     	let uploadTask = storageRef.put(selectedFile);

    
        // add new post info to firebase database
      uploadTask.then( () => {
		    let currentPostId = 0
  		  firebaseRefPostCount.once('value')
		    // update post count
		    .then( (snap) => {
			    currentPostId = snap.val()
			    firebaseRefPostCount.set(snap.val() + 1)
  		  })
		    // initialize new post
		    .then( () => {
			    console.log("create new empty post id " + currentPostId)
			    let newPostRef = firebaseRefPosts.push()
			    storageRef.getDownloadURL()
          .then( (url) => {
				    newPostRef.set({
				    	'imgUrl': url,
				    	'likes': 0,
				    	'comments': '',
				    	'postId': currentPostId,
					'owner': 'user1'
				    }, function(error) {
              if (error) {
                console.log(error)
              } else {
                // Data saved successfully!
                console.log("loading images from database")
                firebaseRefPosts.once('value')
                .then((snapshot) => {
                  snapshot.forEach( (childSnapshot) => {
                    //let childKey = childSnapshot.key
                    //let childData = childSnapshot.val()
                    console.log("loading...")
                    console.log(childSnapshot.val())
                    resultView.userSearchData.push(childSnapshot.val())
                  })
                })
                console.log("this.userSearchData values:")
                console.log(resultView.userSearchData)
                document.getElementById('submitImg').removeAttribute('disabled');
              }
			      })
		      })
        })
      })
    }
  }, //end of methods
})

!function(d,s,id){
  var js,fjs=d.getElementsByTagName(s)[0];
  if(!d.getElementById(id)){
    js=d.createElement(s);
    js.id=id;
    js.src='https://weatherwidget.io/js/widget.min.js';
    fjs.parentNode.insertBefore(js,fjs);
  }
}(document,'script','weatherwidget-io-js');