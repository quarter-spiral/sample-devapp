'use strict';

describe("devcenterClient", function() {
  var $httpBackend, devcenterClient;

  var datastoreBackendUrl = 'http://datastore.example.com';
  var graphBackendUrl     = 'http://graph.example.com';

  var randomUuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  var entity1, entity2;

  beforeEach(function() {
    module('devcenterTest.services');

    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');

      devcenterClient = $injector.get('devcenterClient')(datastoreBackendUrl, graphBackendUrl);
    });

    var entity1 = randomUuid();
    var entity2 = randomUuid();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('can promote developers', function() {
    $httpBackend.when('POST', 'developers/' + entity1).respond('');
    $httpBackend.expectPOST('/developers/' + entity1);

    var success = false;
    var failure  = false;
    devcenterClient.promoteDeveloper(entity1).then(function() {
      success = true;
    }, function() {
      failure = true;
    });
    $httpBackend.flush();
    expect(success).toBeTruthy();
    expect(failure).toBeFalsy();
  });
});
