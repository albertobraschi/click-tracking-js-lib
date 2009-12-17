(function(){
	function _clickTrackingLib(){
		var matchAry = [], RegExpCache = [/^(http|ftp|chrome|file|view-source)/i];

		if ( document.body.addEventListener ) {
			// w3c
			var addClickEvent = function( ele, evt ){
				ele.addEventListener( "click", evt, false );
			};
		}
		else if ( document.body.attachEvent ) {
			var addClickEvent = function( ele, evt ){
				ele.attachEvent( "onclick", evt );
			};
		}

		if ( document.body.removeEventListener ) {
			// w3c
			var removeClickEvent = function( ele, evt ){
				ele.removeEventListener( "click", evt, false );
			};
		}
		else if ( document.body.detachEvent ) {
			var removeClickEvent = function( ele, evt ){
				ele.detachEvent( "onclick", evt );
			};
		}

		var delayClickEventHandler = function( e, delay ){
			if ( !e ) var e = window.event;

			var targ;
			if ( e.target ) targ = e.target;
			else if ( e.srcElement ) targ = e.srcElement;
			// Safari..
			if ( targ.nodeType == 3 ) targ = targ.parentNode;

			setTimeout( 'window.location = "' + targ.href + '"', delay );

			// disable the click event default functionality
			if (e.preventDefault) e.preventDefault(); // w3c
			else e.returnValue  = false; // for ie

			return false;
		};

		this.addMatch = function( match ){
			matchAry.push( match );
		};

		this.addMatches = function( matches ){
			matchAry = matchAry.concat( matches );
		};

		this.attachTrackingFunctions = function( links, delay ){
			if ( matchAry.length == 0 ) return;

			var links = ( links && links.href ) ? [links] : ( links && links.length ) ? links : ( !links ) ? document.links : [];

			if (!links.length) return;

			var link,
				matchAryLen = matchAry.length,
				delay = (delay != undefined) ? ((delay) ? delay : false) : 99;

			if (delay) {
				var delayFunc = function(e){
					delayClickEventHandler(e, delay);
				};
			}

			// loop through the links
			for (var i = links.length - 1; i >= 0; i--) {
				link = links[i];

				// get a reference to the current link which can be used later
				(function( link ){
					// loop through the the remaining match functions in the array of provided match functions
					for ( var j = 0; j < matchAryLen; j++ ) {
						// check link with provided match function
						if ( matchAry[j].match( link ) ) {
							// Add provided click event wrapped in another lambda providing a reference to the link element
							(function( j ){
								// Attach the wrapper lambda to the link's click event
								addClickEvent( link, function( e ){
									matchAry[j].trackingFunc( e, link );
								});
							})( j );
						}
					}
				})( link );

				// check if a delay function should be applied
				if (
					delay === false ||
					( link.target && ( link.target == "_blank" || link.target == "_new" ) ) ||
					!link.protocol.match( RegExpCache[0] )
				) continue;

				// add delay function which will redirect the user to the desired href after a small delay
				addClickEvent( link, delayFunc );
			}

			return;
		};
	}

	// create the main clickTrackingLib instance
	clickTrackingLib = new _clickTrackingLib();

	// if you want to make new click tracking helper objects, then use this method.
	clickTrackingLib._clickTrackingLib = _clickTrackingLib;

	var RegExpCache = [
			/(^|\s)external(\s|$)/i, //external links
			/\.(docx*|xlsx*|pptx*|exe|zip|pdf|xpi|rar|xls)$/i,
			/^http/i
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

	clickTrackingLib.getMatchPreset = function( index ){
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
	};
})();