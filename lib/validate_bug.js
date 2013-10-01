var states = require('./states');

// github description types.
var DESCRIPTION_VALIDATOR = 'github';

// for the moment we only care about the review flag
var FLAG_REVIEW = 'review';

// indicator that a review type has passed.
var FLAG_PASS = '+';

/**
Finds an attachment with "github" (case insensitive) in the description.
@return {Null|Object}
*/
function resolveAttachment(attachments) {
  var attachment, description;
  for (var i = 0, len = attachments.length; i < len; i++) {
    attachment = attachments[i];
    description = attachment.description.toLowerCase();

    if (description.indexOf(DESCRIPTION_VALIDATOR) !== 1) {
      return attachment;
    }
  }
  return null;
}

/**
For a bug to be reviewed it must be:

  - have an attachment
    - attachment must be a github pull request
    - all reviews must be r+
    - at least one review must be from a suggested reviewer.

In the case of success an object will be returned

    // => { success: true }

In the case of some kind of failure

    // => { success: false, state: 'r-', message: 'Reviewer gave r-' }

@param {Object} reviewers as bugzilla rest defines them.
@param {Object} attachments as bugzilla rest defines them.
@return {Object} status object which indicates success/failure
*/
function validateBug(reviewers, attachments) {
  // convert review list into a ghetto set (ES6 oneday...)
  var suggestedReviewers = {};
  reviewers.forEach(function(reviewer) {
    suggestedReviewers[reviewer.email] = true;
  });

  // no attachments or an empty array of attachments
  if (!attachments || !attachments.length) {
    return states('NO_ATTACHMENT');
  }

  // find the github attachment
  var attachment = resolveAttachment(attachments);

  if (!attachment.flags || !attachment.flags.length) {
    return states('NO_FLAGS');
  }

  var reviewStats = {
    // one or more suggested reviewer _must_ be on the bugs review
    suggestedReviewGranted: false,
    // reviews requested
    reviews: 0,
    // reviews granted
    granted: 0
  };

  for (var i = 0, len = attachment.flags.length; i < len; i++) {
    var flag = attachment.flags[i];

    // skip non review flags
    if (flag.name !== FLAG_REVIEW) continue;

    // keep track of total number of reviews
    reviewStats.reviews++;

    if (flag.status === FLAG_PASS) {
      // yey someone likes the attachment
      reviewStats.granted++;
    }

    if (suggestedReviewers[flag.setter]) {
      // at least one reviewer is a suggested reviewer.
      reviewStats.suggestedReviewGranted = true;
    }
  }

  // nobody has reviewed the attachment
  if (!reviewStats.reviews) {
    return states('NO_REVIEW_FLAGS');
  }

  if (
    // all reviews must be granted
    reviewStats.granted === reviewStats.reviews &&
    // and we have at least one suggested reviewer
    reviewStats.suggestedReviewGranted
  ) {
    return { success: true };
  }
}

module.exports.validateBug = validateBug;
