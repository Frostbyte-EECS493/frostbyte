var selectedFile;
var resultView = new Vue({
  el: '#app',
  data: {
    data: '',
    resultData: [],
    resultCount: 2,
    flag: false,
  },
  methods: {
  	mounted: function () {
  		var firebaseRef = firebase.storage().ref()

	},
  	addOne: function() {
      var val = firebase.database().ref('incrementTest');
      var ret = '';
      axios
      .get(val)
      .then(response => ret = response);
      alert(ret);
      console.log(ret);
  		// var firebaseRef = firebase.database().ref("incrementTest");
  		// var current = -1;
  		// firebaseRef.once('value').then(function(snapshot) {
  		// 	firebaseRef.set(snapshot.val() + 1);
  		// });
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
     uploadImg: function() {
     	var name = Date.now();
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
        uploadTask.then( function() {
		let firebaseRefPostCount = firebase.database().ref("postCount")
		let firebaseRefPosts = firebase.database().ref("posts")
		// update post count
  		firebaseRefPostCount.once('value').then(function(snapshot) {
			firebaseRefPostCount.set(snapshot.val() + 1)
  		})
		// initialize and add new post
		let newPostRef = firebaseRefPosts.push()
		storageRef.getDownloadURL().then( function(url) {
			newPostRef.set({
				'imgUrl': url,
				'likes': 0,
				'comments': '' 
			})
		})
	});	
     }
  }
})