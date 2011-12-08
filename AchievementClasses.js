var models = require( './models.js' );
var checks = require( './checks.js' );

exports.bindToApp = function( app ) {
    app.post( '/AchievementClass', checks.organizationAuth, function( request, response ) {
        models.Context.findById( request.param( 'contextId' ), function( error, context ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !context )
            {
                response.json( 'Could not locate a context with id: ' + request.param( 'contextId' ), 404 );
                return;
            }
            
            if ( !context.organizationId.equals( request.organization._id ) )
            {
                response.json( 'Your organization does not own this context.', 403 );
                return;
            }
            
            var newAchievementClass = new models.AchievementClass();
            newAchievementClass.organizationId = request.organization._id;
            newAchievementClass.contextId = context._id;
            newAchievementClass.name = request.param( 'name' );
            newAchievementClass.description = request.param( 'description' );
            newAchievementClass.image = request.param( 'image' );
            newAchievementClass.points = request.param( 'points' ) != null ? request.param( 'points' ) : 0;
        
            newAchievementClass.save( function( saveError ) {
                if ( saveError )
                {
                    response.json( saveError, 500 );
                    return;
                }
        
                response.json( newAchievementClass );
            });
        });
    });
    
    app.put( '/AchievementClass/:achievementClassId', checks.organizationAuth, checks.ownsAchievementClass, function( request, response ) {
        request.achievementClass.name = request.param( 'name' ) ? request.param( 'name' ) : request.achievementClass.name;
        request.achievementClass.description = request.param( 'description' ) ? request.param( 'description' ) : request.achievementClass.description;
        request.achievementClass.image = request.param( 'image' ) ? request.param( 'image' ) : request.achievementClass.image;
        request.achievementClass.points = request.param( 'points' ) != null ? request.param( 'points' ) : request.achievementClass.points;
    
        request.achievementClass.save( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( request.achievementClass );
        });
    });
    
    app.get( '/AchievementClass/:achievementClassId', function( request, response ) {
        models.AchievementClass.findById( request.params.achievementClassId, function( error, achievementClass ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !achievementClass )
            {
                response.json( 'No achievement class with id: ' + request.params.achievementClassId, 404 );
                return;
            }
            
            response.json( achievementClass );        
        });
    });
    
    app.del( '/AchievementClass/:achievementClassId', checks.organizationAuth, checks.ownsAchievementClass, function( request, response ) {
        request.achievementClass.remove( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( { 'removed': true } );
        });
    });
    
    app.get( '/AchievementClasses/:contextId', function( request, response ) {
        models.AchievementClass.find( { 'contextId': request.params.contextId }, function( error, achievementClasses ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( achievementClasses );
        });
    });
}
