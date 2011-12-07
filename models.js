var mongoose = require( 'mongoose' );
var MongooseTypes = require( 'mongoose-types' );
MongooseTypes.loadTypes( mongoose );
var UseTimestamps = MongooseTypes.useTimestamps;

var sha1 = require( 'sha1' );

exports.OrganizationSchema = new mongoose.Schema({
    email: { type: String, index: true },
    passwordHash: { type: String },
    apiSecret: { type: String },
    name: { type: String },
    description: { type: String },
    url: { type: String }
});
exports.OrganizationSchema.plugin( UseTimestamps );
exports.Organization = mongoose.model( 'Organization', exports.OrganizationSchema );
exports.Organization.prototype.updateApiSecret = function() {
    this.apiSecret = sha1( 'SO SECRET!' + this.email + this.passwordHash + this.name + new Date() );      
};

exports.ContextSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.ObjectId, index: true },
    name: { type: String },
    description: { type: String },
    image: { type: String },
    url: { type: String }
});
exports.ContextSchema.plugin( UseTimestamps );
exports.Context = mongoose.model( 'Context', exports.ContextSchema );

exports.PersonSchema = new mongoose.Schema({
    idHash: { type: String, unique: true },
    email: { type: String, index: true },
    passwordHash: { type: String },
    nickname: { type: String, index: true },
    bio: { type: String },
    location: { type: String },
    score: { type: Number, default: 0 }
});
exports.PersonSchema.plugin( UseTimestamps );
exports.Person = mongoose.model( 'Person', exports.PersonSchema );

exports.XPEventSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.ObjectId, index: true },
    contextId: { type: mongoose.Schema.ObjectId, index: true },
    personId: { type: mongoose.Schema.ObjectId, index: true },
    eventType: { type: String },
    extra: { type: String },
    xpDelta: { type: Number }
});
exports.XPEventSchema.plugin( UseTimestamps );
exports.XPEvent = mongoose.model( 'XPEvent', exports.XPEventSchema );

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
    organizationId: { type: mongoose.Schema.ObjectId, index: true },
    contextId: { type: mongoose.Schema.ObjectId, index: true },
    personId: { type: mongoose.Schema.ObjectId, index: true },
    achievementClassId: { type: mongoose.Schema.ObjectId }
});
exports.AchievementSchema.plugin( UseTimestamps );
exports.Achievement = mongoose.model( 'Achievement', exports.AchievementSchema )