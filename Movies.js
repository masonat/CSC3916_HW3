var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

//user schema
var MovieSchema = new Schema({
    title: { type: String, required: true},
    year: { type: String, required: true},
    genre: { type: String, default: 'Drama'},
    actors: { type: [{actorName: String, characterName: String}], required: true }
});


//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);