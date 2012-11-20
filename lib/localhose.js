var fs = require( "fs" )
  , path = require( "path" )
  , exec = require( "child_process" ).exec
  , Localhoses = function(){}
  , platform = process.platform

if ( platform != "darwin" && platform != "win32" ) throw "Sorry, only tested on OS X and Windows."

Localhoses.prototype = {
  hostsPath: ( platform == "darwin" ) ? "/private/etc/hosts" : path.join(process.env["WinDir"], "System32", "drivers", "etc", "hosts"),

  header:
    "# <localhose>",

  description:
    "# The following have been added temporarily by Localhose\n" +
    "# For more information, see https://github.com/jed/localhose",

  footer:
    "# </localhose>",

  domains: function(){ return Object.keys( this ) },

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

  save: function() {
    var hostsPath = this.hostsPath
      , hosts, start, end

    try {
      hosts = fs.readFileSync( hostsPath, "utf8" ).split( "\n" )
      start = hosts.indexOf( this.header )
      
      if ( ~start ) {
        end = hosts.indexOf( this.footer ) || hosts.length
        hosts.splice( start, 1 + end - start )
      }

      this.domains().length && hosts.push(
        this.header, this.description, this.toString(), this.footer
      )

      try { fs.writeFileSync( hostsPath, hosts.join( "\n" ) ) }
      catch ( e ){ throw hostsPath + " is not writeable." }

      exec( "dscacheutil -flushcache" )
    }

    catch ( e ) { throw hostsPath + " does not exist or cannot be read." }
    
    return this
  }
}

module.exports = new Localhoses