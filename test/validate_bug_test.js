suite('validate bug', function() {
  var attachmentFactory = require('./support/attachment_factory'),
      reviewerFactory = require('./support/reviewer_factory'),
      subject = require('../lib/validate_bug').validateBug;

  var reviewers = reviewerFactory([
    { email: 'authorized@email.com' }
  ]);

  suite('success - single suggested reviewer', function() {
    var attachments = attachmentFactory([
      {
        flags: [
          { setter: 'authorized@email.com', status: '+' }
        ]
      }
    ]);

    test('result', function() {
      assert.deepEqual(
        { success: true },
        subject(reviewers, attachments)
      );
    });
  });
});
