var validate = require('./lib/validate_bug'),
    bz = require('bz');

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
    bugzilla.getSuggestedReviewers(bug, function(err, result) {
      if (err) return done(err);
      reviewers = result;
      done();
    });
  }

  function getAttachments(done) {
    bugzilla.bugAttachments(bug, function(err, result) {
      if (err) return done(err);
      attachments = result;
      done();
    });
  }

  function complete() {
    callback(null, validate.validateBug(reviewers, attachments));
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
