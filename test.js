var assert = require( "assert" )
  , http = require( "http" )
  , localhose = require( "localhose" ).unset()
  
  , url = require( "url" ).parse( "http://nodejs.org/" )
  , sassyTitle = "rYah'S aweSOmE homEpagE!"

  , server = http.createServer( handler )

server.listen( 80 )

getTitle( url, function( title ) {
  console.log( "\nfetching title for " + url.host )
  console.log( "- expected title: node.js" )
  console.log( "- actual title:   " + title )

  assert.equal( title, "node.js" )
  
  localhose.set( url.host )

  getTitle( url, function( title ) {
    console.log( "\nfetching title for " + url.host )
    console.log( "- expected title: " + sassyTitle )
    console.log( "- actual title:   " + title )

    assert.equal( title, sassyTitle )

    localhose.unset()

    getTitle( url, function( title ) {
      console.log( "\nfetching title for " + url.host )
      console.log( "- expected title: node.js" )
      console.log( "- actual title:   " + title )
    
      assert.equal( title, "node.js" )

      server.close()
    })
  })
})

function handler( req, res ) {
  res.writeHead( 200, { "Content-Type": "text/html" } )
  res.end(
    "<html>" +
      "<head><title>" + sassyTitle + "</title></head>" +
      "<body>welcome to " + sassyTitle + "</body>" +
    "</html>"
  )
}

function getTitle( uri, cb ) {
  var body = ""

  http.get( url, function( res ) {
    res
      .on( "data", function( data ){ body += data } )
      .on( "end", function(){ cb( ( /<title>([^<]+)/( body ) || [] )[ 1 ] ) } )
  })
}