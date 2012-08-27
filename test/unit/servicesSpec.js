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

  beforeEach(function() {
    module('devcenterTest.services');

    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', '/someUrl').respond('');

      devcenterClient = $injector.get('devcenterClient')(datastoreBackendUrl, graphBackendUrl);
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch authentication token', function() {
    $httpBackend.expectGET('/someUrl');
    var success = false;
    var failure  = false;
    devcenterClient.promoteDeveloper(randomUuid()).then(function() {
      success = true;
    }, function() {
      failure = true;
    });
    $httpBackend.flush();
    expect(success).toBeTruthy();
    expect(failure).toBeFalsy();
  });
});
