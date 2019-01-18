ST.MakeNiceData = function() {

    var choose_rand_ = function( myArray ) {

        var max = Math.random() < 0.3 ? 0.7 : 1;
        var rand = Math.random() * max;

        return myArray[Math.floor(rand * myArray.length)];
    };

    var dice_ = function( num ) {

        var r = Math.random() * num;
        var round = Math.round( r );

        return round + "";
    };


    var make_ = function( old ) {

        var compilers = ['-03', '-O4', '-Topography', '-Pinned', '-fabi-version', '-Wnoexcept', '-fgnu_runtime', '-fno-nil-receivers', '-fno-local-ivars', '-fno-show-column'];
        var comp_versions = ["Intel", "Clang", "GNU 8.2", "GNU 8.1", "GNU 8.0", "GNU 7.2", "Clang 2"];
        var code_builder = ["dzpolia", "mlegendre", "kadam", "pwatson", "jlangley", "sbecker", "jrex", 'dmoffet', 'skennedy', 'jgyllenhaal', 'grancet'];

        for( var t = 0; t < old.length; t++ ) {

            old[t]['Compiler Flags'] = choose_rand_( compilers );
            old[t]['Compiler Name'] = choose_rand_( comp_versions );
            old[t]['Problem Size'] = dice_(40);
            old[t]['Number of Regions'] = dice_(12);
            old[t]['Code Builder'] = choose_rand_( code_builder );
        }
    };

    return {
        make: make_
    }
}();