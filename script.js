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
     	var storageRef = firebase.storage().ref('/images/'+ name);
     	var uploadTask = storageRef.put(selectedFile);

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
            console.log("Uploading Image")
          	},function(error) {console.log(error); 
          	},function() {
            	// get the uploaded image url back 
               	uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) { 
  
                // You get your url from here 
                console.log('File available at ', downloadURL); 
              	document.getElementById('submitImg').removeAttribute('disabled');
            });
        });
     }
  }
})