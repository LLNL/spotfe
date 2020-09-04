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
        
    .topdown(v-if="showTopdown" style='width:100%;position:absolute;top:1px;opacity:0.7;display:flex')
        .retiring(v-if='myTopdown && myTopdown["any#any#topdown.retiring"]' :style="{width: myTopdown['any#any#topdown.retiring'] * 100 + '%', backgroundColor:'green', height:'8px'}")

        div(:style="{width: myTopdown['any#any#topdown.bad_speculation'] * 100 + '%'}")
            .bad_spec(v-if='myTopdown && myTopdown["any#any#topdown.bad_speculation"]' style='width:100%;background-color:red;height:8px;')
            //- div(style="width:100%;display:flex")
            //-     .mispredict(:style="{width: myTopdown['any#any#topdown.branch_mispredict'] * 100 + '%', backgroundColor:'pink', height:'6px'}" v-if='myTopdown && myTopdown["any#any#topdown.bad_speculation"]')
            //-     .mach_clear(:style="{width: myTopdown['any#any#topdown.machine_clears'] * 100 + '%', backgroundColor:'#D00', height:'6px'}" v-if='myTopdown && myTopdown["any#any#topdown.machine_clears"]')
        div(:style="{width: myTopdown['any#any#topdown.frontend_bound'] * 100 + '%'}")
            .frontend(v-if='myTopdown && myTopdown["any#any#topdown.frontend_bound"]' style='width:100%;background-color:blue;height:8px;')
            //- div(style="width:100%;display:flex")
            //-     .latency(:style="{width: myTopdown['any#any#topdown.frontend_latency'] * 100 + '%', backgroundColor:'cyan', height:'6px'}" v-if='myTopdown && myTopdown["any#any#topdown.frontend_latency"]')
            //-     .bandwidth(:style="{width: myTopdown['any#any#topdown.frontend_bandwidth'] * 100 + '%', backgroundColor:'#55F', height:'6px'}" v-if='myTopdown && myTopdown["any#any#topdown.frontend_bandwidth"]')
        .backend(v-if='myTopdown && myTopdown["any#any#topdown.backend_bound"]'
                    :style="{width: myTopdown['any#any#topdown.backend_bound'] * 100 + '%', backgroundColor:'orange', height:'8px'}" )

    .flamegraphRow( v-for='metricName in metricNames' :style="{padding:'20px'}")
        h3(:style="{paddingBottom:'10px' }") {{metricName}}
        FlameGraph(
                :runData='peeledData(data, metricName)'
                :metricName='metricName'
                :showTopdown='showTopdown'
                :selectedNode='selectedNode'
                :handleClick='changePath'

                )
    //- .topdown
    //-     svg(width="1100", height="425", padding="100px", margin="100px")
    //-         g(v-for='row in topdownLayout')
    //-             g(v-for='(node, index) in row.namevals')
    //-             rect(
    //-                 :x="row.xOffset + (row.width + row.spacing)*index"
    //-                 :y="100 + row.yOffset - node.val"
    //-                 :height="node.val"
    //-                 :width="row.width"
    //-                 rx="5" ry="5"
    //-                 fill="#4db6ac"
    //-                 opacity="0.5"
    //-             )
    //-             text(
    //-                 :transform="'translate(' + (row.xOffset + (index + 0.5)*(row.width) + (row.spacing*index)) + ',' + (row.yOffset + 50) + ')rotate('+ row.rotate + ')'"
    //-                 fill="#333"
    //-                 dy="0.35em"
    //-                 text-anchor="middle" ) {{ node.name }}
    //-             rect(
    //-                 :x="row.xOffset + (row.width + row.spacing)*index"
    //-                 :y="row.yOffset"
    //-                 rx="5"
    //-                 yx="5"
    //-                 height="100"
    //-                 stroke="#448aff"
    //-                 :stroke-width='selName==node.name?3:1'
    //-                 :width="row.width"
    //-                 fill="#fff0"
    //-             )
    //-                 title value: {{ node.rawVal }}
</template>

<script>
import FlameGraph from './Flamegraph.vue'
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
        myTopdown(){
            const x =  this.peeledData(this.data, '--root path--')
            console.log(x)
            return x
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
    },
    components:{FlameGraph}
}
</script>