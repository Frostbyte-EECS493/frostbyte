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
    setUploadImg: function() { 
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
      this.userSearchData = returnArr;
      console.log("Youve reached it");
      console.log(this.userSearchData);

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

     	uploadTask.on('state_changed', function(snapshot){ 
     		/**
            var progress =  
             (snapshot.bytesTransferred / snapshot.totalBytes) * 100; 
              var uploader = document.getElementById('uploader'); 
              uploader.value=progress; 
              switch (snapshot.state) { 
                case firebase.storage.TaskState.PAUSED: 
                  console.log('Upload is paused'); 
                  break; 
                case firebase.storage.TaskState.RUNNING: 
                  console.log('Upload is running'); 
                  break; 
              } **/
        });
        // add new post info to firebase database
        uploadTask.then( () => {
		// update post count
  		firebaseRefPostCount.once('value').then(function(snapshot) {
			firebaseRefPostCount.set(snapshot.val() + 1)
  		})
		// initialize new post
		let newPostRef = firebaseRefPosts.push()
		storageRef.getDownloadURL().then( function(url) {
			newPostRef.set({
				'imgUrl': url,
				'likes': 0,
				'comments': '' 
			})
		})
		// load all images from updated firebase database
		firebaseRefPosts.once('value').then( (snapshot) => {
			snapshot.forEach( (childSnapshot) => {
				//let childKey = childSnapshot.key
				//let childData = childSnapshot.val()
				this.resultData.push(childSnapshot.val())
			})
  		})
      });	
      
    }
  } //end of methods
})