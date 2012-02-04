var models = require( './models.js' );
var checks = require( './checks.js' );

var fs = require( 'fs' );
var path = require( 'path' );

exports.bindToApp = function( app ) {
    app.post( '/Context/:contextId/AchievementClass', checks.user, checks.ownsContext, function( request, response ) {
        var newAchievementClass = new models.AchievementClass();
        newAchievementClass.contextId = request.context._id;
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
    
    app.put( '/Context/:contextId/AchievementClass/:achievementClassId', checks.user, checks.ownsContext, checks.ownsAchievementClass, function( request, response ) {
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
    
    app.get( '/Context/:contextId/AchievementClass/:achievementClassId', function( request, response ) {
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
    
    app.del( '/Context/:contextId/AchievementClass/:achievementClassId', checks.user, checks.ownsContext, checks.ownsAchievementClass, function( request, response ) {
        request.achievementClass.remove( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( { 'removed': true } );
        });
    });

    app.post( '/Context/:contextId/AchievementClass/:achievementClassId/Image', checks.user, checks.ownsContext, checks.ownsAchievementClass, function( request, response ) {
        if ( !request.files.achievementClassImage )
        {
            response.json( 'You must upload one file (no more, no less) to this url with a part id of "achievementClassImage".', 400 );
            return;
        }
        
        var file = request.files.achievementClassImage;
        var extension = path.extname( file.name ).toLowerCase();
        fs.mkdir( 'site/images/contexts', 755, function( contextsDirError ) {
            if ( contextsDirError && contextsDirError.code != 'EEXIST' )
            {
                response.json( contextsDirError, 500 );
                return;
            }
            
            fs.mkdir( 'site/images/contexts/' + request.params.contextId + '/', 755, function( contextDirError ) {
                if ( contextDirError && contextDirError.code != 'EEXIST' )
                {
                    response.json( contextDirError, 500 );
                    return;
                }
                
                var target = 'site/images/contexts/' + request.params.contextId + '/' + request.params.achievementClassId + extension;
                fs.rename( file.path, target, function( renameError ) {
                    if ( renameError )
                    {
                        response.json( renameError, 500 );
                        return;
                    }
                    
                    request.achievementClass.image = '/images/contexts/' + request.params.contextId + '/' + request.params.achievementClassId + extension;
                    request.achievementClass.save( function( saveError ) {
                        if ( saveError )
                        {
                            response.json( saveError, 500 );
                            return;
                        }
                        
                        response.json( request.achievementClass );
                    });                
                });
            });
        });
    });

    app.del( '/Context/:contextId/AchievementClass/:achievementClassId/Image', checks.user, checks.ownsContext, function( request, response ) {
        // TODO: delete file from disk
        // TODO: unset image url
        response.json( 'Not implemented.', 500 );
    });
    
    app.get( '/Context/:contextId/AchievementClasses', function( request, response ) {
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
