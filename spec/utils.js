var md5 = require( 'MD5' );

exports.debug = true;

exports.levelUpUrl = process.env[ 'LEVELUP_URL' ] != null ? process.env[ 'LEVELUP_URL' ] : 'http://localhost:8000';

exports.authString = function( data )
{
    return 'Basic ' + new Buffer( data.email + ':' + data.password ).toString( 'base64' );
}

exports.getContextData = function( contextName )
{
    return {
        name: contextName,
        description: 'This is the ' + contextName + ' context.',
        image: 'http://' + contextName + '.com/image.png',
        url: 'http://' + contextName + '.com'
    };
}

exports.getAchievementClassData = function( achievementClassName, context )
{
    return {
        contextId: context._id,
        name: achievementClassName,
        description: 'This is the ' + achievementClassName + 'achievement.',
        image: 'http://blah.com/' + achievementClassName + '.png',
        points: 10
    };
}

exports.getUserData = function( userName )
{
    return {
        'email': userName + '@test.com',
        'password': userName + 'pass',
        'nickname': userName + 'nick',
        'bio': 'Bio for user: ' + userName,
        'location': userName + ', USA'
    }
}

exports.userHash = function( userData )
{
    return md5( userData.email );
}