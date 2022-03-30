<template lang="pug">
.root(:style="{display:'flex', flexDirection:'column', padding:'20px'}")
    .update_top_down(@click="updateTopDownData")
    .title-row(:style="{display:'flex', justifyContent:'center'}")
        h2 Runs: {{filename}}
    .global-meta(:style="{flex: 1, display:'flex', flexDirection:'column', marginLeft:'20px', overflow:'scroll'}")
        .row(:style="{display:'flex'}" v-for='(metaVal, metaName) in meta') 
            .name(:style="{color:'blue', fontWeight:'bold'}") {{ metaName }} 
            .val(:style="{whiteSpace:'nowrap'}") : {{ metaVal.value }}
    div(v-if='topdownData' style='margin:10px' )
        label(for='showTopdownCb' ) show topdown
            input(type='checkbox' id='showTopdownCb' v-model='showTopdown') 
        
    .topdown(v-if="showTopdown && topdownData")
        TopDown(:topdownData='topdownData' 
                :selectedTopdownNode='selectedTopdownNode'
                @topdownNodeSelected='setTopdownNode'
                )

    .flamegraphRow( v-for='metricObj in metricObjs' :style="{padding:'20px'}")
        h3(:style="{paddingBottom:'10px' }") {{metricObj.alias}}
        FlameGraph(
                :runData='peeledData(data, metricObj.name)'
                :metricName='metricObj.name'
                :showTopdown='showTopdown'
                :topdownData='topdownData'
                :selectedNode='selectedNode'
                :selectedTopdownNode='selectedTopdownNode'
                :handleClick='changePath'
                )
</template>

<script>
import FlameGraph from './Flamegraph.vue'
import TopDown from './Topdown.vue'
import _ from 'lodash'


//  hjk
//Vue.loadScript('../../web/js/jquery-1.11.0.min')

//import * as $ from '../../web/js/jquery-1.11.0.min'
//import * as ST from '../../web/js/Utility.js'

async function lorenz(host, cmd){

    const baseurl = `https://${host.startsWith('rz') ? 'rz': ''}lc.llnl.gov/lorenz/lora/lora.cgi`

    if(process.env.NODE_ENV === 'development' || useJsonp){
        const $ = await import('jquery')
        return new Promise((resolve, reject) => {
            $.ajax({
                dataType:'jsonp',
                url:     baseurl + '/jsonp',
                data:{
                    'via':'post',
                    'route':'/command/' + host,
                    'command':cmd,
                    }
            }).then ( value  => { resolve( value ) }
                    , error => { reject(error) }
            )
        })
    }
    else{
        const formData = new FormData()
        formData.append('command', cmd)

        return fetch( baseurl + '/command/' + host
                    , { method: 'POST' , body: formData }
                    ).then(response => response.json())
                     .then(value => value)
    }
}

//import {get_param} from './functions.js'
        function getUrlVars_() {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
                vars[key] = value;
            });
            return vars;
        };

        var get_param_ = function( param, decode_uri ) {

            var vars = getUrlVars_();
            var ret = vars[param];

            if( decode_uri ) {
                ret = decodeURIComponent( ret );
            }

            return ret;
        };

        window.wall_title = get_param_('title');
console.log("wall_title=" + window.wall_title);

