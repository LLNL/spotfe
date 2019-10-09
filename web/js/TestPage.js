var TEST = function() {

    var num = [15,100,1000,2000,10000,14500,32000,96000];
    var testList = [];

    for( var x in num ) {

        var count = num[x];

        testList.push({
            id: x,
            page: count,
            "cz_d2": 'https://lc.llnl.gov/spot/dcvis/?sf=/g/g0/pascal/lulesh_gen/' + count,
            "rz_d2": 'https://rzlc.llnl.gov/spot/dcvis/?sf=/g/g0/pascal/lulesh_gen/' + count,
            "cz_l2": 'https://lc.llnl.gov/spot2/?sf=/g/g0/pascal/lulesh_gen/' + count,
            "rz_l2": 'https://rzlc.llnl.gov/spot2/?sf=/g/g0/pascal/lulesh_gen/' + count,
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