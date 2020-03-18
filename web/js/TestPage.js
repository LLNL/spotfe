/*
How to Generate data:
cd /usr/global/web-pages/lc/www/spot/dcvis/generate

# this will create a directory called 5000 underneath ~/lulesh_gen/
# it will contain 5000 auto generated cali files.
python3 MakeCali.py 5000


# this will create a directory called 5000 underneath ~/lulesh_gen/multi/
python3 MakeCali.py 5000 multi


 */
var TEST = function() {

    var testList = [];

    var add_test_ = function( count, luly, show ) {

        show = show || [];

        testList.push({
            "page": count,
            "localhost": show[0] === 0 ? "" : "http://localhost:8888/" + luly,
            "cz_d2": show[1] === 0 ? "" : 'https://lc.llnl.gov/spot/dcvis/' + luly,
            "rz_d2": show[2] === 0 ? "" : 'https://rzlc.llnl.gov/spot/dcvis/' + luly,
            "cz_l2": show[3] === 0 ? "" : 'https://lc.llnl.gov/spot2/' + luly,
            "rz_l2": show[4] === 0 ? "" : 'https://rzlc.llnl.gov/spot2/' + luly
        });
    };


    var init_ = function() {

        var num = [15, 100, 500, 1000, 2000, 5000, 10000,
            14500, 32000, 95000, 350000, "multi25", "multi250", "multi10000", "multi32000", "deep_dir_5"];

        for (var x in num) {

            var count = num[x];

            var luly = '?sf=/usr/gapps/spot/datasets/lulesh_gen/' + count;
            add_test_( count, luly );
        }

        add_test_( "RZ Only Siboka/nathan", '?machine=rztopaz&command=/collab/usr/gapps/wf/spot/sina-spot-dev.py&sf=/usr/gapps/wf/siboka_team/sina/uqacam_FS.sqlite', [0,0,1,0,1]);


        Vue.component('link-rows', {
            data: function () {
                return {
                    testList: testList
                }
            },
            template: '    <table class="testing">\
        <thead>\
            <tr>\
                <td>Test Page</td>\
                <td>Localhost</td>\
                <td>CZ D2  - Dev</td>\
                <td>RZ D2  - Dev</td>\
                <td>CZ L2  - Live</td>\
                <td>RZ L2  - Live</td>\
            </tr>\
        </thead>\
\
        <tbody>\
            <tr v-for="row in testList">\
            \
            <td>{{row.page}}</td>\
            \
            <td>\
                <a v-if="row.localhost !== \'\'" v-bind:href="row.localhost" target="_blank">{{row.page}}</a>\
            </td>\
            \
            <td>\
                <a v-if="row.cz_d2 !== \'\'" v-bind:href="row.cz_d2" target="_blank">{{row.page}}</a>\
            </td>\
            \
            <td>\
                <a v-if="row.rz_d2 !== \'\'" v-bind:href="row.rz_d2" target="_blank">{{row.page}}</a>\
            </td>\
            \
            <td>\
                <a v-if="row.cz_l2 !== \'\'" v-bind:href="row.cz_l2" target="_blank">{{row.page}}</a>\
            </td>\
            \
            <td>\
                <a v-if="row.rz_l2 !== \'\'" v-bind:href="row.rz_l2" target="_blank">{{row.page}}</a>\
            </td>\
            </tr>\
        </tbody>\
\
    </table>'
        });

        var app = new Vue({
            el: "#app"
        })
    };

    init_();
}();