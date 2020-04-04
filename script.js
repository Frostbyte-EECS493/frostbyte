var resultView = new Vue({
  el: '#app',
  data: {
    data: '',
    resultCount: 2,
  },
  methods: {
  	addOne: function() {
  		alert();
  		// var firebaseRef = firebase.database().ref("incrementTest");
  		// var current = -1;
  		// firebaseRef.once('value').then(function(snapshot) {
  		// 	firebaseRef.set(snapshot.val() + 1);
  		// });
  	},
  }
})