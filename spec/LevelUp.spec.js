var Shred = require( 'shred' );
var shred = new Shred();

var utils = require( './utils.js' );

var testUserData = utils.getUserData( 'testUser' );
var updatedUserData = utils.getUserData( 'updatedUser' );

var user = null;

describe( 'Users', function() {

    it( 'should Create User', function () {
        var error = false;
        
        shred.post({
          url: utils.levelUpUrl + '/api/1.0/User',
          headers: {
            content_type: 'application/json',
            accept: 'application/json'
          },
          content: testUserData,
          on: {
            response: function( response ) {
                user = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError creating User:\n" );
                    console.log( response.content.body );
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || user;
        }, "Create User timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nCreated user:\n" );
                console.log( JSON.stringify( user, null, 4 ) );
                console.log( "\n" );
            }

            expect( user ).not.toBeNull();
            expect( user.email ).toEqual( testUserData.email.toLowerCase() );
            expect( user.nickname ).toEqual( testUserData.nickname );
            expect( user.bio ).toEqual( testUserData.bio );
            expect( user.location ).toEqual( testUserData.location );            
            expect( user.hash ).not.toBeUndefined();
            expect( user.score ).not.toBeUndefined();
            expect( user._id ).not.toBeUndefined();
            expect( user.updatedAt ).not.toBeUndefined();
        });
    });

    it( 'should Create Session using basic auth', function () {
        var error = false;
        var result = null;
        
        shred.post({
          url: utils.levelUpUrl + '/api/1.0/Session',
          headers: {
            accept: 'application/json',
            authorization: utils.authString( testUserData )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError creating Session:\n" );
                    console.log( response.content.body );
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Create Session timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nCreated session:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
        });
    });

    it( 'should Delete Session created using basic auth', function () {
        var error = false;
        var result = null;
        
        shred.delete({
          url: utils.levelUpUrl + '/api/1.0/Session',
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
                    console.log( "\nError deleting Session:\n" );
                    console.log( response.content.body );
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Delete Session timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nDeleted session:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
        });
    });

    it( 'should Create Session using post data', function () {
        var error = false;
        var result = null;
        
        shred.post({
          url: utils.levelUpUrl + '/api/1.0/Session',
          headers: {
            accept: 'application/json',
            content_type: 'application/json'
          },
          content: testUserData,
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError creating Session:\n" );
                    console.log( response.content.body );
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Create Session timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nCreated session:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
        });
    });
    
    it( 'should Get uncensored User', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: utils.levelUpUrl + '/api/1.0/User',
          headers: {
            accept: 'application/json',
            authorization: utils.authString( testUserData )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError getting uncensored User:\n" );
                    console.log( response.content.body );
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Get uncensored User timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot uncensored user:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.email ).toEqual( testUserData.email.toLowerCase() );
            expect( result.nickname ).toEqual( testUserData.nickname );
            expect( result.bio ).toEqual( testUserData.bio );
            expect( result.location ).toEqual( testUserData.location );            
            expect( result.hash ).not.toBeUndefined();
            expect( result.score ).not.toBeUndefined();
            expect( result._id ).not.toBeUndefined();
            expect( result.updatedAt ).not.toBeUndefined();
        });
    });

    it( 'should Get censored User', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: utils.levelUpUrl + '/api/1.0/User/' + user.hash,
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
                    console.log( "\nError getting censored User:\n" );
                    console.log( response.content.body );
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Get censored User timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot censored user:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.email ).toBeUndefined();
            expect( result.nickname ).toEqual( testUserData.nickname );
            expect( result.bio ).toEqual( testUserData.bio );
            expect( result.location ).toEqual( testUserData.location );            
            expect( result.hash ).not.toBeUndefined();
            expect( result.score ).not.toBeUndefined();
            expect( result._id ).not.toBeUndefined();
            expect( result.updatedAt ).not.toBeUndefined();
        });
    });    

    it( 'should Update User', function () {
        var error = false;
        var updatedUser = null;
        
        shred.put({
          url: utils.levelUpUrl + '/api/1.0/User',
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( testUserData )
          },
          content: updatedUserData,
          on: {
            response: function( response ) {
                updatedUser = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError updating User:\n" );
                    console.log( response.content.body );
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || updatedUser;
        }, "Update User timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot updated user:\n" );
                console.log( JSON.stringify( updatedUser, null, 4 ) );
                console.log( "\n" );
            }

            expect( updatedUser ).not.toBeNull();
            expect( updatedUser.email ).toEqual( updatedUserData.email.toLowerCase() );
            expect( updatedUser.nickname ).toEqual( updatedUserData.nickname );
            expect( updatedUser.bio ).toEqual( updatedUserData.bio );
            expect( updatedUser.location ).toEqual( updatedUserData.location );            
            expect( updatedUser.hash ).not.toBeUndefined();
            expect( updatedUser.score ).not.toBeUndefined();
            expect( updatedUser._id ).not.toBeUndefined();
            expect( updatedUser.updatedAt ).not.toBeUndefined();

            expect( updatedUser.email ).not.toEqual( user.email );
            expect( updatedUser.nickname ).not.toEqual( user.nickname );
            expect( updatedUser.bio ).not.toEqual( user.bio );
            expect( updatedUser.location ).not.toEqual( user.location );            
            expect( updatedUser.hash ).not.toEqual( user.hash );
            expect( updatedUser.score ).not.toBeUndefined();
            expect( updatedUser._id ).toEqual( user._id );
            expect( updatedUser.updatedAt ).not.toEqual( user.updatedAt );

            user = updatedUser;
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
          url: utils.levelUpUrl + '/api/1.0/Context',
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( user )
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
                    console.log( response.content.body );
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
          url: utils.levelUpUrl + '/api/1.0/Context/' + context._id,
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
                    console.log( response.content.body );
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
          url: utils.levelUpUrl + '/api/1.0/Context/' + context._id,
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( user )
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
                    console.log( response.content.body );
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || updatedContext;
        }, "Update Context timed out", 10000 );
        
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
          url: utils.levelUpUrl + '/api/1.0/Contexts',
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
                    console.log( response.content.body );
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
          url: utils.levelUpUrl + '/api/1.0/Context/' + context._id + '/AchievementClass',
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( user )
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
                    console.log( response.content.body );
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
            expect( achievementClass.contextId ).toEqual( context._id );
            expect( achievementClass.updatedAt ).not.toBeUndefined();
        });
    });    
    
    it( 'should Get AchievementClass', function () {
        var error = false;
        var result = null;
        
        shred.get({
          url: utils.levelUpUrl + '/api/1.0/Context/' + context._id + '/AchievementClass/' + achievementClass._id,
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
                    console.log( response.content.body );
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
            expect( result.contextId ).toEqual( achievementClass.contextId );
            expect( result.updatedAt ).toEqual( achievementClass.updatedAt );
        });
    });

   it( 'should Update AchievementClass', function () {
        var error = false;
        var updatedAchievementClass = null;
        
        shred.put({
          url: utils.levelUpUrl + '/api/1.0/Context/' + context._id + '/AchievementClass/' + achievementClass._id,
          headers: {
            content_type: 'application/json',
            accept: 'application/json',
            authorization: utils.authString( user )
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
                    console.log( response.content.body );
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
          url: utils.levelUpUrl + '/api/1.0/Context/' + context._id + '/AchievementClasses',
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
                    console.log( response.content.body );
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
            expect( result[ 0 ].contextId ).toEqual( achievementClass.contextId );
            expect( result[ 0 ].updatedAt ).toEqual( achievementClass.updatedAt );
        });
    });
});

