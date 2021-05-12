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


export default {

    props:['filename', 'data', 'meta'],
    data(){return {
        selectedNode: '--root path--',
        selectedTopdownNode: 'fe',
        showTopdown: false,
        replacing_metrics: {},
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

            if( this.replacing_metrics ) {

                for( var met in this.replacing_metrics ) {

                    var alias = this.replacing_metrics[met];

                    this.replaceMetricNames( met, alias )
                }
            }

            console.dir( this.data )
            console.dir( this.metricNames )
            console.dir( this.selectedNode )
            var peeled = this.peeledData(this.data, this.metricNames[0])

            console.dir( "peeled7777" )
            console.dir( peeled )
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
        async getmemoryfunc( path )
        {
            const command = "/opt/conda/bin/python3 /usr/gapps/spot/backend.py --config /usr/gapps/spot/backend_config.yaml memory /data/" +
                path;

            var datarequest = {
                command: command,
                filepath: path
            };

            console.log('getmemoryfunc()');

            let response = await fetch("/getmemory", {
                method: "post",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(datarequest)
            });


            console.log("here is the response obj: ")
            console.dir( response );

            if( response && response.json ) {

                console.log("about to do response.json();")
                var newData = await response.json();

                console.log('newData:')
                console.dir(newData);

                this.updateTopDown( newData );

            } else {
                console.log('no .json');
            }
        },
        getScripts() {

            var files = [
                "../web/js/jquery-1.11.0.min.js",
                "../web/js/Utility.js",
                "../web/js/Environment.js",
                "../web/js/CallSpot.js?abb"
            ];
            //loadScriptsInOrder( files ).then( this.getAliases );

            let script = document.createElement('script');
            script.src = "../web/js/jquery-1.11.0.min.js";

            // assign an onload event handler
            script.addEventListener('load', (event) => {

                console.log('jquery has been loaded.');
                $.when(
                    $.getScript("../web/js/Environment.js"),
                    $.getScript("../web/js/Utility.js"),
                    $.getScript("../web/js/CallSpot.js?abb"),
                    $.getScript("../web/js/RunDictionaryTranslator.js?jasdf"),
                    $.Deferred(function( deferred ){
                        $( deferred.resolve );
                    })
                ).done( this.getAliases );
            });

            document.body.appendChild(script);

        },
        updateTopDownData() {

            //  Need to make sure that it recalculates the topDownData
            this.ensure_update = 1;
        },

        //  Just reuse our existing get memory call for now, so we can retrieve aliases.
        getAliases() {

            var runSetId = ST.Utility.get_param('runSetId');
            var runId = ST.Utility.get_param('runId');

            //  //'/usr/gapps/spot/datasets/lulesh_gen/100',
            var path = runSetId + "/" + runId;

            var isContainer = window.ENV.machine == 'container'

            if( isContainer ) {

                this.getmemoryfunc( path );

            } else {

                var updateTopDown = this.updateTopDown;

                ST.CallSpot.ajax({
                    file: path,
                    type: "memory",
                    success: function( aj_dat ) {

                        var ret2 = {};

                        if( aj_dat.series ) {
                            ret2 = aj_dat;
                        } else {
                            var ret = aj_dat.output.command_out;
                            ret2 = JSON.parse(ret);
                        }

                        updateTopDown(ret2);
                    }
                });
            }
        },
        updateTopDown( ret2 ) {

            console.log('updateTopDown 23223')
            console.dir(ret2)

            var records = ret2.series.records;
            var attributes = ret2.series.attributes;
            var metricNames = this.metricNames;

            var replaceMetricNames = this.replaceMetricNames

            var replacing_metrics = this.replacing_metrics

            console.dir( records );
            console.dir( attributes );
            console.dir( metricNames );

            for( var x=0; x < metricNames.length; x++ ) {

                var met = metricNames[x];
                var cali_obj = attributes[ met ] || {};
                var alias = cali_obj["attribute.alias"] || met;

                replacing_metrics[ met ] = alias
            }

            $('.update_top_down').trigger('click')
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

            console.log('PZA');
            var z;

             let x =  _.fromPairs(_.map(runData, (metrics, funcPath) => {
                 let topdown = {} 
                 _.forIn(metrics, (val, key) => {if(key.startsWith('any#any#')) topdown[key] = val})

                 if(Object.keys(topdown).length == 0) topdown = null

                 var metricValue = metrics[metricName] || 0

                 //console.log("metsavd:")
                 //console.dir(metrics)
                 //console.dir(metricName)
                 return ['--root path--/' + funcPath, {value: parseFloat(metricValue), topdown}]
             }))
             x['--root path--'] = {value: 0}
             return x
        },
        changePath(path){this.selectedNode = path },
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