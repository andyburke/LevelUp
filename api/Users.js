var models = require( './models.js' );
var checks = require( './checks.js' );

var sha1 = require( 'sha1' );
var md5 = require( 'MD5' );

var censoredFields = {
    'email': true,
    'passwordHash': true,
    'apiSecret': true
};

exports.bindToApp = function( app ) {
    app.post( '/User', function( request, response ) {

        if ( !request.param( 'email') || !request.param( 'password' ) )
        {
            response.json( 'You must specify an email and password to sign up!', 400 );
            return;
        }

        models.User.findOne( { 'email': request.param( 'email' ).toLowerCase() }, function( error, user ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( user )
            {
                response.json( 'A user with email already exists.', 403 );
                return;
            }
            
            var newUser = new models.User();
            newUser.email = request.param( 'email' ).toLowerCase();
            newUser.hash = md5( newUser.email );
            newUser.passwordHash = sha1( request.param( 'password' ) );
            newUser.nickname = request.param( 'nickname' ) ? request.param( 'nickname' ) : '';
            newUser.bio = request.param( 'bio' ) ? request.param( 'bio' ) : '';
            newUser.location = request.param( 'location' ) ? request.param( 'location' ) : '';
            newUser.updateApiSecret();
            
            newUser.save( function( saveError ) {
                if ( saveError )
                {
                    response.json( saveError, 500 );
                    return;
                }
        
                request.session.user = newUser;
                request.session.save();
                
                response.json( newUser.censored( { 'passwordHash': true } ) );
            });
        });
    });
    
    app.put( '/User', checks.user, function( request, response ) {

        function save()
        {
            models.User.findById( request.session.user._id, function( error, user ) {
                user.email = request.param( 'email' ) != undefined ? request.param( 'email' ).toLowerCase() : user.email;
                
                if ( !user.email || user.email.length == 0 )
                {
                    response.json( 'You must specify a valid email addres.', 400 );
                    return;
                }
                
                user.hash = md5( user.email );        
                user.passwordHash = request.param( 'password' ) != undefined ? sha1( request.param( 'password' ) ) : user.passwordHash;
                user.nickname = request.param( 'nickname' ) != undefined ? request.param( 'nickname' ) : user.nickname;
                user.bio = request.param( 'bio' ) != undefined ? request.param( 'bio' ) : user.bio;
                user.location = request.param( 'location' ) != undefined ? request.param( 'location' ) : user.location;

                if ( request.param( 'email' ) != undefined || request.param( 'password' ) != undefined )
                {
                    user.updateApiSecret();
                }

                user.save( function( saveError ) {
                    if ( saveError )
                    {
                        response.json( saveError, 500 );
                        return;
                    }
                    
                    // if they changed their email, we need to shift all their old achievements
                    if ( request.session.user.hash != user.hash )
                    {
                        models.Achievement.update( { 'userHash': request.session.user.hash }, { 'userHash': user.hash }, { multi: true }, function( updateError, result ) {
                            if ( updateError )
                            {
                                // TODO: rollback?
                                // see note below for why we don't send an error back
                                return;
                            }
                            
                            // we don't return anything here, since it will return the user in the main code path as soon as it's saved
                            // it doesn't matter if all the achievements have been migrated by the time we send back the updated user
                        });
                    }
                    
                    request.session.user = user;
                    request.session.save();
                    
                    response.json( user.censored( { 'passwordHash': true } ) );
                });
            });
        }
        
        if ( request.param( 'email' ) )
        {
            models.User.findOne( { 'email': request.param( 'email').toLowerCase() }, function( existingUserError, existingUser ) {
                if ( existingUserError )
                {
                    response.json( existingUserError, 500 );
                    return;
                }
                
                if ( existingUser )
                {
                    response.json( 'A user already exists with that email.', 409 );
                    return;
                }
                
                save();
            });
        }
        else
        {
            save();
        }
    });
    
    app.get( '/User', checks.user, function( request, response ) {
        // the request.session.user is just a bare hash, no longer a mongoose model, so we need to use
        // models.censor vs. the member function
        response.json( models.censor( request.session.user, { 'passwordHash': true } ) );
    });
    
    app.post( '/Users', function( request, response ) {
        var hashList = request.param( 'users' );
        
        models.User.find( { 'hash': { $in: hashList } }, function( error, users ) {
            if ( error )
            {
                response.json( error, 500 );
                keepGoing = false;
                return;
            }
            
            var result = [];
            for ( var index = 0; index < users.length; ++index )
            {
                result.push( users[ index ].censored( { 'email': true, 'passwordHash': true, 'apiSecret': true } ) );
            }
            
            response.json( result );
        });
    });
    
    app.get( '/User/:hash', function( request, response ) {
        models.User.findOne( { 'hash': request.params.hash }, function( error, user ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !user )
            {
                response.json( 'No user found for the hash: ' + request.params.hash, 404 );
                return;
            }
            
            response.json( user.censored( { 'email': true, 'passwordHash': true, 'apiSecret': true } ) );
        });
    });
    
    app.del( '/User/:userId', checks.user, function( request, response ) {
        if ( request.session.user._id != request.params.userId )
        {
            response.json( 'Unauthorized', 401 );
            return;
        }
        
        models.User.findById( request.params.userId, function( error, user ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }

            if ( !user )
            {
                // this isn't a 404, since they have a user session.  This case
                // indicates some internal system error.
                response.json( 'Could not locate the existing user.', 500 );
                return;
            }
            
            user.remove( function( removeError ) {
                if ( removeError )
                {
                    response.json( removeError, 500 );
                    return;
                }
                
                request.session.destroy( function() {
                    response.json( { 'removed': true } );
                });
            });
        });
    });
}