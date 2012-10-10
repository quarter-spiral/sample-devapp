'use strict';

var token = 'some-token';

describe("devcenterClient", function() {
  var $httpBackend, uuidGenerator, devcenterClient;

  var devcenterBackendUrl = 'http://devcenter.example.com/v1';

  var carryOut = function(action) {
    var success, result, failure, error;
    success = false;
    result  = null;
    failure = false;
    error   = null;

    action.then(function(callResult) {
       success = true;
       result = callResult;
    }, function(reason) {
      failure = true;
      error = reason;
    });
    $httpBackend.flush();

    return {success: success, result: result, failure: failure, error: error};
  };

  var checkForHeaders = function(headers) {
    return headers["Authorization"] === ("Bearer " + token);
  };


  var can = function(description, options) {
    options = options || {};
    var url = options.url;
    var verb = options.verb;
    var action = options.action;
    var successfulResponse = options.response || '';
    var expectedRequestBody = options.expectedRequestBody;
    var expectations = options.expectations;

    describe(description, function() {
      verb = verb.toUpperCase();

      beforeEach(function() {
        if (expectedRequestBody) {
          $httpBackend.expect(verb, url(), expectedRequestBody(), checkForHeaders);
        } else {
          $httpBackend.expect(verb, url(), undefined, checkForHeaders);
        }
      });

      it('works', function() {
        $httpBackend.when(verb, url()).respond(successfulResponse);
        var response = carryOut(action());
        expect(response).toBeSuccessful();
        if (expectations !== undefined) {
          expectations(response);
        }
      });

      it('can fail', function() {
        $httpBackend.when(verb, url()).respond(403, {error: 'some reason'});
        expect(carryOut(action())).toErrorOutFor('some reason');
      });
    });
  }

  var entity1, entity2;
  var cookiesMock;

  beforeEach(function() {
    cookiesMock = {"qs_authentication": '{"info": {"uuid": "some-uuid", "token": "' + token + '"}}'};
    module('devcenterTest.services', function($provide) {
      $provide.value('$cookies', cookiesMock);
    });

    window.qs = window.qs || {};
    window.qs.ENV = {'QS_DEVCENTER_BACKEND_URL': 'http://devcenter.example.com'};

    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      uuidGenerator = function() {return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8); return v.toString(16);});};
      devcenterClient = $injector.get('devcenterClient');
    });

    this.addMatchers({
      toBeSuccessful: function() {
        return this.actual.success === true && this.actual.failure === false;
      },
      toErrorOutFor: function(reason) {
        return this.actual.success === false && this.actual.failure === true && this.actual.error == reason;
      }
    });

    $httpBackend.expectPOST(devcenterBackendUrl + '/developers/some-uuid', undefined, checkForHeaders);
    $httpBackend.when('POST', devcenterBackendUrl + '/developers/some-uuid').respond('');

    entity1 = uuidGenerator();
    entity2 = uuidGenerator();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  can('promote developers', {
      verb: 'POST',
      url: function() {return devcenterBackendUrl + '/developers/' + entity1},
      action: function() {return devcenterClient.promoteDeveloper(entity1)}
  });

  can('demote developers', {
      verb: 'DELETE',
      url: function() {return devcenterBackendUrl + '/developers/' + entity1},
      action: function() {return devcenterClient.demoteDeveloper(entity1)}
  });

  can('list games', {
      verb: 'GET',
      url: function() {return devcenterBackendUrl + '/developers/' + entity1 + '/games'},
      response: ['game1', 'game2'],
      action: function() {return devcenterClient.listGames(entity1)},
      expectations: function(response) {
        expect(response.result).toEqual(['game1', 'game2']);
      }
  });

  var addGameParams = function() {return {name: 'some game', description: 'a good game', developers: [entity1, entity2], screenshots: ['http://example.com/shot1.jpg', 'http://example.com/shot2.jpg'], configuration: {background: 'red'}}};
  can('add a game', {
    verb: 'POST',
    url: function() {return devcenterBackendUrl + '/games'},
    response: {uuid: 'some-uuid'},
    action: function() {return devcenterClient.addGame(addGameParams())},
    expectedRequestBody: addGameParams,
    expectations: function(response) {
      expect(response.result.uuid).toEqual('some-uuid');
    }
  });

  can('add a developer', {
    verb: 'POST',
    url: function() {return devcenterBackendUrl + '/games/' + entity1 + '/developers/' + entity2},
    action: function() {return devcenterClient.addDeveloper(entity1, entity2)}
  });

  can('remove a developer', {
    verb: 'DELETE',
    url: function() {return devcenterBackendUrl + '/games/' + entity1 + '/developers/' + entity2},
    action: function() {return devcenterClient.removeDeveloper(entity1, entity2)}
  });

  can('delete a game', {
      verb: 'DELETE',
      url: function() {return devcenterBackendUrl + '/games/' + entity1},
      action: function() {return devcenterClient.deleteGame(entity1)}
  });

  var changeGameRequestParams  = function() {return {name: 'changed name', description: 'changed description', developers: [entity1], screenshots: ['http://example.com/shot3.jpg'], configuration: {background: 'yellow'}}};
  var changeGameResponseParams = {name: 'changed game', description: 'changed description', uuid: 'some-uuid'};
  can("change a game's configuration", {
    verb: 'PUT',
    url: function() {return devcenterBackendUrl + '/games/' + entity1},
    response: changeGameResponseParams,
    action: function() {return devcenterClient.updateGame(entity1, changeGameRequestParams())},
    expectedRequestBody: changeGameRequestParams,
    expectations: function(response) {
      expect(response.result).toEqual(changeGameResponseParams);
    }
  });

  var retrievedGameParams = {name: 'some game', description: 'a good game', uuid: 'some-uuid', developers: ['dev-1', 'dev-2'], screenshots: ['http://example.com/shot1.jpg', 'http://example.com/shot3.jpg'], configuration: {background: 'purple'}};
  can("retrieve a game's configuration", {
    verb: 'GET',
    url: function() {return devcenterBackendUrl + '/games/' + entity1},
    response: retrievedGameParams,
    action: function() {return devcenterClient.getGame(entity1)},
    expectations: function(response) {
      expect(response.result).toEqual(retrievedGameParams);
    }
  });
});
