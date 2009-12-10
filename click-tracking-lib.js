(function(){
	function _clickTrackingLib(){
		var matchAry = [],
			testedLinksCache = [],
			RegExpCache = [
				/(^|\s)external(\s|$)/i, //external links
				/\.(docx*|xlsx*|pptx*|exe|zip|pdf|xpi|rar|xls)$/i,
				/^http/i,
				/^(http|ftp|chrome|file|view-source)/i
			];

		var matchPresets = [
			function( a ){
				// matches rel-external links
				return ( a.getAttribute("rel") && a.getAttribute("rel").match(RegExpCache[0]) ) ? true : false;
			},
			function( a ){
				// matches external hostname links
				return ( a.hostname != document.location.hostname ) ? true : false;
			},
			function( a ){
				// matches all rel-external and external hostname links
				return ( matchPresets[0](a) || matchPresets[1](a) ) ? true : false;
			},
			function( a ){
				// matches file names
				return ( a.pathname.match(RegExpCache[1]) ) ? true : false;
			},
			function( a ){
				// matches non-rel-external links
				return ( !a.getAttribute("rel") || !a.getAttribute("rel").match(RegExpCache[0]) ) ? true : false;
			},
			function( a ){
				// matches internal hostname links
				return ( a.protocol.match(RegExpCache[2]) && a.hostname == document.location.hostname ) ? true : false;
			},
			function( a ){
				// matches non-rel-external links or internal hostname links
				return ( matchPresets[4](a) || matchPresets[5](a) ) ? true : false;
			}
		];

		this.getMatchPreset = function( index ){
			switch(index){
				case 'rel-external':
					return matchPresets[0];
				case 'external-hostname':
					return matchPresets[1];
				case 'all-external':
					return matchPresets[2];
				case 'filetypes':
					return matchPresets[3];
				case 'non-rel-external':
					return matchPresets[4];
				case 'internal-hostname':
					return matchPresets[5];
				case 'all-internal':
					return matchPresets[6];
			}

			throw "No preset found for '" + index + "'";
		}

		if (document.body.addEventListener){
			var addClickEvent = function( ele, evt ){
				ele.addEventListener( "click", evt, false );
			};
		}
		else if ( document.body.attachEvent ){
			var addClickEvent = function( ele, evt ){
				ele.attachEvent( "onclick", evt );
			};
		}

		if (document.body.removeEventListener){
			var removeClickEvent = function( ele, evt ){
				ele.removeEventListener( "click", evt, false );
			};
		}
		else if ( document.body.detachEvent ){
			var removeClickEvent = function( ele, evt ){
				ele.detachEvent( "onclick", evt );
			};
		}

		var createNewTestCacheEntry = function( link, lastMatchIndex, clickFunctions, delayFunction, delay ){
			var newTestCacheEntry = {
				link: link,
				lastMatchIndex: (lastMatchIndex) ? lastMatchIndex : 0,
				clickFunctions: (clickFunctions) ? clickFunctions : [],
				delayFunction: delayFunction,
				delay: delay
			};

			return newTestCacheEntry;
		};

		var addTestCacheEntry = function( link, lastMatchIndex, clickFunctions, delayFunction, delay ){
			var newTestCacheEntry = createNewTestCacheEntry( arguments );

			// add test cache entry to cache array
			testedLinksCache.push(newTestCacheEntry);

			return newTestCacheEntry;
		};

		var replaceTestCacheEntry = function( index ){
			var testCacheEntry = testedLinksCache[i],
				newTestCacheEntry = createNewTestCacheEntry( testCacheEntry.link );

			// detach click events from link
			for( var i = 0; i < testCacheEntry.clickFunctions.length; i++ ){
				removeClickEvent( testCacheEntry.link, testCacheEntry.clickFunctions[i] );
			}

			// detach delay event from link
			if( testCacheEntry.delayFunction ) removeClickEvent( testCacheEntry.link, testCacheEntry.delayFunction );

			return testedLinksCache[ index ] = newTestCacheEntry;
		};

		var delayClickEventHandler = function( e, delay ){
			if (!e) var e = window.event;

			var targ;
			if (e.target) targ = e.target;
			else if (e.srcElement) targ = e.srcElement;
			// Safari bug
			if (targ.nodeType == 3) targ = targ.parentNode;

			setTimeout( 'window.location = "' + targ.href + '"', delay );

			return false;
		};

		this.addMatch = function( match ){
			matchAry.push( match );
		};

		this.addMatches = function( matches ){
			matchAry = matchAry.concat( matches );
		};

		this.attachTrackingFunctions = function( links, delay, clean ){
			if(matchAry.length == 0) return;

			var doCleanUp = false;
			var links = ( links.href ) ? [links] : ( links.length ) ? links : (!links) ? (function(){
				doCleanUp = true;
				return document.links;
			})() : [];

			if( !links.length ) return;

			var link,
				i = links.length - 1,
				z,
				clickFunc,
				matchAryLen = matchAry.length,
				testCacheEntry,
				cleanUpKeepersAry = [],
				delay = (delay != undefined) ? ((delay) ? delay : false) : 99;

			if(delay){
				var delayFunc = function(e){
					delayClickEventHandler(e, delay)
				};
			}

			linkLoop : for( ; i >= 0; i-- ){
				link = links[i];

				// loop through the array of links already tested
				for( z = testedLinksCache.length - 1; z >= 0; z-- ){
					if (link === testedLinksCache[z].link) {
						if (clean)
							testCacheEntry = replaceTestCacheEntry( z );
						else
							testCacheEntry = testedLinksCache[ z ];

						if( doCleanUp ) cleanUpKeepersAry[z] = true;

						else if (testCacheEntry.lastMatchIndex == matchAryLen)
							continue linkLoop;

						break;
					}
				}
				if(z<0){
					testCacheEntry = addTestCacheEntry( link );
				}

				// get a reference to the current link which can be used later
				(function( link ){
					// loop through the the remaining match functions in the array of provided match functions
					for(var j = testCacheEntry.lastMatchIndex; j < matchAryLen; j++ ){
						// check link with provided match function
						if( matchAry[j].match( link ) ){
							// Add provided click event wrapped in another lambda providing a reference to the link element
							(function(j){
								// Create the wrapper lambda around the provided tracking function
								// Add the wrapper lambda to the test cache entry's click functions array
								testCacheEntry.clickFunctions.push( function( e ){
									matchAry[j].trackingFunc( e, link );
								} );

								// Attach the wrapper lambda to the link's click event
								addClickEvent( link, testCacheEntry.clickFunctions[ testCacheEntry.clickFunctions.length ] );
							})(j);
						}
					}
				})( link );

				// record the length of the match array at the current moment
				testCacheEntry.lastMatchIndex = matchAryLen;

				if( delay === false ){
					if( testCacheEntry.delayFunction ){
						// remove the old delay function
						removeClickEvent( link, testCacheEntry.delayFunction );
						testCacheEntry.delayFunction = undefined;
						testCacheEntry.delay = undefined;
					}
					continue;
				}
				else if( testCacheEntry.clickFunctions.length === 0 ||
					testCacheEntry.delay == delay ||
					( link.target && ( link.target == "_blank" || link.target == "_new" ) ) ||
					!link.protocol.match( RegExpCache[3] )
				) continue;

				// record  new delay function data to test cache entry
				testCacheEntry.delayFunction = delayFunc;
				testCacheEntry.delay = delay;

				link.setAttribute( "onclick", "return false;" );

				addClickEvent( link, delayFunc );
			}

			if( doCleanUp ) doCleanUpHelper( cleanUpKeepersAry );

			return;
		};

		var doCleanUpHelper = function( cleanUpKeepersAry ){
			var startIndex = 0, numToRemove = 0, marker, i = 0;

			for( ; i < testedLinksCache.length; i++ ){
				marker = startIndex + numToRemove + 1;
				if( !cleanUpKeepersAry[i] ){
					if( marker >= i ){
						numToRemove++;
						continue;
					}
					else{
						startIndex = i;
						numToRemove = 1;
					}
				}
				else if ( marker >= i ){
					testedLinksCache.splice( startIndex, numToRemove );
				}
			}
			marker = startIndex + numToRemove + 1;
			if( marker >= i ){
				testedLinksCache.splice( startIndex, numToRemove );
			}

			return;
		};
	};

	clickTrackingLib = new _clickTrackingLib();
	clickTrackingLib._clickTrackingLib = _clickTrackingLib;
})();