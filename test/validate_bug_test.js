suite('validate bug', function() {
  var attachmentFactory = require('./support/attachment_factory'),
      reviewerFactory = require('./support/reviewer_factory'),
      subject = require('../lib/validate_bug').validateBug,
      states = require('../lib/states');

  var AUTHORIZED_EMAIL = 'authorized@email.com';

  var reviewers = reviewerFactory([
    { email: AUTHORIZED_EMAIL }
  ]);

  test('success - single suggested reviewer', function() {
    var attachments = attachmentFactory([
      {
        flags: [
          { setter: AUTHORIZED_EMAIL, status: '+' }
        ]
      }
    ]);

    assert.deepEqual(
      { success: true },
      subject(reviewers, attachments)
    );
  });

  test('fail - no attachment', function() {
    assert.deepEqual(
      states('NO_ATTACHMENT'),
      subject(reviewers, [])
    );
  });

  test('fail - no flags', function() {
    var attachments = attachmentFactory([{
      flags: []
    }]);

    assert.deepEqual(
      states('NO_FLAGS'),
      subject(reviewers, attachments)
    );
  });

  test('fail - no review flags', function() {
    var attachments = attachmentFactory([{
      flags: [{ name: 'feedback', setter: 'a', status: '+' }]
    }]);

    assert.deepEqual(
      states('NO_REVIEW_FLAGS'),
      subject(reviewers, attachments)
    );
  });

  test('fail - no suggested reviwer', function() {
    var attachments = attachmentFactory([{
      flags: [
        { setter: 'notsuggested@email.com', status: '+' }
      ]
    }]);

    assert.deepEqual(
      states('NO_SUGGESTED_REVIEWER'),
      subject(reviewers, attachments)
    );
  });

  test('fail - multiple reviewers suggested r+ other r-', function() {
    var attachments = attachmentFactory([{
      flags: [
        { setter: AUTHORIZED_EMAIL, status: '+' },
        { setter: 'notsuggested@email.com', status: '-' }
      ]
    }]);

    assert.deepEqual(
      states('REVIEW_NOT_GRANTED'),
      subject(reviewers, attachments)
    );
  });
});
