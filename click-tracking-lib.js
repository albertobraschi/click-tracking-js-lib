(function(){
	function _clickTrackingLib(){
		var matchAry = [];
		var RegExpCache = [
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

			setTimeout( 'window.location = "' + targ.href + '"', delay );

			return false;
		}

		this.addMatch = function( match ){
			matchAry.push( match );
		}

		this.addMatches = function( matches ){
			matchAry = matchAry.concat( matches );
		}

		this.attachTrackingFunctions = function( delay ){
			if(matchAry.length == 0 || document.links.length == 0) return;

			var link,
				links = document.links,
				i = links.length - 1,
				recordAry = [];
				linksChanged = [],
				delay = (delay != undefined) ? ((delay) ? delay : false) : 99;

			for( ; i >= 0; i-- ){
				link = links[i];
	
				(function( link, matchAry ){
					for(var j = 0; j < matchAry.length; j++ ){
						if( matchAry[j].match( link ) ){
							if (delay && !recordAry[i]) {
								recordAry[i] = true;
								linksChanged.push(link);
							}
	
							(function(j){
								addClickEvent( link, function( e ){
									matchAry[j].trackingFunc( e, link );
								});
							})(j);
						}
					}
				})( link, matchAry );
			}

			if(delay === false) return;

			var delayFunc = function(e){
				delayClickEventHandler(e, delay)
			}

			for( i = linksChanged.length - 1; i >= 0; i-- ){
				link = linksChanged[i];

				if ( (link.target && (link.target == "_blank" || link.target == "_new") || !link.protocol.match(RegExpCache[3])) ) continue;
				link.setAttribute("onclick","return false;");

				addClickEvent( link, delayFunc );
			}
		}
	};

	clickTrackingLib = new _clickTrackingLib();
	clickTrackingLib._clickTrackingLib = _clickTrackingLib;
})();