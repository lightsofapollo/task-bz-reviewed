/**
Bugzilla attachment data factory. (bug/{NUMBER}/attachment)

var factory = require('./support/attachment_factory');

factory([
  {
    description: 'xfoo',
    flags: [
      {
        requestee: "jlal@mozilla.com",
        setter: "kgrandon@mozilla.com",
        status: "r?"
      },
      {
        requestee: "nfoo@mozilla.com",
        setter: "kgrandon@mozilla.com",
        status: "r+"
      }
    ]
  }
]);
*/

function attachmentFlag(overrides) {
  var base = { name: 'review' };

  if (overrides) {
    for (var key in overrides) base[key] = overrides[key];
  }

  return base;
}

function attachment(overrides) {
  var base = { description: 'GitHub' };
  if (overrides) {
    for (var key in overrides) base[key] = overrides[key];
  }

  return base;
}

function attachmentsFactory(attachments) {
  return attachments.map(attachment);
}

module.exports = attachmentsFactory;
