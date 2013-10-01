var STATES = {
};


// github description types.
var DESCRIPTION_VALIDATOR = 'github';

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
    console.log(attachment);
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

  // one or more suggested reviewer _must_ be on the bugs review
  var hasSuggestedReview = false;

  // find the github attachment
  var attachment = resolveAttachment(attachments);

  // verify all reviews are passed
  var hasReview = attachment.flags.every(function(flag) {
    if (flag.status === FLAG_PASS) {
      // check if the flag setter is a suggested reviewer
      hasSuggestedReview = !!suggestedReviewers[flag.setter];
      return true;
    }
    return false;
  });

  if (hasReview && hasSuggestedReview) {
    return { success: true };
  }
}

module.exports.validateBug = validateBug;
module.exports.STATES = STATES;
