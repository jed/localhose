var fs = require( "fs" )
  , exec = require( "child_process" ).exec
  , Localhoses = function(){}
  
if ( process.platform != "darwin" ) throw "Sorry, only tested on OS X."
  
Localhoses.prototype = {
  hostsPath: "/private/etc/hosts",
  backupSuffix: ".localhoseBackup",

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
  
  teardown: function() {
    var hostsPath = this.hostsPath
      , backupPath = hostsPath + this.backupSuffix
      , backup
      
    try {
      backup = fs.readFileSync( backupPath )
      fs.unlinkSync( backupPath )
      fs.writeFileSync( hostsPath, backup )
    }
    
    catch( e ){}
    
    return this
  },

  toString: function() {
    return [ "\n\n# The following were added by 'localhose':" ]
      .concat( this.domains() )
      .join( "\n127.0.0.1\t" )
  },

  save: function() {
    exec( "dscacheutil -flushcache" )

    if ( !this.domains().length ) return this.teardown()

    var hostsPath = this.hostsPath
      , backupPath = hostsPath + this.backupSuffix
      , hosts, backup
      
    try { hosts = fs.readFileSync( hostsPath ) }
    catch ( e ) { throw "/etc/hosts does not exist or cannot be read." }

    try { backup = fs.readFileSync( backupPath ) }
    catch ( e ) {
      try { fs.writeFileSync( backupPath, backup = hosts ) }
      catch ( e ){ throw backupPath + " is not writeable." }
    }
    
    fs.writeFileSync( hostsPath, backup + this.toString() )
    
    return this
  }
}

module.exports = new Localhoses