var achievement = null;
var achievementByContextName = null;
var achievementByClassName = null;

describe( 'Achievements', function() {

    var checkedAchievementList = false;
    var deletedAchievement = false;
    var deletedAchievementByContextName = false;
    var deletedAchievementByClassName = false;

    waitsFor( function() {
        return achievementClass; 
    }, 'Achievement Class creation took too long.', 30000 );

    it( 'should Create Achievement', function () {
        var error = false;
        
        shred.post({
          url: utils.levelUpUrl + '/api/1.0/Context/' + context._id + '/Achievement',
          headers: {
            content_type: 'application/json',
            accept: 'application/json'
          },
          content: {
            apiKey: user._id,
            apiSecret: user.apiSecret,
            userHash: utils.userHash( user ),
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
                    console.log( response.content.body );
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
            expect( achievement.classId ).toEqual( achievementClass._id );
            expect( achievement.updatedAt ).not.toBeUndefined();
        });
    });

    it( 'should Get Achievement list', function () {
        var error = false;
        var result = null;
        
        waitsFor( function() {
            return achievement; 
        }, 'Achievement creation took too long.', 30000 );

        runs( function() {
            shred.get({
              url: utils.levelUpUrl + '/api/1.0/User/' + utils.userHash( user ) + '/Achievements',
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
                        console.log( "\nError getting Achievement list:\n" );
                        console.log( response.content.body );
                        console.log( "\n" );
                    }
                    error = true;
                }
              }
            });
        });
        
        waitsFor( function() {
            return error || result;
        }, "Get Achievement list timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nGot Achievement list:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
            expect( result.length ).toEqual( 1 );
            expect( result[ 0 ].classId ).toEqual( achievement.classId );
            expect( result[ 0 ].contextId ).toEqual( achievement.contextId );

            checkedAchievementList = true;
        });
    });        

    it( 'should Delete Achievement', function () {
        var error = false;
        var result = null;
        
        waitsFor( function() {
            return checkedAchievementList; 
        }, 'Achievement gathering took too long.', 30000 );

        runs( function() {
            shred.delete({
              url: utils.levelUpUrl + '/api/1.0/Context/' + context._id + '/Achievement/' + achievement._id,
              headers: {
                content_type: 'application/json',
                accept: 'application/json',
                authorization: utils.authString( user )
              },
              content: {
                apiKey: user._id,
                apiSecret: user.apiSecret
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
                        console.log( response.content.body );
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

    it( 'should Create Achievement using class name', function () {
        var error = false;
        
        waitsFor( function () {
            return deletedAchievement;            
        }, 'Deleting achievement timed out', 30000 );
        
        runs( function() {
            shred.post({
              url: utils.levelUpUrl + '/api/1.0/Context/' + context._id + '/Achievement',
              headers: {
                content_type: 'application/json',
                accept: 'application/json',
                authorization: utils.authString( user )
              },
              content: {
                apiKey: user._id,
                apiSecret: user.apiSecret,
                userHash: utils.userHash( user ),
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
                        console.log( response.content.body );
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
              url: utils.levelUpUrl + '/api/1.0/Context/' + context._id + '/Achievement/' + achievementByClassName._id,
              headers: {
                content_type: 'application/json',
                accept: 'application/json'
              },
              content: {
                apiKey: user._id,
                apiSecret: user.apiSecret                
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
                        console.log( response.content.body );
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
          url: utils.levelUpUrl + '/api/1.0/Context/' + context._id + '/AchievementClass/' + achievementClass._id,
          headers: {
            accept: 'application/json',
            authorization: utils.authString( user )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError deleting AchievementClass:\n" );
                    console.log( response.content.body );
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
          url: utils.levelUpUrl + '/api/1.0/Context/' + context._id,
          headers: {
            accept: 'application/json',
            authorization: utils.authString( user )
          },
          on: {
            response: function( response ) {
                result = response.content.data;
            },
            error: function( response ) {
                if ( utils.debug )
                {
                    console.log( "\nError deleting Context:\n" );
                    console.log( response.content.body );
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

    it( 'should Delete User (and session)', function () {
        var error = false;
        var result = null;
        
        shred.delete({
          url: utils.levelUpUrl + '/api/1.0/User/' + user._id,
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
                    console.log( "\nError deleting User:\n" );
                    console.log( response.content.body );
                    console.log( "\n" );
                }
                error = true;
            }
          }
        });
        
        waitsFor( function() {
            return error || result;
        }, "Delete User timed out", 10000 );
        
        runs( function () {
            if ( utils.debug )
            {
                console.log( "\nDeleted user:\n" );
                console.log( JSON.stringify( result, null, 4 ) );
                console.log( "\n" );
            }

            expect( result ).not.toBeNull();
        });
    });
});

