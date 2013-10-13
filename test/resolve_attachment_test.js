suite('resolve_attachment', function() {
  var attachmentFactory = require('./support/attachment_factory').one;
  var subject = require('../lib/resolve_attachment');

  var githubUrl = 'https://github.com/mozilla-b2g-bot/task-linkify/pull/1';

  /**
  Going to focus mostly on the success cases as we expect the roll out of new 
  github content type to make this bullet proof.
  */
  var fixtures = {
    notGithub: attachmentFactory({
      content_type: 'text/html',
      description: 'github',
      data: new Buffer('i like github').toString('base64')
    }),

    contentTypeGithub: attachmentFactory({
      content_type: 'text/x-github-pull-request'
    }),

    descriptionGithub: attachmentFactory({
      description: 'github',
      content_type: 'text/html',
      data: new Buffer(githubUrl).toString('base64')
    })
  };

  test('no attachment', function() {
    assert.equal(
      subject([fixtures.notGithub]),
      null
    );
  });

  test('content type: x-github-pull-request', function() {
    assert.equal(
      subject([fixtures.notGithub, fixtures.contentTypeGithub]),
      fixtures.contentTypeGithub
    );
  });

  test('data has github link', function() {
    assert.equal(
      subject([fixtures.descriptionGithub]),
      fixtures.descriptionGithub
    );
  });
});
