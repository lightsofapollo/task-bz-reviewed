var STATES = {
  NO_ATTACHMENT: {
    state: 'no_attachment',
    message: 'no attachment'
  },

  NO_FLAGS: {
    state: 'no_flags',
    message: 'No flags where given for the attachment'
  },

  NO_REVIEW_FLAGS: {
    state: 'no_review_flags',
    message: 'No flags for review where given for attachment'
  },

  NO_SUGGESTED_REVIEWER: {
    state: 'no_suggested_reviewer',
    message: 'No authorized (suggested) reviewer has granted review'
  }
};

function exportState(type) {
  if (!(type in STATES))
    throw new Error('undefined state: "' + type + '"');

  return {
    success: false,
    state: STATES[type].state,
    message: STATES[type].message
  };
}

module.exports = exportState;
