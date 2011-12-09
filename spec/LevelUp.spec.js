var Shred = require( 'shred' );
var shred = new Shred();

var utils = require( './utils.js' );

var organization = null;
var testOrganizationData = utils.getOrganizationData( 'test' );
var updatedOrganizationData = utils.getOrganizationData( 'updated' );

describe( 'Organizations', function() {

    it( 'should Create Organization', function () {
        var error = false;
        
        shred.post({
          url: utils.levelUpUrl + '/Organization',
          headers: {
            content_type: 'application/json',
            accept: 'application/json'
          },
          content: testOrganizationData,
          on: {
            response: function( response ) {
                organization = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
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
            if ( utils.debug )
            {
                console.log( "\nCreated organization:\n" );
                console.log( JSON.stringify( organization, null, 4 ) );
                console.log( "\n" );
            }

            expect( organization ).not.toBeNull();
            expect( organization.email ).toEqual( testOrganizationData.email );
            expect( organization.passwordHash ).not.toBeUndefined();
            expect( organization.name ).toEqual( testOrganizationData.name );
            expect( organization.description ).toEqual( testOrganizationData.description );
            expect( organization.url ).toEqual( testOrganizationData.url );
            expect( organization.apiSecret ).not.toBeUndefined();
            expect( organization._id ).not.toBeUndefined();
            expect( organization.updatedAt ).not.toBeUndefined();
        });
    });

    it( 'should Get uncensored Organization', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: utils.levelUpUrl + '/Organization',
          headers: {
            accept: 'application/json',
            authorization: utils.authString( testOrganizationData )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
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
            if ( utils.debug )
            {
                console.log( "\nGot uncensored organization:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.email ).toEqual( testOrganizationData.email );
            expect( result.passwordHash ).not.toBeUndefined();
            expect( result.name ).toEqual( testOrganizationData.name );
            expect( result.description ).toEqual( testOrganizationData.description );
            expect( result.url ).toEqual( testOrganizationData.url );
            expect( result.apiSecret ).not.toBeUndefined();
            expect( result._id ).not.toBeUndefined();
            expect( result.updatedAt ).not.toBeUndefined();
        });
    });

    it( 'should Get censored Organization', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: utils.levelUpUrl + '/Organization/' + organization._id,
          headers: {
            accept: 'application/json'
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
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
            if ( utils.debug )
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
          url: utils.levelUpUrl + '/Organization',
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( testOrganizationData )
          },
          content: updatedOrganizationData,
          on: {
            response: function( response ) {
                updatedOrganization = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
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
            if ( utils.debug )
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
});

var context = null;

describe( 'Contexts', function() {
    
    var contextData = utils.getContextData( 'testcontext' );
    var updatedContextData = utils.getContextData( 'updatedcontext' );    

    it( 'should Create Context', function () {
        var error = false;
        
        shred.post({
          url: utils.levelUpUrl + '/Context',
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( updatedOrganizationData )
          },
          content: contextData,
          on: {
            response: function( response ) {
                context = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError creating Context:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || context;
        }, "Create Context timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nCreated Context:\n" );
                console.log( JSON.stringify( context, null, 4 ) );
                console.log( "\n" );
            }

            expect( context ).not.toBeNull();
            expect( context.name ).toEqual( contextData.name );
            expect( context.description ).toEqual( contextData.description );
            expect( context.url ).toEqual( contextData.url );
            expect( context.image ).toEqual( contextData.image );
            expect( context._id ).not.toBeUndefined();
            expect( context.updatedAt ).not.toBeUndefined();
        });
    });    
    
    it( 'should Get Context', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: utils.levelUpUrl + '/Context/' + context._id,
          headers: {
            accept: 'application/json'
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError getting Context:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Get Context timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot Context:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.name ).toEqual( contextData.name );
            expect( result.description ).toEqual( contextData.description );
            expect( result.url ).toEqual( contextData.url );
            expect( result.image ).toEqual( contextData.image );
            expect( result._id ).not.toBeUndefined();
            expect( result.updatedAt ).not.toBeUndefined();
        });
    });

   it( 'should Update Context', function () {
        var error = false;
        var updatedContext = null;
        
        shred.put({
          url: utils.levelUpUrl + '/Context/' + context._id,
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( updatedOrganizationData )
          },
          content: updatedContextData,
          on: {
            response: function( response ) {
                updatedContext = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError updating Context:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || updatedContext;
        }, "Update Organization timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot updated context:\n" );
                console.log( JSON.stringify( updatedContext, null, 4 ) );
                console.log( "\n" );
            }

            expect( updatedContext ).not.toBeNull();
            expect( updatedContext.name ).toEqual( updatedContextData.name );
            expect( updatedContext.description ).toEqual( updatedContextData.description );
            expect( updatedContext.url ).toEqual( updatedContextData.url );
            expect( updatedContext.image ).toEqual( updatedContextData.image );
            expect( updatedContext._id ).not.toBeUndefined();
            expect( updatedContext.updatedAt ).not.toBeUndefined();
            
            expect( updatedContext.name ).not.toEqual( context.name );
            expect( updatedContext.description ).not.toEqual( context.description );
            expect( updatedContext.url ).not.toEqual( context.url );
            expect( updatedContext.image ).not.toEqual( context.image );
            expect( updatedContext._id ).toEqual( context._id ); // ensure id did not change
            expect( updatedContext.updatedAt ).not.toEqual( context.updatedAt );
            
            context = updatedContext;
        });
    });

    it( 'should Get Context list', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: utils.levelUpUrl + '/Contexts/' + organization._id,
          headers: {
            accept: 'application/json'
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError getting Context list:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Get Context list timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot Context list:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.length ).toEqual( 1 );
            
            expect( result[ 0 ].name ).toEqual( context.name );
            expect( result[ 0 ].description ).toEqual( context.description );
            expect( result[ 0 ].url ).toEqual( context.url );
            expect( result[ 0 ].image ).toEqual( context.image );
            expect( result[ 0 ]._id ).toEqual( context._id );
            expect( result[ 0 ].updatedAt ).toEqual( context.updatedAt );
        });
    });
});

