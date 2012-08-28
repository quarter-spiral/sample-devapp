'use strict';

describe("devcenterClient", function() {
  var $httpBackend, devcenterClient;

  var devcenterBackendUrl = 'http://devcenter.example.com';

  var randomUuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

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

  var can = function(description, options) {
    options = options || {};
    var url = options.url;
    var verb = options.verb;
    var action = options.action;
    var successfulResponse = options.response || '';
    var expectations = options.expectations;

    describe(description, function() {
      verb = verb.toUpperCase();

      beforeEach(function() {
        $httpBackend['expect' + verb](url());
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

  beforeEach(function() {
    module('devcenterTest.services');

    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      devcenterClient = $injector.get('devcenterClient')(devcenterBackendUrl);
    });

    this.addMatchers({
      toBeSuccessful: function() {
        return this.actual.success === true && this.actual.failure === false;
      },
      toErrorOutFor: function(reason) {
        return this.actual.success === false && this.actual.failure === true && this.actual.error == reason;
      }
    });

    entity1 = randomUuid();
    entity2 = randomUuid();
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
});
