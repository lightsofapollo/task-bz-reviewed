task-bz-reviewed
================

Task to check if a bugzilla bug has been reviewed ( and verify that the review is a suggested reviewer )

## Usage

```js
var task = require('task-bz-reviewed');

task(
  {
    // bugzilla bug number
    bug: 999,
    // custom bugzilla instance or configuration
    bugzillaConfig: {
      url: 'https://bugzilla.mozilla.org/rest',
      username: '...',
      password: '...',
      timeout: '...'
    }
  },
  function(err, success, detail) {
    if (success) // yey

    // if not successful detail will be populated
    // detail => { status: 'fail_some_reason', message: 'why I failed' }
    // see lib/states.js for all the details.
  }
);
```

## CLI

There is also a command line utility which can be used to test out the
functionality of the task

```sh
# if installed globally. If use ./bin/bz-reviewed if in this repo or
# ./node_modules/.bin/bz-reviewed if in a different package.

bz-reviewed $BUG_NUMBER
```
