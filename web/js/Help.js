var help_icon_ = function( file, params ) {

    var old_urls = [
        "https://rzlc.llnl.gov/spot/dcvis/web/?sf=/usr/gapps/spot/datasets/jit_data&layout=/usr/gapps/spot/datasets/jit.json",
        "https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/global/web-pages/lc/www/spot/lulesh2small",
        //Asperational: https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/global/web-pages/lc/www/spot/lulesh2small&machine=oslic&command=/usr/tce/bin/python3%20/usr/global/web-pages/lc/www/spot/spot.py&get_rundata_url=https://lc.llnl.gov/lorenz/lora/lora.cgi/command/oslic",
        "https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/gapps/spot/datasets/lulesh2small&layout=/usr/gapps/spot/datasets/enhanced_layout.json",
        "https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/gapps/spot/datasets/lulesh2small&layout=/usr/gapps/spot/datasets/enhanced_layout_label.json",
        "https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/gapps/spot/datasets/lulesh2small&layout=/usr/gapps/spot/datasets/enhanced_layout.json&" + ST.LAST_DAYS + "=70&exe_compare=1"
    ];

    var urls = [
        "https://lc.llnl.gov/spot/dcvis/",
        "https://rzlc.llnl.gov/spot/dcvis/",
        "https://lc.llnl.gov/spot2/",
        "https://rzlc.llnl.gov/spot2/",
    ];

    var working_html = "";

    for( var x = 0; x < urls.length; x++ ) {

        var url = urls[x];
        working_html += '<div><a href="' + url + '" target="_blank">' + url + '</a></div>';
    }

    Vue.component('help-section', {
        data: function () {
            return {
                seen: false,
                max: params.max,
                file: file,
                machine: params.machine,
                layout: params.layout,
                get_rundata_url: params.get_rundata_url,
                command: params.command
            }
        },
        template: '<div>' +
        '<div class="help_icon icon myButton" v-on:click="seen=(!seen)"><div class="inner"></div></div>\
        <div class="help_body" v-if="seen">\
        Using file: <span class="txt">{{ file }}</span>\
        <br>Using max: <span class="max">{{ max }}</span>\
        <br>Using machine: <span class="machine">{{ machine }}</span>\
        <br>Using layout: <span class="machine">{{ layout }}</span>\
        <br>Using get_rundata_url URL: <span class="machine">{{ get_rundata_url }}</span>\
        <br>Using command: <span class="machine">{{ command }}</span>\
        <br>You can specify the <b>s</b>pot <b>f</b>ile with sf= in the url bar.\
        <br>You can specify the <b>max</b> with max= in the url bar.\
        <br>You can specify the <b>machine</b> with machine= in the url bar. \
        <br>You can specify the <b>layout</b> with layout= in the url bar. \
        <br>You can specify the <b>get_rundata_url</b> with get_rundata_url= in the url bar.\
        <br>You can specify the <b>command</b> with command= in the url bar.\
        \
        <br><a href="web/docs/doc.html" target="_blank">more...</a> \
        <div>Urls:</div>' +
        working_html + '</div> ' +
        '</div>',
        methods: {
        }
    });

    //  Need to find the dc.js end event handler.
    new Vue({
        el: "#help_icon"
    });
};
