<template lang="pug">
.root(:style="{display:'flex', flexDirection:'column', padding:'20px'}")
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

    .flamegraphRow( v-for='metricName in metricNames' :style="{padding:'20px'}")
        h3(:style="{paddingBottom:'10px' }") {{metricName}}
        FlameGraph(
                :runData='peeledData(data, metricName)'
                :metricName='metricName'
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

export default {
    props:['filename', 'data', 'meta'],
    data(){return {
        selectedNode: '--root path--',
        selectedTopdownNode: 'fe',
        showTopdown: false

    }},
    computed:{
        funcPaths(){return Object.keys(this.data) },
        metricNames(){ return Object.keys(this.data[this.funcPaths[0]]).filter(name => !name.startsWith('any#any#'))},
        topDownNames(){ return Object.keys(this.data[this.funcPaths[0]]).filter(name => name.startsWith('any#any#'))},
        topdownData(){
            console.dir( this.data )
            console.dir( this.metricNames )
            console.dir( this.selectedNode )
            var peeled = this.peeledData(this.data, this.metricNames[0])
            console.dir( "peeled" )
            console.dir( peeled )
            let topdown = peeled[this.selectedNode].topdown
            console.log( "topdown: ")
            console.dir( topdown )

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
            return topdown
        },
    },
    methods:{
        peeledData(runData, metricName){
             let x =  _.fromPairs(_.map(runData, (metrics, funcPath) => {
                 let topdown = {} 
                 _.forIn(metrics, (val, key) => {if(key.startsWith('any#any#')) topdown[key] = val})

                 if(Object.keys(topdown).length == 0) topdown = null

                 var metricValue = metrics[metricName] || 0
                 
                 console.log("met:")
                 console.dir(metrics)
                 console.dir(metricName)
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
    },
    components:{FlameGraph, TopDown}
}
</script>