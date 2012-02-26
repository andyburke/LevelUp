var mongoose = require( 'mongoose' );
var MongooseTypes = require( 'mongoose-types' );
MongooseTypes.loadTypes( mongoose );
var UseTimestamps = MongooseTypes.useTimestamps;

var sha1 = require( 'sha1' );
var crypto = require( 'crypto' );

// TODO: make this be on the mongoose model prototype
var censor = exports.censor = function ( object, fields )
{
    var censored = {};
    for ( var key in ( object._doc || object ) )
    {
        if ( !( key in fields ) )
        {
            censored[ key ] = object[ key ];
        }
    }
    return censored;
}

exports.ContextSchema = new mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String },
    image: { type: String },
    url: { type: String },
    owners: { type: Array, index: true },
    apiKey: { type:String, index: true }
});
exports.ContextSchema.plugin( UseTimestamps );
exports.Context = mongoose.model( 'Context', exports.ContextSchema );
exports.Context.prototype.resetAPIKey = function() {
    this.apiKey = sha1( crypto.randomBytes( 1024 ).toString() );
};

exports.AchievementClassSchema = new mongoose.Schema({
    contextId: { type: mongoose.Schema.ObjectId, index: true },
    name: { type: String },
    description: { type: String },
    image: { type: String },
    points: { type: Number, default: 0 }
});
exports.AchievementClassSchema.plugin( UseTimestamps );
exports.AchievementClass = mongoose.model( 'AchievementClass', exports.AchievementClassSchema );

exports.AchievementSchema = new mongoose.Schema({
    userHash: { type: String, index: true },
    contextId: { type: mongoose.Schema.ObjectId, index: true },
    classId: { type: mongoose.Schema.ObjectId, index: true }
});
exports.AchievementSchema.plugin( UseTimestamps );
exports.Achievement = mongoose.model( 'Achievement', exports.AchievementSchema )

exports.UserSchema = new mongoose.Schema({
    hash: { type: String, unique: true },
    email: { type: String, index: true },
    passwordHash: { type: String },
    nickname: { type: String, index: true },
    bio: { type: String },
    location: { type: String },
    score: { type: Number, default: 0 }
});
exports.UserSchema.plugin( UseTimestamps );
exports.User = mongoose.model( 'User', exports.UserSchema );
exports.User.prototype.censored = function( fields ) { return censor( this, fields ); };
