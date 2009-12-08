function _clickTrackingLib(){
	var matchAry = [];
	var RegExpCache = [
		/(^|\s)external(\s|$)/i, //external links
		/\.(docx*|xlsx*|pptx*|exe|zip|pdf|xpi|rar|xls)$/i
	];

	var matchPresets = [
		function( a ){
			// matches rel-external links
			if( a.getAttribute("rel").match(RegExpCache[0]) ) return true;
			return false;
		},
		function( a ){
			// matches external hostname links
			if( a.hostname != document.location.hostname ) return true;
			return false;
		},
		function( a ){
			// matches all rel-external and external hostname links
			if( matchPresets[0](a) || matchPresets[1](a) ) return true;
			return false;
		},
		function( a ){
			// matches file names
			if( a.pathname.match(RegExpCache[1]) ) return true;
			return false;
		}
	];

	this.getMatchPreset( index ){
		switch(index){
			case 'rel-external':
				return matchPresets[0];
			case 'external-hostname':
				return matchPresets[1];
			case 'all-external':
				return matchPresets[2];
			case 'filetypes':
				return matchPresets[3];
		}
		throw "No preset found for " + index;
	}

	if (document.body.addEventListener){
		var addClickEvent = function( ele, evt ){
			ele.addEventListener( "click", evt, false );
		}
	}
	else if ( document.body.attachEvent ){
		var addClickEvent = function( ele, evt ){
			ele.attachEvent( "onclick", evt );
		}
	}

	var delayClickEventHandler = function( e, delay ){
		if (!e) var e = window.event;

		var targ;
		if (e.target) targ = e.target;
		else if (e.srcElement) targ = e.srcElement;
		// Safari bug
		if (targ.nodeType == 3) targ = targ.parentNode;

		if ( !targ.href && targ.target && targ.target == "_blank" ) return;

		setTimeout( 'window.location = "' + targ.href + '"', delay );

		return false;
	}

	this.addMatch = function( match ){
		matchAry.push( match );
	}

	this.addMatches = function( matches ){
		matchAry.concat( matches );
	}

	this.attachTrackingFunctions = function( delay ){
		if(matchAry.length == 0) return;

		var link,
			links = document.links,
			i = links.length - 1,
			linksChanged = [];

		if(links.length == 0) return;

		for( ; i >= 0; i-- ){
			link = links[i];
			j = matchAry.length - 1;

			(function( link, matchAry ){
				for(var j = matchAry.length - 1; j >= 0; j-- ){
					if( matchAry[j].match( link ) ){
						linksChanged.push( link );

						addClickEvent( link, function( e ){
							matchAry[j].trackingFunc( e, link );
						} );
					}
				}
			})( link, matchAry );
		}

		if(delay === false) return;

		i = linksChanged.length - 1;
		(function( delay ){
			for( ; i >= 0; i-- ){
				addClickEvent( linksChanged[i], function(e){
					delayClickEventHandler( e, delay )
				} );
			}
		})( (isNaN(delay)) ? 99 : delay );
	}
};