var achievementClass = null;

describe( 'AchievementClasses', function() {

    var achievementClassData = null;
    var updatedAchievementClassData = null;
    
    waitsFor( function() {
        return context; 
    }, 'Context creation took too long.', 30000 );

    runs( function() {
        achievementClassData = utils.getAchievementClassData( 'test', context );
        updatedAchievementClassData = utils.getAchievementClassData( 'updated', context );
    });
    
    it( 'should Create AchievementClass', function () {
        var error = false;
        
        shred.post({
          url: utils.levelUpUrl + '/AchievementClass',
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( updatedOrganizationData )
          },
          content: achievementClassData,
          on: {
            response: function( response ) {
                achievementClass = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError creating AchievementClass:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || achievementClass;
        }, "Create AchievementClass timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nCreated AchievementClass:\n" );
                console.log( JSON.stringify( achievementClass, null, 4 ) );
                console.log( "\n" );
            }

            expect( achievementClass ).not.toBeNull();
            expect( achievementClass.name ).toEqual( achievementClassData.name );
            expect( achievementClass.description ).toEqual( achievementClassData.description );
            expect( achievementClass.image ).toEqual( achievementClassData.image );
            expect( achievementClass.points ).toEqual( achievementClassData.points );
            expect( achievementClass._id ).not.toBeUndefined();
            expect( achievementClass.organizationId ).not.toBeUndefined();
            expect( achievementClass.contextId ).toEqual( context._id );
            expect( achievementClass.updatedAt ).not.toBeUndefined();
        });
    });    
    
    it( 'should Get AchievementClass', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: utils.levelUpUrl + '/AchievementClass/' + achievementClass._id,
          headers: {
            accept: 'application/json'
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError getting AchievementClass:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Get AchievementClass timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot AchievementClass:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.name ).toEqual( achievementClass.name );
            expect( result.description ).toEqual( achievementClass.description );
            expect( result.image ).toEqual( achievementClass.image );
            expect( result.points ).toEqual( achievementClass.points );
            expect( result._id ).not.toBeUndefined();
            expect( result.organizationId ).toEqual( achievementClass.organizationId );
            expect( result.contextId ).toEqual( achievementClass.contextId );
            expect( result.updatedAt ).toEqual( achievementClass.updatedAt );
        });
    });

   it( 'should Update AchievementClass', function () {
        var error = false;
        var updatedAchievementClass = null;
        
        shred.put({
          url: utils.levelUpUrl + '/AchievementClass/' + achievementClass._id,
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( updatedOrganizationData )
          },
          content: updatedAchievementClassData,
          on: {
            response: function( response ) {
                updatedAchievementClass = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError updating AchievementClass:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || updatedAchievementClass;
        }, "Update AchievementClass timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot updated AchievementClass:\n" );
                console.log( JSON.stringify( updatedAchievementClass, null, 4 ) );
                console.log( "\n" );
            }

            expect( updatedAchievementClass ).not.toBeNull();
            expect( updatedAchievementClass.name ).toEqual( updatedAchievementClassData.name );
            expect( updatedAchievementClass.description ).toEqual( updatedAchievementClassData.description );
            expect( updatedAchievementClass.image ).toEqual( updatedAchievementClassData.image );
            expect( updatedAchievementClass.points ).toEqual( updatedAchievementClassData.points );
            expect( updatedAchievementClass._id ).not.toBeUndefined();
            expect( updatedAchievementClass.updatedAt ).not.toBeUndefined();
            
            expect( updatedAchievementClass.name ).not.toEqual( achievementClass.name );
            expect( updatedAchievementClass.description ).not.toEqual( achievementClass.description );
            expect( updatedAchievementClass.image ).not.toEqual( achievementClass.image );
            expect( updatedAchievementClass._id ).toEqual( achievementClass._id ); // ensure id did not change
            expect( updatedAchievementClass.updatedAt ).not.toEqual( achievementClass.updatedAt );
            
            achievementClass = updatedAchievementClass;
        });
    });

    it( 'should Get AcheivementClass list', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: utils.levelUpUrl + '/AchievementClasses/' + context._id,
          headers: {
            accept: 'application/json'
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError getting AchievementClass list:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Get AchievementClass list timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot AchievementClass list:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.length ).toEqual( 1 );
            
            expect( result[ 0 ].name ).toEqual( achievementClass.name );
            expect( result[ 0 ].description ).toEqual( achievementClass.description );
            expect( result[ 0 ].image ).toEqual( achievementClass.image );
            expect( result[ 0 ].points ).toEqual( achievementClass.points );
            expect( result[ 0 ]._id ).toEqual( achievementClass._id );
            expect( result[ 0 ].organizationId ).toEqual( achievementClass.organizationId );
            expect( result[ 0 ].contextId ).toEqual( achievementClass.contextId );
            expect( result[ 0 ].updatedAt ).toEqual( achievementClass.updatedAt );
        });
    });
});

