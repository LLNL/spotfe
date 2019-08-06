
var dirme = function( cali ) {

    var dir = "/usr/gapps/wf/web/spot/data/lulesh_minimal/";
    return dir + " " + cali + ' ';
};

var get_dirs_ = function() {

    var calis = localStorage.getItem('calis');
    var spi = calis.split(' ');

    spi = spi.splice(0,68);
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

    ST.CallSpot.ajax({
        file: predir + dirs,
        command: command,
        type: 'hierarchical',
        success: init
    });
});


var init = function( dat ) {

    if( dat.error ) {
        $('body').append( '<span class="error">' + dat.error + '</span>');
    }

    const data = JSON.parse(dat.output.command_out);// put data from server here obtained from "spot.py durations2 <filepath1> [filepath2]*"

    console.dir(data);

    //var location = localStorage.getItem('location.href');

    ST.UrlStateManager.update_url('exe_compare', '1');
    ST.UrlStateManager.update_slash('');

    //console.log('xaxis=' + xaxis + '   groupby=' + groupby);
    var xaxis = ST.Utility.get_param('xaxis', true);
    var groupby = ST.Utility.get_param('groupby', true);


    // elm init from main.js
    let app = Elm.Main.init(
        {
            node: document.querySelector('#durations-chart'),
        });

    app.ports.setData.send(data);
    app.ports.setXaxis.send(xaxis);     // set Xaxis here
    app.ports.setGroupBy.send(groupby);  // set Groupby

    app.ports.xAxisChanged.subscribe( function( val ) {

        ST.UrlStateManager.update_url('xaxis', val);
    });

    app.ports.groupByChanged.subscribe( function( val ) {

        ST.UrlStateManager.update_url('groupby', val);
    });
};