suite('validate bug', function() {
  var attachmentFactory = require('./support/attachment_factory'),
      reviewerFactory = require('./support/reviewer_factory'),
      subject = require('../lib/validate_bug').validateBug,
      states = require('../lib/states');

  var reviewers = reviewerFactory([
    { email: 'authorized@email.com' }
  ]);

  test('success - single suggested reviewer', function() {
    var attachments = attachmentFactory([
      {
        flags: [
          { setter: 'authorized@email.com', status: '+' }
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
});