var achievement = null;
var achievementByContextName = null;
var achievementByClassName = null;

describe( 'Achievements', function() {

    var deletedAchievement = false;
    var deletedAchievementByContextName = false;
    var deletedAchievementByClassName = false;

    waitsFor( function() {
        return achievementClass; 
    }, 'Achievement Class creation took too long.', 30000 );

    it( 'should Create Achievement', function () {
        var error = false;
        
        shred.post({
          url: utils.levelUpUrl + '/Achievement',
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( updatedOrganizationData )
          },
          content: {
            personHash: utils.personHash(),
            contextId: context._id,
            classId: achievementClass._id
          },
          on: {
            response: function( response ) {
                achievement = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError creating Achievement:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || achievement;
        }, "Create Achievement timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nCreated Achievement:\n" );
                console.log( JSON.stringify( achievement, null, 4 ) );
                console.log( "\n" );
            }

            expect( achievement ).not.toBeNull();
            expect( achievement._id ).not.toBeUndefined();
            expect( achievement.contextId ).toEqual( context._id );
            expect( achievement.organizationId ).toEqual( organization._id );
            expect( achievement.classId ).toEqual( achievementClass._id );
            expect( achievement.updatedAt ).not.toBeUndefined();
        });
    });        

    it( 'should Delete Achievement', function () {
        var error = false;
        var result = null;
        
        waitsFor( function() {
            return achievement; 
        }, 'Achievement creation took too long.', 30000 );

        runs( function() {
            shred.delete({
              url: utils.levelUpUrl + '/Achievement/' + achievement._id,
              headers: {
                accept: 'application/json',
                authorization: utils.authString( updatedOrganizationData )
              },
              on: {
                response: function( response ) {
                    result = response.content.data;
                    deletedAchievement = true;
                },
                error: function( response ) {
                    if ( utils.debug )
                    {
                        console.log( "\nError deleting Achievement:\n" );
                        console.log( response.content.body )
                        console.log( "\n" );
                    }
                    error = true;
                }
              }
            });
        });
        
        waitsFor( function() {
            return error || result;
        }, "Delete Achievement timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nDeleted Achievement:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
        });
    });        

    it( 'should Create Achievement using context name', function () {
        var error = false;
        
        waitsFor( function () {
            return deletedAchievement;            
        }, 'Creating/Deleting achievement timed out', 30000 );
        
        runs( function() {
            shred.post({
              url: utils.levelUpUrl + '/Achievement',
              headers: {
                content_type: 'application/json',
                accept: 'application/json',
                authorization: utils.authString( updatedOrganizationData )
              },
              content: {
                personHash: utils.personHash(),
                context: context.name,
                classId: achievementClass._id
              },
              on: {
                response: function( response ) {
                    achievementByContextName = response.content.data;
                },
                error: function( response ) {
                    if ( utils.debug )
                    {
                        console.log( "\nError creating Achievement by context name:\n" );
                        console.log( response.content.body )
                        console.log( "\n" );
                    }
                    error = true;
                }
              }
            });
        });
        
        waitsFor( function() {
            return error || achievementByContextName;
        }, "Create Achievement by context name timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nCreated Achievement using context name:\n" );
                console.log( JSON.stringify( achievementByContextName, null, 4 ) );
                console.log( "\n" );
            }

            expect( achievementByContextName ).not.toBeNull();
            expect( achievementByContextName._id ).not.toBeUndefined();
            expect( achievementByContextName.contextId ).toEqual( context._id );
            expect( achievementByContextName.organizationId ).toEqual( organization._id );
            expect( achievementByContextName.classId ).toEqual( achievementClass._id );
            expect( achievementByContextName.updatedAt ).not.toBeUndefined();
        });
    });
    
    it( 'should Delete Achievement by context name', function () {
        var error = false;
        var result = null;
        
        waitsFor( function() {
            return achievementByContextName; 
        }, 'Achievement by context name creation took too long.', 30000 );

        runs( function() {
            shred.delete({
              url: utils.levelUpUrl + '/Achievement/' + achievementByContextName._id,
              headers: {
                accept: 'application/json',
                authorization: utils.authString( updatedOrganizationData )
              },
              on: {
                response: function( response ) {
                    result = response.content.data;
                    deletedAchievementByContextName = true;
                },
                error: function( response ) {
                    if ( utils.debug )
                    {
                        console.log( "\nError deleting Achievement by context name:\n" );
                        console.log( response.content.body )
                        console.log( "\n" );
                    }
                    error = true;
                }
              }
            });
        });
        
        waitsFor( function() {
            return error || result;
        }, "Delete Achievement by context name timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nDeleted Achievement by context name:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
        });
    });

    it( 'should Create Achievement using class name', function () {
        var error = false;
        
        waitsFor( function () {
            return deletedAchievementByContextName;            
        }, 'Creating/Deleting achievement by context name timed out', 30000 );
        
        runs( function() {
            shred.post({
              url: utils.levelUpUrl + '/Achievement',
              headers: {
                content_type: 'application/json',
                accept: 'application/json',
                authorization: utils.authString( updatedOrganizationData )
              },
              content: {
                personHash: utils.personHash(),
                contextId: context._id,
                class: achievementClass.name
              },
              on: {
                response: function( response ) {
                    achievementByClassName = response.content.data;
                },
                error: function( response ) {
                    if ( utils.debug )
                    {
                        console.log( "\nError creating Achievement by class name:\n" );
                        console.log( response.content.body )
                        console.log( "\n" );
                    }
                    error = true;
                }
              }
            });
        });
        
        waitsFor( function() {
            return error || achievementByClassName;
        }, "Create Achievement by class name timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nCreated Achievement using class name:\n" );
                console.log( JSON.stringify( achievementByClassName, null, 4 ) );
                console.log( "\n" );
            }

            expect( achievementByClassName ).not.toBeNull();
            expect( achievementByClassName._id ).not.toBeUndefined();
            expect( achievementByClassName.contextId ).toEqual( context._id );
            expect( achievementByClassName.organizationId ).toEqual( organization._id );
            expect( achievementByClassName.classId ).toEqual( achievementClass._id );
            expect( achievementByClassName.updatedAt ).not.toBeUndefined();
        });
    });
    
    it( 'should Delete Achievement by class name', function () {
        var error = false;
        var result = null;
        
        waitsFor( function() {
            return achievementByClassName; 
        }, 'Achievement by class name creation took too long.', 30000 );

        runs( function() {
            shred.delete({
              url: utils.levelUpUrl + '/Achievement/' + achievementByClassName._id,
              headers: {
                accept: 'application/json',
                authorization: utils.authString( updatedOrganizationData )
              },
              on: {
                response: function( response ) {
                    result = response.content.data;
                    deletedAchievementByClassName = true;
                },
                error: function( response ) {
                    if ( utils.debug )
                    {
                        console.log( "\nError deleting Achievement by class name:\n" );
                        console.log( response.content.body )
                        console.log( "\n" );
                    }
                    error = true;
                }
              }
            });
        });
        
        waitsFor( function() {
            return error || result;
        }, "Delete Achievement by class name timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nDeleted Achievement by class name:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
        });
    });
});

