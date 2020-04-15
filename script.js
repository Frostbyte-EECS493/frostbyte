var selectedFile;
var resultView = new Vue({
  el: '#app',
  data: {
    display: true, //modify this if needed next time,
    userNameSearch: '',
    userSearchData: [],
    list_locations: [],
    logName: '', //USE THIS INSTEAD OF HARDCODED "USER1"
    screenName:'',
    usernameInput: '', 
    passwordInput: '',
    passwordDouble: '',
    dummy_var: 0,
    current_location: "The Diag",
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
    isLike: function(pid){
      var collectiveLikeUsers = this.userSearchData.filter(post=>post.postId===pid)[0].collectiveLikeUsers

      // typeof EmpName != 'undefined' && EmpName
      if (collectiveLikeUsers === undefined) {
        return 0;
      }
      else if (collectiveLikeUsers === null) {
        return 0;
      }
      else if (collectiveLikeUsers === "") {
        return 0;
      }
      else if(!(this.logName in collectiveLikeUsers)){
        return 0;
      }
      else {
        return collectiveLikeUsers[this.logName];
      }
    },
    currentLocation: function(){
      if(this.dummy_var === 0){
        resultView.dummy_var = 1;
        resultView.list_locations.push("The Dude");
        resultView.list_locations.push("The Ugli");
        resultView.list_locations.push("Hatcher Graduate Library");
        resultView.list_locations.push("The Union");
        resultView.list_locations.push("The State Theatre");
        resultView.list_locations.push("Pinball Pete's");
        resultView.list_locations.push("CCRB");
      setInterval(function () {
        let temp_num = Math.floor(Math.random() * 100) % 7;
        resultView.current_location = resultView.list_locations[temp_num]
      }, 10000)
    }
    },  
  likePost: function(pid){
    console.log("xxx")
    let firebaseRefPosts = firebase.database().ref("posts");
    firebaseRefPosts.orderByChild("postId").equalTo(pid).once('value')
		.then( (snap) => {
      // This only works when postID is unique
      var postHash = Object.keys(snap.val())[0];
      var numLikes = snap.val()[postHash].likes;
      let likeUsers = snap.val()[postHash].collectiveLikeUsers;

			var firebaseRefPostLike = firebase.database().ref("posts/" + postHash + "/likes");
      //firebaseRefPostLike.set(numLikes + 1)
      console.log(pid)
      console.log(this.userSearchData.filter(post=>post.postId===pid))
      //if the username is not in the dictionary containing the users who like or dislike the post
      //then add it into the dictionary
      if(!likeUsers || !(this.logName in likeUsers)){
        if (this.userSearchData.filter(post=>post.postId===pid)[0].collectiveLikeUsers === undefined) {
          resultView.userSearchData.find(post=>post.postId===pid)["collectiveLikeUsers"] = {}
        }
        this.userSearchData.filter(post=>post.postId===pid)[0].collectiveLikeUsers[this.logName] = 1
        let new_temp_user = {}
        new_temp_user[this.logName] = 1
        likeUsers = Object.assign(new_temp_user, likeUsers)
        let firebaseCommentUpdate = firebase.database().ref("posts/" + postHash)
        firebaseCommentUpdate.once('value').then( (snap) => {
          firebaseCommentUpdate.update({ collectiveLikeUsers: likeUsers })
        }) 
        this.userSearchData.filter(post=>post.postId===pid)[0].likes = numLikes + 1;
        firebaseRefPostLike.set(numLikes + 1)
      }
      else {
        if (this.userSearchData.filter(post=>post.postId===pid)[0].collectiveLikeUsers === undefined) {
          resultView.userSearchData.find(post=>post.postId===pid)["collectiveLikeUsers"] = {}
        }
        var firebaseReflike = firebase.database().ref("posts/" + postHash + "/collectiveLikeUsers/" + this.logName);
        if(likeUsers[(this.logName)] === 0){
          //likeUsers[("user1")] = 1
          this.userSearchData.filter(post=>post.postId===pid)[0].collectiveLikeUsers[this.logName] = 1
          firebaseReflike.set(1)
          firebaseRefPostLike.set(numLikes + 1)
          this.userSearchData.filter(post=>post.postId===pid)[0].likes = numLikes + 1;
        }
        else{
          this.userSearchData.filter(post=>post.postId===pid)[0].collectiveLikeUsers[this.logName] = 0
          firebaseReflike.set(0)
          firebaseRefPostLike.set(numLikes - 1)
          this.userSearchData.filter(post=>post.postId===pid)[0].likes = numLikes - 1;
        }
      }
      //this.userSearchData.filter(post=>post.postId===pid)[0].likes = numLikes + 1;
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
  // keep home page if user is logged in
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
    resultView.logName = name;
    //resultView.logName = resultView.usernameInput;

    let firebaseRefPosts = firebase.database().ref("posts");
    firebaseRefPosts.once('value')
    .then((snapshot) => {
      snapshot.forEach( (childSnapshot) => {
        console.log("loading...")
        console.log(childSnapshot.val())
        resultView.userSearchData.push(childSnapshot.val())
      })
    })

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
      // clear comment input box once comment is posted
      document.getElementById('query'+pid).value = ""
      console.log(pid)
      console.log(+document.getElementById('query'+pid).value)
      let commentCount = 0
      
      if (new_comments !== undefined) {
        commentCount = Object.keys(new_comments).length
      }
      commentCount += 1;

      let commentStr = commentCount.toString()
      new_comments = Object.assign({[commentStr]: {"userName": resultView.usernameInput, "msg": added_comment}}, new_comments)

      let firebaseCommentUpdate = firebase.database().ref("posts/" + postHash)
      firebaseCommentUpdate.once('value').then( (snap) => {
        firebaseCommentUpdate.update({ comments: new_comments })
      })

      if (this.userSearchData.filter(post=>post.postId===pid)[0].comments === undefined) {
        resultView.userSearchData.find(post=>post.postId===pid)["comments"] = new_comments
      } else {
        this.userSearchData.filter(post=>post.postId===pid)[0].comments = new_comments
      }
      //console.log(this.userSearchData.filter(post=>post.postId===pid)[0])
      resultView.commentFlag = !resultView.commentFlag
    });
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
          alert("There are no photos to show for this user.");
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
			    currentPostId = snap.val() + 1
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
              'owner': resultView.logName,
              'collectiveLikeUsers': ''
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