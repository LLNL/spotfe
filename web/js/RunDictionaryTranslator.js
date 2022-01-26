ST.RunDictionaryTranslator = function() {

    var dict_ = {};

    var set_ = function( dictionary ) {

        dict_ = dict_ || {};

        for( var laymanStr in dictionary ) {

            var encodedVal = dictionary[laymanStr];
            dict_[ encodedVal ] = laymanStr;
        }

        console.dir( dict_ );
    };

    //  Example string inputs: "read restart ce (0)", "b$"
    var lookupStr_ = function( str ) {

        var arr = typeof str === 'string' ? str.split(' ') : [];
        var total = "";

        for( var z=0; z < arr.length; z++ ) {

            var stringPart = arr[z];
            var lookStr = lookup_( stringPart );
            total += lookStr + ' ';
        }

        return total;
    };


    var lookup_ = function( encodedValue ) {

        var ret = dict_[ encodedValue ] || encodedValue;
        //console.log( ret );
        return ret;
    };

    //  Translate Dictionary
    var translate_ = function( runPlusDictionary ) {

        //return runPlusDictionary;
        var newRunPlusDict = jQuery.extend({}, runPlusDictionary );

        var dict = runPlusDictionary.dictionary;
        var runs = runPlusDictionary.Runs;
        var newRuns = {};

        //  run_name is like am1-gen-0, etc.
        for( var runName in runs ) {

            var dat = runs[runName].Data;
            var globs = runs[runName].Globals;

            var def = {
                'Data': {},
                'Globals': globs
            };

            newRuns[ runName ] = newRuns[ runName ] || def;

            var yAxisObj = {
                        'yAxis': 0
                    };

            for( var rootPath in dat ) {

                var sRootPath = '/' + rootPath;
                yAxisObj = dat[rootPath] || {
                        'yAxis': 0
                    };

                var newRootPath = replacePath_( sRootPath, dict );

                if( newRootPath.charAt(0) === '/') {
                    newRootPath = newRootPath.substr(1);
                }

                newRuns[ runName ].Data[ newRootPath ] = yAxisObj;
                //newRuns[ runName ].Data[ '' ] = yAxisObj;
            }
        }

        console.dir( newRuns );
        console.dir( newRunPlusDict);

        newRunPlusDict.Runs = newRuns;

        return newRunPlusDict;
    };


    var replacePath_ = function( s_root_path, dict ) {

        for( var original_str in dict ) {

            var s_original_str = '/' + original_str;
            var encoded = dict[original_str];
            s_root_path = s_root_path.replace( '/' + encoded, s_original_str );
        }

        return s_root_path;
    };


    return {
        translate: translate_,
        lookupStr: lookupStr_,
        lookup: lookup_,
        set: set_
    };
}();
