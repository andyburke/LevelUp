var Shred = require( 'shred' );
var shred = new Shred();

var debug = true;

var levelUpUrl = process.env[ 'LEVELUP_URL' ] != null ? process.env[ 'LEVELUP_URL' ] : 'http://localhost:8000';

function authString( organizationData )
{
    return 'Basic ' + new Buffer( organizationData.email + ':' + organizationData.password ).toString( 'base64' );
}

describe( 'LevelUp', function() {
    var organization = null;
    var organizationData = {
        email: 'test@test.com',
        password: 'testing',
        name: 'Test Organization',
        description: 'This is a test organization!',
        url: 'http://test.com'
    };
    
    var updatedOrganizationData = {
        email: 'test-updated@test.com',
        password: 'testing-updated',
        name: 'Test Organization-updated',
        description: 'This is a test organization!-updated',
        url: 'http://test.com-updated'
    };

    it( 'should Create Organization', function () {
        var error = false;
        
        shred.post({
          url: levelUpUrl + '/Organization',
          headers: {
            content_type: 'application/json',
            accept: 'application/json'
          },
          content: organizationData,
          on: {
            response: function( response ) {
                organization = response.content.data;
            },
            error: function( response ) {
                if ( debug )
                {
                    console.log( "\nError creating Organization:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || organization;
        }, "Create Organization timed out", 10000 );
        
        runs( function () {
            if ( debug )
            {
                console.log( "\nCreated organization:\n" );
                console.log( JSON.stringify( organization, null, 4 ) );
                console.log( "\n" );
            }

            expect( organization ).not.toBeNull();
            expect( organization.email ).toEqual( organizationData.email );
            expect( organization.passwordHash ).not.toBeUndefined();
            expect( organization.name ).toEqual( organizationData.name );
            expect( organization.description ).toEqual( organizationData.description );
            expect( organization.url ).toEqual( organizationData.url );
            expect( organization.apiSecret ).not.toBeUndefined();
            expect( organization._id ).not.toBeUndefined();
            expect( organization.updatedAt ).not.toBeUndefined();
        });
    });

    it( 'should Get uncensored Organization', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: levelUpUrl + '/Organization',
          headers: {
            accept: 'application/json',
            authorization: authString( organizationData )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( debug )
                {
                    console.log( "\nError getting uncensored Organization:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Get uncensored Organization timed out", 10000 );
        
        runs( function () {
            if ( debug )
            {
                console.log( "\nGot uncensored organization:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.email ).toEqual( organizationData.email );
            expect( result.passwordHash ).not.toBeUndefined();
            expect( result.name ).toEqual( organizationData.name );
            expect( result.description ).toEqual( organizationData.description );
            expect( result.url ).toEqual( organizationData.url );
            expect( result.apiSecret ).not.toBeUndefined();
            expect( result._id ).not.toBeUndefined();
            expect( result.updatedAt ).not.toBeUndefined();
        });
    });

    it( 'should Get censored Organization', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: levelUpUrl + '/Organization/' + organization._id,
          headers: {
            accept: 'application/json'
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( debug )
                {
                    console.log( "\nError getting censored Organization:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Get censored Organization timed out", 10000 );
        
        runs( function () {
            if ( debug )
            {
                console.log( "\nGot censored organization:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.email ).toBeUndefined();
            expect( result.passwordHash ).toBeUndefined();
            expect( result.apiSecret ).toBeUndefined();
            expect( result.name ).toEqual( organization.name );
            expect( result.description ).toEqual( organization.description );
            expect( result.url ).toEqual( organization.url );
            expect( result._id ).toEqual( organization._id );
            expect( result.updatedAt ).toEqual( organization.updatedAt );
        });
    });    

    it( 'should Update Organization', function () {
        var error = false;
        var updatedOrganization = null;
        
        shred.put({
          url: levelUpUrl + '/Organization',
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: authString( organizationData )
          },
          content: updatedOrganizationData,
          on: {
            response: function( response ) {
                updatedOrganization = response.content.data;
            },
            error: function( response ) {
                if ( debug )
                {
                    console.log( "\nError updating Organization:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || updatedOrganization;
        }, "Update Organization timed out", 10000 );
        
        runs( function () {
            if ( debug )
            {
                console.log( "\nGot updated organization:\n" );
                console.log( JSON.stringify( updatedOrganization, null, 4 ) );
                console.log( "\n" );
            }

            expect( updatedOrganization ).not.toBeNull();
            expect( updatedOrganization.email ).toEqual( updatedOrganizationData.email );
            expect( updatedOrganization.passwordHash ).not.toBeUndefined();
            expect( updatedOrganization.name ).toEqual( updatedOrganizationData.name );
            expect( updatedOrganization.description ).toEqual( updatedOrganizationData.description );
            expect( updatedOrganization.url ).toEqual( updatedOrganizationData.url );
            expect( updatedOrganization.apiSecret ).not.toBeUndefined();
            expect( updatedOrganization._id ).not.toBeUndefined();
            expect( updatedOrganization.updatedAt ).not.toBeUndefined();
            
            expect( updatedOrganization.email ).not.toEqual( organization.email );
            expect( updatedOrganization.passwordHash ).not.toEqual( organization.passwordHash );
            expect( updatedOrganization.name ).not.toEqual( organization.name );
            expect( updatedOrganization.description ).not.toEqual( organization.description );
            expect( updatedOrganization.url ).not.toEqual( organization.url );
            expect( updatedOrganization.apiSecret ).not.toEqual( organization.apiSecret );
            expect( updatedOrganization._id ).toEqual( organization._id ); // ensure id did not change
            expect( updatedOrganization.updatedAt ).not.toEqual( organization.updatedAt );
            
            organization = updatedOrganization;
        });
    });
    
    it( 'should Delete Organization', function () {
        var result = null;        
        var error = false;
        
        shred.delete({
          url: levelUpUrl + '/Organization/' + organization._id,
          headers: {
            accept: 'application/json',
            authorization: authString( updatedOrganizationData )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( debug )
                {
                    console.log( "\nError deleting Organization:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Delete Organization timed out", 10000 );
        
        runs( function () {
            if ( debug )
            {
                console.log( "\nGot delete Organization result:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }
            
            expect( result ).not.toBeNull();
        });
    });

});
