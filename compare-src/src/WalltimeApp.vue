<template lang="pug">
.root(:style="{display:'flex', flexDirection:'column', padding:'20px'}")
    .title-row(:style="{display:'flex', justifyContent:'center'}")
        h2 Runs: {{filename}}
    .global-meta(:style="{flex: 1, display:'flex', flexDirection:'column', marginLeft:'20px', overflow:'scroll'}")
        .row(:style="{display:'flex'}" v-for='(metaVal, metaName) in meta') 
            .name(:style="{color:'blue', fontWeight:'bold'}") {{ metaName }} 
            .val(:style="{whiteSpace:'nowrap'}") : {{ metaVal.value }}
    label(for='showTopdownCb') show topdown
        input(type='checkbox' id='showTopdownCb' v-model='showTopdown') 
        
    .topdown(v-if="showTopdown && topdownData")
        TopDown(:topdownData='topdownData')

    .flamegraphRow( v-for='metricName in metricNames' :style="{padding:'20px'}")
        h3(:style="{paddingBottom:'10px' }") {{metricName}}
        FlameGraph(
                :runData='peeledData(data, metricName)'
                :metricName='metricName'
                :showTopdown='showTopdown'
                :selectedNode='selectedNode'
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
        selectedNode: null,
        showTopdown: true

    }},
    computed:{
        funcPaths(){return Object.keys(this.data) },
        metricNames(){ return Object.keys(this.data[this.funcPaths[0]]).filter(name => !name.startsWith('any#any#'))},
        topDownNames(){ return Object.keys(this.data[this.funcPaths[0]]).filter(name => name.startsWith('any#any#'))},
        topdownData(){
            let topdown =  this.peeledData(this.data, this.metricNames[0])[this.selectedNode].topdown
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
                topdown['re'].disp = topdown['re'].val / sum
                topdown['bs'].disp = topdown['bs'].val / sum
                topdown['fe'].disp = topdown['fe'].val / sum
                topdown['be'].disp = topdown['be'].val / sum

                sum = topdown['ms'] + topdown['mc']
                sum = sum > 1 ? sum : 1
                topdown['ms'].disp = topdown['ms'].val / sum
                topdown['mc'].disp = topdown['mc'].val / sum

                sum = topdown['la'] + topdown['bw']
                sum = sum > 1 ? sum : 1
                topdown['la'].disp = topdown['la'].val / sum
                topdown['bw'].disp = topdown['bw'].val / sum

                sum = topdown['co'] + topdown['me']
                sum = sum > 1 ? sum : 1
                topdown['co'].disp = topdown['co'].val / sum
                topdown['me'].disp = topdown['me'].val / sum

                sum = topdown['l1'] + topdown['l2'] + topdown['l3'] + topdown['mb']
                sum = sum > 1 ? sum : 1
                topdown['l1'].disp = topdown['l1'].val / sum
                topdown['l2'].disp = topdown['l2'].val / sum
                topdown['l3'].disp = topdown['l3'].val / sum
                topdown['mb'].disp = topdown['mb'].val / sum
            }
            return topdown
        },
    },
    methods:{
        peeledData(runData, metricName){
             let x =  _.fromPairs(_.map(runData, (metrics, funcPath) => {
                 const topdown = {}
                 _.forIn(metrics, (val, key) => {if(key.startsWith('any#any#')) topdown[key] = val})
                 
                 return ['--root path--/' + funcPath, {value: parseFloat(metrics[metricName]), topdown}] 
             }))
             x['--root path--'] = {value: 0}
             return x
        },
        changePath(path){this.selectedNode = path },
    },
    created(){
        this.selectedNode = '--root path--'
        console.log('metric_names', this.metricNames)
        console.log('basdf')
    },
    components:{FlameGraph, TopDown}
}
</script>