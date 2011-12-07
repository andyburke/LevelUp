var Shred = require( 'shred' );
var shred = new Shred();

var levelUpUrl = process.env[ 'LEVELUP_URL' ] != null ? process.env[ 'LEVELUP_URL' ] : 'http://localhost:8000';

describe( 'LevelUp', function() {
    var organization = null;
    var organizationData = {
        email: 'test@test.com',
        password: 'testing',
        name: 'Test Organization',
        description: 'This is a test organization!',
        url: 'http://test.com'
    };

    it( 'should Create Organization', function () {
        var error = null;
        
        shred.post({
          url: levelUpUrl + '/Organization',
          headers: {
            content_type: 'application/json',
            accept: 'application/json'
          },
          content: {
            email: organizationData.email,
            password: organizationData.password,
            name: organizationData.name,
            description: organizationData.description,
            url: organizationData.url
          },
          on: {
            response: function( response ) {
                organization = response.content.data;
            },
            error: function( response ) {
                error = response.content.data;
            }
          }
        });
        
        waitsFor( function() {
            return error || organization;
        }, "Create Organization timed out", 10000 );
        
        runs( function () {
            console.log( JSON.stringify( organization ) );
            expect( organization ).not.toBeNull();
            expect( organization.email ).toEqual( organizationData.email );
            expect( organization.name ).toEqual( organizationData.name );
            expect( organization.description ).toEqual( organizationData.description );
            expect( organization.url ).toEqual( organizationData.url );
            expect( organization._id ).not.toBeUndefined();
            expect( organization.updatedAt ).not.toBeUndefined();
        });
    });

    it( 'should Delete Organization', function () {
        var result = null;        
        var error = null;
        
        shred.delete({
          url: levelUpUrl + '/Organization/' + organization._id,
          headers: {
            accept: 'application/json',
            authorization: 'Basic ' + new Buffer( organizationData.email + ':' + organizationData.password ).toString( 'base64' )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                error = response.content.body;
                console.log( error );
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Delete Organization timed out", 10000 );
        
        runs( function () {
            expect( result ).not.toBeNull();
        });
    });

});
