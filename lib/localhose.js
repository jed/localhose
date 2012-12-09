var fs = require( "fs" )
  , path = require( "path" )
  , exec = require( "child_process" ).exec
  , Localhoses = function(){}
  , platform = process.platform
  , platformPaths = {
      "darwin": "/private/etc/hosts",
      "win32": path.join(process.env["WinDir"], "System32", "drivers", "etc", "hosts"),
      "linux": "/etc/hosts"
    };

if (!platformPaths.hasOwnProperty(platform)) throw "Sorry, only tested on OS X, Linux and Windows. Feel free to submit pull requests to support other systems.";

Localhoses.prototype = {
  hostsPath: platformPaths[platform],

  header:
    "# <localhose>",

  description:
    "# The following have been added temporarily by Localhose\n" +
    "# For more information, see https://github.com/jed/localhose",

  footer:
    "# </localhose>",

  domains: function(){ return Object.keys( this ) },

  // Returns and array of domains localhose is currently re-routing to 127.0.0.1
  list: function() {
    var end,
        hose,
        lineReg = /127\.0\.0\.1\t/ig,
        hosts = this.getHostsFile().split( "\n" ),
        start = hosts.indexOf( this.header );

    if ( ~start ) {
      end = hosts.indexOf( this.footer ) || hosts.length
      hose = hosts.splice( start, 1 + end - start )

      // TODO: use a more specific filter
      hose = hose.filter(function(element, index, array) {
        return (element.indexOf('#') != 0);
      });

      // TODO: make matching more fool-proof
      hose = hose.map( function( line ){
        return line.replace(lineReg, '');
      });
    }

    return hose || [];
  },

  set: function() {
    for ( var i = arguments.length; i--; ) this[ arguments[ i ] ] = true

    return this.save()
  },

  unset: function() {
    var domains = 0 in arguments ? arguments : this.domains()

    for ( var i = domains.length; i--; ) delete this[ domains[ i ] ]

    return this.save()
  },

  toString: function() {
    return this.domains()
      .map( function( x ){ return "127.0.0.1\t" + x } )
      .join( "\n" )
  },

  // attempt to flush the DNS
  flushDNS: function() {
    var dnsHandlers = {
      "darwin": function() {
        exec("dscacheutil -flushcache");
      },
      "win32": function() {
        exec("ipconfig /flushdns");
      },
      "linux": function() {
        // TODO: check if nscd is installed
        exec("/etc/rc.d/init.d/nscd restart");
      }
    };

    if (typeof dnsHandlers[platform] ) {
      dnsHandlers[platform]();
    }
    else {
      throw "No DNS flush available for this platform.";
    }
  },

  getHostsFile: function() {
    var hostsPath = this.hostsPath
        , hosts;

    try {
      hosts = fs.readFileSync( hostsPath, "utf8" );
      return hosts;
    }
    catch ( e ) { throw hostsPath + " does not exist or cannot be read." };
  },

  // add additional passed domains without deleting existing ones
  add: function() {
    var currentDomains = this.list()
      , allDomains;

    // add any existing domains
    for ( var i = currentDomains.length; i--; ) this[ currentDomains[ i ] ] = true

    // add requested domains
    for ( var ii = arguments.length; ii--; ) this[ arguments[ ii ] ] = true;

    this.save();
  },

  save: function() {
    var hosts, start, end;

    hosts = this.getHostsFile().split( "\n" );
    start = hosts.indexOf( this.header )

    if ( ~start ) {
      end = hosts.indexOf( this.footer ) || hosts.length
      hosts.splice( start, 1 + end - start )
    }

    this.domains().length && hosts.push(
      this.header, this.description, this.toString(), this.footer
    )

    try { fs.writeFileSync( this.hostsPath, hosts.join( "\n" ) ) }
    catch ( e ){ throw this.hostsPath + " is not writeable.\n" + e }

    this.flushDNS();



    return this
  }
}

module.exports = new Localhoses