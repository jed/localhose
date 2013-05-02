# DEPRECATED - Please use [local-tld](https://github.com/hoodiehq/local-tld) instead.

Localhose is a [node.js](http://nodejs.org/) module that provides a simple API for dynamically adding hosts to the `/etc/hosts` file, to fool your web browser into thinking `anydomain.com` points to your local machine. This makes web development easier, since the local build and production build can now use identical URLs.

**WARNING: This software requires superuser access, and will temporarily overwrite your hosts file. If you do not understand what that means, it's probably not a good tool for you.**

## Requirements

* [node.js](http://nodejs.org/), tested with 0.4.1
* OS X, version 10.5 or later (soon, any OS with a `hosts` file)
* superuser access to your machine

## Install

    $ npm install localhose

## Module API

### localhose = require( "localhose" )

Returns a global `localhose` object that keeps track of what domains are being rerouted.

### localhose.set( host1, [host2], [etc] )

Adds one or more hosts to be routed to your local machine. The hosts are stored within the existing hosts file, like this:

    # <localhose>
    # The following have been added temporarily by Localhose
    # For more information, see https://github.com/jed/localhose
    127.0.0.1	yourdomain.com
    127.0.0.1	yourdomain.net
    # </localhose>

The path of the host file can be specified using the `hostsPath` property of the `localhose.constructor.prototype` object.

### localhose.add( [host1], [host2], [etc] )

Adds additional domain(s) the the <localhose> section of your hosts file but will not overwrite any existing hosts in <localhose> section.

### localhose.unset( [host1], [host2], [etc] )

Removes some or all of the hosts rerouted to your machine. If no arguments are specified, all currently hosts are unset. If no hosts remain after this is called, the `# <localhose> ... # </localhose>` section of the current `hosts` file is removed, leaving your file system as pristine as it was before.

### localhose.domains()

Returns a list of domains currently being rerouted to `127.0.0.1`

## Command-line API

### $ sudo localhose set host1 [host2] [etc]

Same as `localhose.set`, but for the command line.

### $ sudo localhose unset [host1] [host2] [etc]

Same as `localhose.unset`, but for the command line.

## Example

For an example rerouting `nodejs.org` to your machine, see [test.js](/jed/localhose/blob/master/test.js). Otherwise, usage is basically like this:

    // sudo node ./someFile.js
    localhose = require( "localhose" )

    // resolve "google.com" and "google.org" to 127.0.0.1.
    // note that you will be unable to use google while this is set.
    localhose.set( "google.com", "google.org" )

    localhose.domains() // [ "google.com", "google.org" ]

    // remove all domains, and revert the `hosts` file to its original state
    localhose.unset( "google.com" )

## TODO

* Add support for non-OS X systems if anyone's interested.

Copyright
---------

Copyright (c) 2011 Jed Schmidt. See LICENSE.txt for details.

Send any questions or comments [here](http://twitter.com/jedschmidt).
