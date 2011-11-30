var mongoose = require( 'mongoose' );
var MongooseTypes = require( 'mongoose-types' );
MongooseTypes.loadTypes( mongoose );
var UseTimestamps = MongooseTypes.useTimestamps;
var Email = mongoose.SchemaTypes.Email;

exports.APIConsumerSchema = new mongoose.Schema({
    email: { type: Email, index: true },
    passwordHash: { type: String },
    apiSecret: { type: String },
    name: { type: String },
    description: { type: String },
    url: { type: String }
});
exports.APIConsumerSchema.plugin( UseTimestamps );
exports.APIConsumer = mongoose.model( 'APIConsumer', exports.APIConsumerSchema );

exports.ContextSchema = new mongoose.Schema({
    apiConsumerId: { type: mongoose.Schema.ObjectId, index: true },
    name: { type: String },
    description: { type: String },
    image: { type: String },
    url: { type: String }
});
exports.ContextSchema.plugin( UseTimestamps );
exports.Context = mongoose.model( 'Context', exports.ContextSchema );

exports.EntitySchema = new mongoose.Schema({
    idHash: { type: String, index: true },
    score: { type: Number, default: 0 }
});
exports.EntitySchema.plugin( UseTimestamps );
exports.Entity = mongoose.model( 'Entity', exports.EntitySchema );

exports.XPEventSchema = new mongoose.Schema({
    apiConsumerId: { type: mongoose.Schema.ObjectId, index: true },
    contextId: { type: mongoose.Schema.ObjectId, index: true },
    entityId: { type: mongoose.Schema.ObjectId, index: true },
    eventType: { type: String },
    extra: { type: String },
    xpDelta: { type: Number }
});
exports.XPEventSchema.plugin( UseTimestamps );
exports.XPEvent = mongoose.model( 'XPEvent', exports.XPEventSchema );

exports.AchievementSchema = new mongoose.Schema({
    apiConsumerId: { type: mongoose.Schema.ObjectId, index: true },
    contextId: { type: mongoose.Schema.ObjectId, index: true },
    name: { type: String },
    description: { type: String },
    image: { type: String },
    points: { type: Number, default: 0 }
});
exports.AchievementSchema.plugin( UseTimestamps );
exports.Achievement = mongoose.model( 'Achievement', exports.AchievementSchema );

exports.AchievementEventSchema = new mongoose.Schema({
    apiConsumerId: { type: mongoose.Schema.ObjectId, index: true },
    contextId: { type: mongoose.Schema.ObjectId, index: true },
    entityId: { type: mongoose.Schema.ObjectId, index: true },
    achievementId: { type: mongoose.Schema.ObjectId }
});
exports.AchievementEventSchema.plugin( UseTimestamps );
exports.AchievementEvent = mongoose.model( 'AchievementEvent', exports.AchievementEventSchema )