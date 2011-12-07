var models = require( './models.js' );
var checks = require( './checks.js' );

exports.bindToApp = function( app ) {
    
    app.get( '/AchievementStream/:personIdHash/:contextId?', function( request, response ) {
        models.Person.findOne( { 'idHash': request.params.personIdHash }, function( error, person ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !person )
            {
                // Should we send an error instead?
                response.json( [] );
                return;
            }
    
            var criteria = { 'personId': person._id };
            if ( request.params.contextId )
            {
                criteria.contextId = request.params.contextId;
            }
            
            var stream = models.Achievement.find( criteria ).stream();
    
            stream.on( 'data', function ( achievement ) {
                if ( stream.readable )
                {
                    response.write( JSON.stringify( achievement ) );
                }
            });
            
            stream.on( 'error', function ( streamError ) {
                response.json( streamError, 500 );
            });
            
            stream.on('close', function () {
                response.end();
            });
        });
    });
}