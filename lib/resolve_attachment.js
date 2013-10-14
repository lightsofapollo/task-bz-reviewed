var GITHUB_CONTENT_TYPE = 'text/x-github-pull-request';
var GITHUB_URL = /github.com\/(.*)\/pull/;

/**
Tiny helper to find (and only one) matching item in an array.
*/
function findOne(filter, array) {
  for (var i = 0, len = array.length; i < len; i++) {
    var item = array[i];
    if (filter(item)) return item;
  }
  return null;
}

function resolvePassContentType(attachment) {
  return attachment.content_type == GITHUB_CONTENT_TYPE;
}

function resolvePassData(attachment) {
  if (!attachment.data) return null;

  var data = new Buffer(attachment.data, 'base64').toString();
  return GITHUB_URL.test(data);
}


/**
Finds an attachment with "github" (case insensitive) in the description.
@return {Null|Object}
*/
function resolve(attachments) {
  return (
    // first pass try to find something with the github content-type
    findOne(resolvePassContentType, attachments) ||
    // second pass try to find something with a github url in the data.
    findOne(resolvePassData, attachments)
  );
}

module.exports = resolve;
