var validate = require('./lib/validate_bug'),
    bz = require('bz'),
    debug = require('debug')('task-bz-reviewed:task');

/**
Check and see if a given bug has been reviewed for a github pull request.

See lib/states for list of possible "failure" (not error) cases.
In the case of success the callback will pass { success: true }.

@param {Object} options for task.
@param {Number} options.bug number.
@param {Object} options.bugzillaConfig bugzilla api configuration.
@param {Function} callback [Error, Object]
*/
function task(options, callback) {
  debug('request', options);
  if (!options.bug) {
    throw new Error('.bug must be given!');
  }

  // bugzilla rest api interface
  var bugzilla = bz.createClient(options.bugzillaConfig || {});

  // bugzilla bug number
  var bug = options.bug;

  // list of suggested reviewers
  var reviewers;

  // list of bugzilla attachments
  var attachments;

  function getReviewers(done) {
    debug('suggested reviewer');
    bugzilla.getSuggestedReviewers(bug, function(err, result) {
      if (err) return done(err);
      debug('suggested reviewer done', result.length + ' of reviewers');
      reviewers = result;
      done();
    });
  }

  function getAttachments(done) {
    debug('get attachments');
    bugzilla.bugAttachments(bug, function(err, result) {
      if (err) return done(err);
      debug('get attachments done', result.length + ' of attachments');
      attachments = result;
      done();
    });
  }

  function complete() {
    var status = validate.validateBug(reviewers, attachments);
    debug('complete', status);
    callback(
      // no error
      null,
      // null is success
      (status === null) ? true : false,
      // pass the status object
      status
    );
  }

  var operations = [getReviewers, getAttachments],
      pending = operations.length;

  // invoke api requests in parallel (miss generators here).
  operations.forEach(function(op) {
    op(function(err) {
      if (err) {
        // callback must only fire once.
        callback && callback(err);
        callback = null;
        return;
      }

      // when all parallel operations are complete...
      if (--pending === 0) complete();
    });
  });
}

module.exports = task;
