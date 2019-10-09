var TEST = function() {

    var num = [15,100,500,1000,2000,5000,10000,14500,32000,96000];
    var testList = [];

    for( var x in num ) {

        var count = num[x];

        var luly = '?sf=/g/g0/pascal/lulesh_gen/' + count;

        testList.push({
            id: x,
            page: count,
            "localhost": "http://localhost:8888/" + luly,
            "cz_d2": 'https://lc.llnl.gov/spot/dcvis/' + luly,
            "rz_d2": 'https://rzlc.llnl.gov/spot/dcvis/' + luly,
            "cz_l2": 'https://lc.llnl.gov/spot2/' + luly,
            "rz_l2": 'https://rzlc.llnl.gov/spot2/' + luly
        });
    }

    Vue.component('link-rows', {
        data: function() {
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
            <td>{{row.page}}</td>\
            <td><a v-bind:href="row.localhost" target="_blank">{{row.page}}</a></td>\
            <td><a v-bind:href="row.cz_d2" target="_blank">{{row.page}}</a></td>\
            <td><a v-bind:href="row.rz_d2" target="_blank">{{row.page}}</a></td>\
            <td><a v-bind:href="row.cz_l2" target="_blank">{{row.page}}</a></td>\
            <td><a v-bind:href="row.rz_l2" target="_blank">{{row.page}}</a></td>\
            </tr>\
        </tbody>\
\
    </table>'
    });

    var app = new Vue({
        el: "#app"
    })
}();