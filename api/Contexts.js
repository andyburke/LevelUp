var models = require( './models.js' );
var checks = require( './checks.js' );

var fs = require( 'fs' );
var path = require( 'path' );

exports.bindToApp = function( app ) {
    app.post( '/api/1.0/Context', checks.user, function( request, response ) {
        
        var newContext = new models.Context();
        newContext.owners = [ request.session.user.hash ];
        newContext.name = request.param( 'name' );
        newContext.description = request.param( 'description' );
        newContext.image = request.param( 'image' );
        newContext.url = request.param( 'url' );
        newContext.resetAPIKey();
    
        newContext.save( function( error ) {
            if ( error )
            {
                response.json( error.message ? error.message : error, 500 );
                return;
            }
    
            response.json( newContext );
        });
    });
    
    app.put( '/api/1.0/Context/:contextId', checks.user, checks.contextPermission, function( request, response ) {
        request.context.name = request.param( 'name' ) != undefined ? request.param( 'name' ) : request.context.name;
        request.context.description = request.param( 'description' ) != undefined ? request.param( 'description' ) : request.context.description;
        request.context.image = request.param( 'image' ) != undefined ? request.param( 'image' ) : request.context.image;
        request.context.url = request.param( 'url' ) != undefined ? request.param( 'url' ) : request.context.url;
        request.context.owners = request.param( 'owners' ) ? request.param( 'owners' ) : request.context.owners;
        
        request.context.save( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( request.context );
        });
    });
    
    app.get( '/api/1.0/Context/:contextId', function( request, response ) {
        models.Context.findById( request.params.contextId, function( error, context ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !context )
            {
                response.json( 'No context for for context id: ' + request.params.contextId, 404 );
                return;
            }
            
            var censoredFields = {};
            if ( !request.session.user || context.owners.indexOf( request.session.user.hash ) == -1 )
            {
                censoredFields[ 'apiKey' ] = true;
                censoredFields[ 'owners' ] = true;
            }
            
            response.json( models.censor( context, censoredFields ) );
        });
    });
    
    app.del( '/api/1.0/Context/:contextId', checks.contextPermission, function( request, response ) {
        request.context.remove( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( { 'removed': true } );
        });
    });
    
    app.post( '/api/1.0/Context/:contextId/ResetAPIKey', checks.contextPermission, function( request, response ) {
        request.context.resetAPIKey();
        request.context.save( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( request.context );
        });
    });
    
    app.post( '/api/1.0/Context/:contextId/Image', checks.contextPermission, function( request, response ) {
        if ( !request.files.contextImage )
        {
            response.json( 'You must upload one file (no more, no less) to this url with a part id of "contextImage".', 400 );
            return;
        }
        
        var file = request.files.contextImage;
        var extension = path.extname( file.name ).toLowerCase();
        fs.mkdir( 'site/images/contexts', 755, function( error ) {
            if ( error && error.code != 'EEXIST' )
            {
                response.json( error, 500 );
                return;
            }
            
            var target = 'site/images/contexts/' + request.params.contextId + extension;
            fs.rename( file.path, target, function( renameError ) {
                if ( renameError )
                {
                    response.json( renameError, 500 );
                    return;
                }
                
                request.context.image = '/images/contexts/' + request.params.contextId + extension;
                request.context.save( function( saveError ) {
                    if ( saveError )
                    {
                        response.json( saveError, 500 );
                        return;
                    }
                    
                    response.json( request.context );
                });                
            });
        });
    });

    app.del( '/api/1.0/Context/:contextId/Image', checks.contextPermission, function( request, response ) {
        // TODO: delete file from disk
        // TODO: unset context image url
        response.json( 'Not implemented.', 500 );
    });
    
    app.get( '/api/1.0/Contexts', checks.user, function( request, response ) {
        models.Context.find( { 'owners': request.session.user.hash }, function( error, contexts ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( contexts );
        });
    });
    
    app.post( '/api/1.0/Context/:contextId/Owners/:ownerHash', checks.contextPermission, function( request, response ) {
        request.context.owners.push( request.params.ownerHash );
        request.context.save( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( request.context );
        });
    });
    
    app.del( '/api/1.0/Context/:contextId/Owners/:ownerHash', checks.contextPermission, function( request, response ) {
        if ( request.context.owners.indexOf( request.params.ownerHash ) != -1 )
        {
            request.context.owners.splice( request.context.owners.indexOf( request.params.ownerHash ), 1 );
            if ( request.context.owners.length == 0 )
            {
                response.json( 'Cannot remove last owner.', 403 );
                return;
            }

            request.context.save( function( error ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                response.json( request.context );
            });
        }
        else
        {
            response.json( request.context );
        }
    });
}
