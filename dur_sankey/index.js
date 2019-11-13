
var dirme = function( cali ) {

    var dir = "/usr/gapps/wf/web/spot/data/lulesh_minimal/";
    return dir + " " + cali + ' ';
};

var get_dirs_ = function() {

    var calis = localStorage.getItem('calis');
    var spi = calis.split(' ');

    //spi = spi.splice(0,68);
    calis = spi.join(' ');
    return calis;

    //var calis = ST.Utility.get_param("calis");
    //return calis;
};


$(document).ready(  function() {

    ST.Utility.init_params();

    var dirs = dirme("180926-171347_114610_dFcHlCXdiuQG.cali") +
        dirme("180926-171354_114737_llIMtdhrtFBl.cali") +
        dirme("180926-171351_45280_H6AUaDgoCQ0n.cali") +
        dirme("180926-171348_171822_1yPFpzkcG7G3.cali");

    dirs = get_dirs_();
    console.dir(dirs);

    //var dir = "/usr/gapps/wf/web/spot/data/lulesh_maximal/";
    var dur = ""; //ST.params.duration_key + ' ';

    var dir = ST.Utility.get_param('sf');
    var predir = " " + dir + " " + dur + " --filenames ";
    var command = ST.Utility.get_param('command');
    command = decodeURIComponent(command);

    ST.SeriesHier.run( predir, dirs, command );
});



var init = function( dat ) {

    if (dat.error) {
        $('body').append('<span class="error">' + dat.error + '</span>');
    }

    const data = JSON.parse(dat.output.command_out);// put data from server here obtained from "spot.py durations2 <filepath1> [filepath2]*"

    init_with_ar_( data );
};


var init_with_ar_ = function(data) {

    console.dir(data);

    //var location = localStorage.getItem('location.href');

    ST.UrlStateManager.update_url('exe_compare', '1');
    ST.UrlStateManager.update_slash('');

    //console.log('xaxis=' + xaxis + '   groupby=' + groupby);
    var xaxis = ST.Utility.get_param('xaxis', true);
    var groupby = ST.Utility.get_param('groupby', true);
    var yaxis = ST.Utility.get_param('yaxis', true);
    yaxis = decodeURIComponent(yaxis);

    var aggregate = ST.Utility.get_param('aggregate', true);


    if( is_defined(xaxis) ) {
        app.ports.setXaxis.send(xaxis);     // set Xaxis here
    }

    if( is_defined(groupby) ) {
        app.ports.setGroupBy.send(groupby);  // set Groupby
    }

    if( is_defined(yaxis) ) {
        app.ports.setYaxis.send(yaxis);
    }

    if( is_defined(aggregate) ) {
        app.ports.setAggregate.send(aggregate);
    }
};

var is_defined = function( str ) {
    return str && str !== "" && str !== "undefined";
};