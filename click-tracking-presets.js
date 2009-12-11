(function(){
	if(clickTrackingLib == undefined) clickTrackingLib = {};

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