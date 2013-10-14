/**
Bugzilla suggested reviewer data factory (getSuggestedReviewers)

var factory = require('./test/reviewer_factory');

factory([
  { email: 'jlal@mozilla.com' },
  { email: 'xfoo@mozilla.com' }
])
*/

function reviewer(overrides) {
  var base = {};
  if (overrides) {
    for (var key in overrides) base[key] = overrides[key];
  }
  return base;
}

function factory(overrides) {
  return overrides.map(reviewer);
}

module.exports = factory;
