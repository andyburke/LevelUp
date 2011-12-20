var mongoose = require( 'mongoose' );
var MongooseTypes = require( 'mongoose-types' );
MongooseTypes.loadTypes( mongoose );
var UseTimestamps = MongooseTypes.useTimestamps;

var sha1 = require( 'sha1' );

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

exports.OrganizationSchema = new mongoose.Schema({
    apiSecret: { type: String },
    name: { type: String },
    description: { type: String },
    url: { type: String },
    ownerIds: { type: Array }
});
exports.OrganizationSchema.plugin( UseTimestamps );
exports.Organization = mongoose.model( 'Organization', exports.OrganizationSchema );
exports.Organization.prototype.updateApiSecret = function() {
    this.apiSecret = sha1( 'SO SECRET!' + this.name + new Date() );      
};
exports.Organization.prototype.censored = function( fields ) { return censor( this, fields ); };

exports.ContextSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.ObjectId, index: true },
    name: { type: String },
    description: { type: String },
    image: { type: String },
    url: { type: String }
});
exports.ContextSchema.plugin( UseTimestamps );
exports.Context = mongoose.model( 'Context', exports.ContextSchema );

exports.AchievementClassSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.ObjectId, index: true },
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
    organizationId: { type: mongoose.Schema.ObjectId, index: true },
    contextId: { type: mongoose.Schema.ObjectId, index: true },
    classId: { type: mongoose.Schema.ObjectId }
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
