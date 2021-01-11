//init db
const db = firebase.firestore();

db.enablePersistence().catch( err => {
  if (err.code === 'unimplemented'){
    console.log('persistence is not available');
  }
})

db.collection("koordinat").where("status", "==", true).get()
    .then(function(querySnapshot) {
        // let maxTime =0, next_x, next_y;
        querySnapshot.forEach(function(doc) {
            // if(doc.data().inserted_at > maxTime){
            //     maxTime = doc.data().inserted_at;
            //     next_x  = doc.data().x;
            //     next_y  = doc.data().y;
            // }
            console.log(doc.data().x + ", " + doc.data().y + " : " + doc.data().inserted_at);
        });
        // console.log(next_x + ", " + next_y + " : " + maxTime);
        // querySnapshot.docChanges().forEach( change => {
        //     console.log(change.doc.data().x + ", " +change.doc.data().y);
        // });
    });