export default {

    props:['filename', 'data', 'meta'],
    data(){return {
        selectedNode: '--root path--',
        selectedTopdownNode: 'fe',
        showTopdown: false,
        replacing_metrics: {},
        wall_title: "",
        ensure_update: false,
        metricObjs: {}
    }},
    mounted: function() {

    },
    computed:{
        funcPaths(){return Object.keys(this.data) },
        metricNames(){ return Object.keys(this.data[this.funcPaths[0]]).filter(name => !name.startsWith('any#any#'))},
        topDownNames(){ return Object.keys(this.data[this.funcPaths[0]]).filter(name => name.startsWith('any#any#'))},
        topdownData(){

            this.filterMetricNames()
            //this.replaceMetricNames( "avg#inclusive#sum#time.duration", "alias2344" )

            console.log('replacing_metrics:');
            console.dir( this.replacing_metrics );

            if( this.replacing_metrics ) {

                for( var met in this.replacing_metrics ) {

                    var alias = this.replacing_metrics[met];

                    this.replaceMetricNames( met, alias )
                }
            } else {
                this.replaceMetricNames("yAxis", "yAxis");
            }

            var is_cali = window.wall_title.indexOf('.cali') > -1;

            if( !is_cali ) {

                var yy = "avg#inclusive#sum#time.duration";
                this.replaceMetricNames( yy, yy );
                delete this.metricObjs['yAxis'];
            }

            //console.dir( this.data )
            console.log('metricobjs 88: ');
            console.log( this.metricObjs );
            console.dir( this.metricNames )
            console.dir( this.selectedNode )
            var peeled = this.peeledData(this.data, this.metricNames[0])

            console.dir( "peeled7777 AAJJ99" );

            var iix = 234;
            //console.dir( peeled )

            let topdown = peeled[this.selectedNode].topdown


            if(topdown){
                topdown = {
                    're': {val: topdown['any#any#topdown.retiring']},

                    'bs': {val: topdown['any#any#topdown.bad_speculation']},
                    'ms': {val: topdown['any#any#topdown.branch_mispredict']},
                    'mc': {val: topdown['any#any#topdown.machine_clears']},

                    'fe': {val: topdown['any#any#topdown.frontend_bound']},
                    'la': {val: topdown['any#any#topdown.frontend_latency']},
                    'bw': {val: topdown['any#any#topdown.frontend_bandwidth']},

                    'be': {val: topdown['any#any#topdown.backend_bound']},
                    'co': {val: topdown['any#any#topdown.core_bound']},
                    'me': {val: topdown['any#any#topdown.memory_bound']},
                    'l1': {val: topdown['any#any#topdown.l1_bound']},
                    'l2': {val: topdown['any#any#topdown.l2_bound']},
                    'l3': {val: topdown['any#any#topdown.l3_bound']},
                    'mb': {val: topdown['any#any#topdown.ext_mem_bound']},
                }
                
                // normalize if sum is greather than 1
                let sum = topdown['re'] + topdown['bs'] + topdown['fe'] + topdown['be']
                sum = sum > 1 ? sum : 1
                topdown['re'].disp = topdown['re'].flame = topdown['re'].val / sum * 100 + '%' 
                topdown['bs'].disp = topdown['bs'].flame = topdown['bs'].val / sum * 100 + '%'
                topdown['fe'].disp = topdown['fe'].flame = topdown['fe'].val / sum * 100 + '%'
                topdown['be'].disp = topdown['be'].flame = topdown['be'].val / sum * 100 + '%'



                sum = topdown['ms'].val + topdown['mc'].val
                sum = sum > 1 ? sum : 1
                topdown['ms'].disp = topdown['ms'].val / sum * 100 + '%'
                topdown['mc'].disp = topdown['mc'].val / sum * 100 + '%'

                topdown['ms'].flame = topdown['ms'].val * topdown['bs'].val / sum * 100 + '%'
                topdown['mc'].flame = topdown['mc'].val * topdown['bs'].val / sum * 100 + '%'

                sum = topdown['la'].val + topdown['bw'].val
                sum = sum > 1 ? sum : 1
                topdown['la'].disp = topdown['la'].val / sum * 100 + '%'
                topdown['bw'].disp = topdown['bw'].val / sum * 100 + '%'

                topdown['la'].flame = topdown['la'].val * topdown['fe'].val / sum * 100 + '%'
                topdown['bw'].flame = topdown['bw'].val * topdown['fe'].val / sum * 100 + '%'


                sum = topdown['co'].val + topdown['me'].val
                sum = sum > 1 ? sum : 1
                topdown['co'].disp = topdown['co'].val / sum * 100 + '%'
                topdown['me'].disp = topdown['me'].val / sum * 100 + '%'

                topdown['co'].flame = topdown['co'].val * topdown['be'].val / sum * 100 + '%'
                topdown['me'].flame = topdown['me'].val * topdown['be'].val / sum * 100 + '%'


                sum = topdown['l1'].val + topdown['l2'].val + topdown['l3'].val + topdown['mb'].val
                sum = sum > 1 ? sum : 1
                topdown['l1'].disp = topdown['l1'].val / sum * 100 + '%'
                topdown['l2'].disp = topdown['l2'].val / sum * 100 + '%'
                topdown['l3'].disp = topdown['l3'].val / sum * 100 + '%'
                topdown['mb'].disp = topdown['mb'].val / sum * 100 + '%'

                topdown['l1'].flame = topdown['l1'].val * topdown['be'].val * topdown['mb'].val / sum * 100 + '%'
                topdown['l2'].flame = topdown['l2'].val * topdown['be'].val * topdown['mb'].val / sum * 100 + '%'
                topdown['l3'].flame = topdown['l3'].val * topdown['be'].val * topdown['mb'].val / sum * 100 + '%'
                topdown['mb'].flame = topdown['mb'].val * topdown['be'].val * topdown['mb'].val / sum * 100 + '%'
                
            }

            return this.ensure_update ? topdown : topdown
        },
    },
    methods:{
        async getDictionary( callback ) {

            var sf = ST.Utility.get_param("runSetId");
            var key = "page_dictionary_" + sf;
            var local_page = localStorage.getItem( key );
            var dictionary =  JSON.parse(local_page);

            console.log('key: ' + key)
            console.log('local dictionary: ');
            console.dir(dictionary);

            ST.RunDictionaryTranslator.set( dictionary );

            //this.updateTopDownData();

            callback();
        },
        async containerAJAX( path, success, fail )
        {

            console.log('containerAJAX() 0');
            const command = "/opt/conda/bin/python3 /usr/gapps/spot/backend.py --config /usr/gapps/spot/backend_config.yaml getTimeseriesData /data/" +
                path;

            var datarequest = {
                command: command,
                filepath: path
            };

            console.log('getTimeseriesData()');

            let response = await fetch("getTimeseriesData", {
                method: "post",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(datarequest)
            });


            console.log("here is the response obj: ");
            console.dir( response );

            if( response && response.json ) {

                console.log("about to do response.json();");
                var newData = await response.json();

                console.dir( newData );
                this.updateTopDown( newData );

                this.updateTopDownData();
                console.log('debugTop21');
                //  this can not be called until replacing_metrics is set correctlying
                $('.update_top_down').trigger('click');

                var rerender = this.rerenderSoDictTranslationHappens;

                //  TODO: find event of when the thing gets finished rendering
                //  only then should be do rerender.  get rid of setTimeout.
                //  Rerender needs to happen after another event.
                //  this rerender allows the dictionary to be translated
                //  so that we're not showing all two character stuff.
                rerender();

                if( newData ) {
                    success();
                } else {
                    fail();
                }
            }
        },
        getScripts() {

            var files = [
                "../web/js/jquery-1.11.0.min.js",
                "../web/js/Utility.js",
                "../web/js/Environment.js",
                "../web/js/CallSpot.js?abb"
            ];

            let script = document.createElement('script');
            script.src = "../web/js/jquery-1.11.0.min.js";

            var getAliases = this.getAliases;

            // assign an onload event handler
            script.addEventListener('load', (event) => {

                console.log('jquery has been loaded.');

                $.getScript("../web/js/Environment.js", function () {

                    $.getScript("../web/js/Utility.js", function () {

                        $.getScript("../web/js/CallSpot.js?abb", function () {

                            $.getScript("../web/js/RunDictionaryTranslator.js?jz88992", getAliases);
                        });
                    });
                });
            });

            document.body.appendChild(script);

        },
        updateTopDownData() {

            console.log('update top downdata.');
            //  Need to make sure that it recalculates the topDownData
            this.ensure_update = 1;
        },

        //  Just reuse our existing get memory call for now, so we can retrieve aliases.
        getAliases() {

            var success_handler = function( aj_dat ) {

                var ret2 = {};

                if( aj_dat && aj_dat.series ) {
                    ret2 = aj_dat;
                } else {

                    var ret = aj_dat.output.command_out;

                    try {
                        ret2 = JSON.parse(ret);
                    } catch(e) {
                    }
                }

                updateTopDown(ret2);
                updateTopDownData();
                console.log('debugTop19');
                //  this can not be called until replacing_metrics is set correctlying
                $('.update_top_down').trigger('click');

                //  TODO: find event of when the thing gets finished rendering
                //  only then should be do rerender.  get rid of setTimeout.
                //  Rerender needs to happen after another event.
                //  this rerender allows the dictionary to be translated
                //  so that we're not showing all two character stuff.
                rerender();
            };

            var error_handler = function() {

                updateTopDown({});
                updateTopDownData();
                //  this can not be called until replacing_metrics is set correctlying
                $('.update_top_down').trigger('click');

                rerender();
            };


            console.dir(ST.CallSpot);
            console.dir(ST.Utility);

            console.log('A getAliases');
            var runSetId = ST.Utility.get_param('runSetId');

            //  cali files use this:
            var runId = ST.Utility.get_param('runId');

            //  JSON files use this:
            var title = ST.Utility.get_param('title');

            if( title.indexOf('.cali') === -1 ) {
                title += ".json";
            }

            var suff = title === "undefined.json" ? runId : title;

            //  //'/usr/gapps/spot/datasets/lulesh_gen/100',
            var path = runSetId + " " + suff;

            console.log( 'getAliases path=' + path );
            var isContainer = window.ENV.machine == 'container'

            if( isContainer ) {

                this.containerAJAX( path, success_handler, error_handler );

            } else {

                //  also run after memory call.
                //$('.update_top_down').trigger('click');

                var updateTopDownData = this.updateTopDownData;
                var updateTopDown = this.updateTopDown;
                var rerender = this.rerenderSoDictTranslationHappens;

                this.getDictionary( function() {

                    ST.CallSpot.ajax({
                        file: path,
                        type: "getTimeseriesData",
                        success: success_handler,
                        error: error_handler
                    });
                });
            }
        },
        rerenderSoDictTranslationHappens() {

            //$('.exclusive-white-buffer').get(0).click();
            //$('.rootbutton').get(0).click();
            $('div.text').get(1).click();
        },
        updateTopDown( ret2 ) {

            console.log('updateTopDown A:')
            console.dir(ret2);

            if( ret2 ) {

                var records = ret2.series ? ret2.series.records : {};
                var attributes = ret2.series ? ret2.series.attributes : {};
                var metricNames = this.metricNames;

                var replaceMetricNames = this.replaceMetricNames

                var replacing_metrics = this.replacing_metrics

                console.log("Records: ");
                console.dir(records);
                console.log('Attributes 2: ');
                console.dir(attributes);

                for (var x = 0; x < metricNames.length; x++) {

                    var met = metricNames[x];
                    var cali_obj = attributes[met] || {};
                    var alias = cali_obj["alias"] || met;

                    replacing_metrics[met] = alias
                }
            } else {
                this.replacing_metrics["yAxis"] = "yAxis";
            }

            console.log('this.replacing_metrics: ');
            console.dir(this.replacing_metrics);
        },
        replaceMetricNames( replacee, replacer ) {

            this.metricObjs[replacee] = {
                "name": replacee,
                "alias": replacer
            };

            return true;

            if( replacee !== replacer ) {

                for (var lul_dir in this.data) {

                    var num = this.data[lul_dir][replacee];
                    this.data[lul_dir][replacer] = num;
                    delete this.data[lul_dir][replacee];
                }

                for (var x = 0; x < this.metricNames.length; x++) {

                    if (this.metricNames[x] === replacee) {
                        this.metricNames[x] = replacer;
                    }
                }
            }
        },
        filterMetricNames() {

            var excludes = {
                "spot.channel": true
            };

            for( var x=0; x < this.metricNames.length; x++ ) {

                var sub = this.metricNames[x];
                if( excludes[sub] ) {
                    this.metricNames.splice(x,1);
                }
            }
        },
        peeledData(runData, metricName){

            var z;

             let x =  _.fromPairs(_.map(runData, (metrics, funcPath) => {
                 let topdown = {} 
                 _.forIn(metrics, (val, key) => {if(key.startsWith('any#any#')) topdown[key] = val})

                 if(Object.keys(topdown).length == 0) topdown = null

                 var metricValue = metrics[metricName] || 0

                 return ['--root path--/' + funcPath, {value: parseFloat(metricValue), topdown}]
             }))
             x['--root path--'] = {value: 0}

             //console.log('Inside peeledData(): ');
             //console.dir(x)
             return x
        },
        changePath(path){
            this.selectedNode = path;
        },
        setTopdownNode(nodename){
            this.selectedTopdownNode = nodename
        },
    },
    created(){

        this.getScripts()
    },
    components:{FlameGraph, TopDown}
}
</script>
