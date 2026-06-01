const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0').then(async () => {
    const J = mongoose.model('Journal', new mongoose.Schema({title:String,googleBusinessSync:String,date:String,lastSyncedAt:Date},{strict:false}));
    const posts = await J.find({date:{$gte:'2026-05-27',$lte:'2026-05-31'}}).sort({date:1});
    posts.forEach(p => console.log(p.date,'|',p.googleBusinessSync,'|',p.lastSyncedAt||'Never','|',p.title));
    await mongoose.disconnect();
});
