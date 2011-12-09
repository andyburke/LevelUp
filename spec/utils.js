var md5 = require( 'MD5' );

exports.debug = true;

exports.levelUpUrl = process.env[ 'LEVELUP_URL' ] != null ? process.env[ 'LEVELUP_URL' ] : 'http://localhost:8000';

exports.authString = function( organizationData )
{
    return 'Basic ' + new Buffer( organizationData.email + ':' + organizationData.password ).toString( 'base64' );
}

exports.getOrganizationData = function( organizationName )
{
    return {
        email: 'test@' + organizationName + '.com',
        password: 'testing-' + organizationName,
        name: organizationName,
        description: 'This is the ' + organizationName + ' organization!',
        url: 'http://' + organizationName + '.com'
    };
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

exports.personHash = function()
{
    return md5( 'test@test.com' );
}