var selectedFile;
var resultView = new Vue({
  el: '#app',
  data: {
    resultData: [],
    display: true, //modify this if needed next time,
    userNameSearch: '',
    userSearchData: [],
    logName: "user1",
    loggedIn: true,
  },
  mounted: function() {
    var firebaseRef = firebase.storage().ref();
    let firebaseRefPosts = firebase.database().ref("posts");
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
  },
  methods: {
  setComment: function(temp_index) {
    let firebaseRefPosts = firebase.database().ref("posts");
    firebaseRefPosts.orderByChild("postId").equalTo((parseInt(temp_index) + 1)).once('value')
		.then( (snap) => {
      // This only works when postID is unique
      var postHash = Object.keys(snap.val())[0];
      var numLikes = snap.val()[postHash].likes;

			var firebaseRefPostLike = firebase.database().ref("posts/" + postHash + "/likes");
      firebaseRefPostLike.set(numLikes + 1);
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
      console.log(ed)
      //let number_likes = snap.val()
      firebaseRefPosts.update({ comments: ed });
      this.userSearchData[post_index]['comments'] = ed
    })
  },
   likePost: function(temp_index){
    let term = this.userNameSearch + '/photos/' + post_index.toString();
    let firebaseRefPosts = firebase.database().ref(term);
    firebaseRefPosts.once('value')
		.then( (snap) => {
      // This only works when postID is unique
      //var postHash = Object.keys(snap.val())[0];
      //var numLikes = snap.val()[postHash].likes;;
      let ed = (snap.val()['likes']);
      //let number_likes = snap.val()
      firebaseRefPosts.update({ likes: ed + 1 });
      this.userSearchData[post_index]['likes'] = ed + 1
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
      let term = this.userNameSearch + '/photos';

      firebase.database().ref(term).once('value')
      .then(function(snapshot) {
        let returnArr = [];
        snapshot.forEach(function(childSnapshot) {
          returnArr.push(childSnapshot.val())
          //this.userSearchData.push(childSnapshot.val())
          // this.userSearchData.push(childSnapshot.val());
        });
        if(!returnArr.length) {
          alert("Please enter a valid username.");
          return;
        }
        resultView.userSearchData = returnArr;
        console.log("Youve reached it");
        console.log(resultView.userSearchData);
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
				    	'postId': currentPostId
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





