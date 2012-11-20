#!/usr/bin/env node

var localhose = require( "./lib/localhose" )
  , method = process.argv[ 2 ]
  , args = process.argv.slice( 3 )

localhose[ method ].apply( localhose, args )