describe( 'Cleanup', function() {

    it( 'should Delete AchievementClass', function () {
        var result = null;        
        var error = false;
        
        shred.delete({
          url: utils.levelUpUrl + '/AchievementClass/' + achievementClass._id,
          headers: {
            accept: 'application/json',
            authorization: utils.authString( updatedOrganizationData )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError deleting AchievementClass:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Delete AchievementClass timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot delete AchievementClass result:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }
            
            expect( result ).not.toBeNull();
        });
    });
    
    it( 'should Delete Context', function () {
        var result = null;        
        var error = false;
        
        shred.delete({
          url: utils.levelUpUrl + '/Context/' + context._id,
          headers: {
            accept: 'application/json',
            authorization: utils.authString( updatedOrganizationData )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError deleting Context:\n" );
                    console.log( response.content.body )
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Delete Context timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot delete Context result:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }
            
            expect( result ).not.toBeNull();
        });
    });
   
    it( 'should Delete Organization', function () {
        var result = null;        
        var error = false;
        
        shred.delete({
          url: utils.levelUpUrl + '/Organization/' + organization._id,
          headers: {
            accept: 'application/json',
            authorization: utils.authString( updatedOrganizationData )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
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
            if ( utils.debug )
            {
                console.log( "\nGot delete Organization result:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }
            
            expect( result ).not.toBeNull();
        });
    });
});

