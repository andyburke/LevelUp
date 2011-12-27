var models = require( './models.js' );
var checks = require( './checks.js' );

exports.bindToApp = function( app ) {
    
    app.post( '/Context/:contextId/Achievement', checks.ownsContext, function( request, response ) {
        var newAchievement = new models.Achievement();
        newAchievement.contextId = request.context._id;
        newAchievement.userHash = request.param( 'userHash' );
        newAchievement.classId = request.param( 'classId' );
        
        function save()
        {
            models.Achievement.findOne( { 'userHash': newAchievement.userHash, 'classId': newAchievement.classId }, function( error, achievement ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                if ( achievement )
                {
                    response.json( achievement );
                    return;
                }
                
                newAchievement.save( function( saveError ) {
                    if ( saveError )
                    {
                        response.json( saveError, 500 );
                        return;
                    }
                    
                    response.json( newAchievement );
                });
            });
        }
        
        if ( newAchievement.classId )
        {
            save();
        }
        else
        {
            var achievementClassName = request.param( 'class' );
            
            if ( !achievementClassName )
            {
                response.json( 'You must specify a classId or achievement class name when creating an achievement.', 400 );
                return;
            }
            
            models.AchievementClass.findOne( { 'contextId': request.context._id, 'name': achievementClassName }, function( error, achievementClass ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                if ( !achievementClass )
                {
                    response.json( 'Could not find an achievement class named: ' + achievementClassName, 400 );
                    return;
                }
                
                newAchievement.classId = achievementClass._id;
                save();
            });
        }
    });
    
    app.del( '/Context/:contextId/Achievement/:achievementId', checks.ownsContext, function( request, response ) {
        models.Achievement.findById( request.params.achievementId, function( error, achievement ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !achievement )
            {
                response.json( 'Could not locate an achievement with id: ' + request.params.achievementId, 404 );
                return;
            }
            
            if ( !achievement.contextId.equals( request.context._id ) )
            {
                response.json( 'You do not own this achievement.', 403 );
                return;
            }
            
            achievement.remove( function( removeError ) {
                if ( removeError )
                {
                    response.json( removeError, 500 );
                    return;
                }
                
                response.json( { 'removed': true } );
            });
        });
    });
    
    app.get( '/User/:userHash/Achievements/:contextId?', function( request, response ) {
        var criteria = { 'userHash': request.params.userHash };
        
        if ( request.params.contextId )
        {
            criteria.contextId = request.params.contextId;
        }
        
        models.Achievement.find( criteria, function( error, achievements ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( achievements );
        });
    });
    
    app.get( '/User/:userHash/AchievementStream/:contextId?', function( request, response ) {
        var criteria = { 'userHash': request.params.userHash };
        if ( request.params.contextId )
        {
            criteria.contextId = request.params.contextId;
        }
        
        var stream = models.Achievement.find( criteria ).stream();

        stream.on( 'data', function ( achievement ) {
            if ( stream.readable )
            {
                response.write( JSON.stringify( achievement ) + "\r" );
            }
        });
        
        stream.on( 'error', function ( streamError ) {
            response.json( streamError, 500 );
        });
        
        stream.on('close', function () {
            response.end();
        });
    });
}