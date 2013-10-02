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

      // verify we requested the right reviewers
      assert.calledWithMatch(
        stubSuggestedReviewers, bugNumber, sinon.match.func
      );

      // verify we requested right attachments
      assert.calledWithMatch(
        stubBugAttachments, bugNumber, sinon.match.func
      );
    });
  });
});
