suite('task', function() {
  var subject = require('../'),
      validate = require('../lib/validate_bug'),
      bz = require('bz');

  var bugzilla;
  setup(function() {
    this.sinon = sinon.sandbox.create();
    bugzilla = bz.createClient();

    this.sinon.stub(bz, 'createClient').returns(bugzilla);
  });

  teardown(function() {
    this.sinon.restore();
  });

  var reviewers = [],
      attachments = [],
      bugNumber = 9001;

  var stubSuggestedReviewers,
      stubBugAttachments,
      stubValidate;

  function callsBugzillaApi() {
    // verify we requested the right reviewers
    assert.calledWithMatch(
      stubSuggestedReviewers, bugNumber, sinon.match.func
    );

    // verify we requested right attachments
    assert.calledWithMatch(
      stubBugAttachments, bugNumber, sinon.match.func
    );
  }

  suite('success', function() {
    var result = { ireturned: true };

    setup(function() {
      // reviewers
      stubSuggestedReviewers = this.sinon.stub(
        bugzilla,
        'getSuggestedReviewers'
      );
      stubSuggestedReviewers.callsArgWithAsync(1, null, reviewers);

      // attachments
      stubBugAttachments = this.sinon.stub(
        bugzilla,
        'bugAttachments'
      );
      stubBugAttachments.callsArgWithAsync(1, null, attachments);

      // validator call
      stubValidate = this.sinon.stub(validate, 'validateBug').returns(result);
    });

    test('passes api requests to validator', function(done) {
      subject({ bug: bugNumber }, function(err, givenResult) {
        // verify that the validator was given the correct arguments
        assert.calledWith(
          stubValidate, reviewers, attachments
        );

        assert.equal(result, givenResult, 'returns output from validate');
        done(err);
      });

      callsBugzillaApi();
    });
  });

  suite('failure - getSuggestedReviewers fails', function() {
    var err = new Error();
    setup(function() {
      // reviewers
      stubSuggestedReviewers = this.sinon.stub(
        bugzilla,
        'getSuggestedReviewers'
      );
      stubSuggestedReviewers.callsArgWithAsync(1, err);

      // attachments
      stubBugAttachments = this.sinon.stub(
        bugzilla,
        'bugAttachments'
      );

      stubBugAttachments.callsArgWithAsync(1, null, attachments);
    });

    test('passes api requests to validator', function(done) {
      subject({ bug: bugNumber }, function(givenErr) {
        assert.equal(givenErr, err, 'passes suggested reviewer failure');
        done();
      });

      // verify we made the correct api calls
      callsBugzillaApi();
    });
  });

  suite('failure - bugAttachments fails', function() {
    var err = new Error();
    setup(function() {
      // reviewers
      stubSuggestedReviewers = this.sinon.stub(
        bugzilla,
        'getSuggestedReviewers'
      );
      stubSuggestedReviewers.callsArgWithAsync(1, null, reviewers);

      // attachments
      stubBugAttachments = this.sinon.stub(
        bugzilla,
        'bugAttachments'
      );

      stubBugAttachments.callsArgWithAsync(1, err);
    });

    test('passes api requests to validator', function(done) {
      subject({ bug: bugNumber }, function(givenErr) {
        assert.equal(givenErr, err, 'passes bug attachment failure');
        done();
      });

      // verify we made the correct api calls
      callsBugzillaApi();
    });
  });

  suite('failure - both api calls fail', function() {
    var errOne = new Error();
    var errTwo = new Error();

    setup(function() {
      // reviewers
      stubSuggestedReviewers = this.sinon.stub(
        bugzilla,
        'getSuggestedReviewers'
      );
      stubSuggestedReviewers.callsArgWithAsync(1, errOne);

      // attachments
      stubBugAttachments = this.sinon.stub(
        bugzilla,
        'bugAttachments'
      );

      stubBugAttachments.callsArgWithAsync(1, errTwo);
    });

    test('passes api requests to validator', function(done) {
      subject({ bug: bugNumber }, function(givenErr) {
        assert.ok(givenErr, 'returns an error');
        done();
      });

      // verify we made the correct api calls
      callsBugzillaApi();
    });
  });
});
