var selectedFile;
var resultView = new Vue({
  el: '#app',
  data: {
    resultData: [],
    display: true, //modify this if needed next time,
    userNameSearch: '',
    userSearchData: []
  },
  methods: {
    mounted: function() {
    	var firebaseRef = firebase.storage().ref()
    },
  setComment: function() {
    let firebaseRefPosts = firebase.database().ref("posts");
    firebaseRefPosts.orderByChild("postId").equalTo(1).once('value')
		.then( (snap) => {
      // This only works when postID is unique
      var postHash = Object.keys(snap.val())[0];
      var numLikes = snap.val()[postHash].likes;

			var firebaseRefPostLike = firebase.database().ref("posts/" + postHash + "/likes");
      firebaseRefPostLike.set(numLikes + 1);
  		});
  },
  likePost: function(){

  },
    setUploadImg: function() { 
	this.resultData = []
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

      firebase.database().ref(term).once('value').then(function(snapshot) {
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
			storageRef.getDownloadURL().then( (url) => {
				newPostRef.set({
					'imgUrl': url,
					'likes': 0,
					'comments': '',
					'postId': currentPostId
				})
			})
		})
		// load all images from updated firebase database
		.then( () => {
			console.log("loading images from database")
			firebaseRefPosts.on('value', (snapshot) => {
				snapshot.forEach( (childSnapshot) => {
					//let childKey = childSnapshot.key
					//let childData = childSnapshot.val()
					console.log("loading...")
					console.log(childSnapshot.val())
					this.resultData.push(childSnapshot.val())
				})
  			})
			console.log("this.resultData values:")
			console.log(this.resultData)
		})
       })	
      
    }
  }, //end of methods
})