<template lang="pug">
.root(:style="{display:'flex', flexDirection:'column', padding:'20px'}")
    .title-row(:style="{display:'flex', justifyContent:'center'}")
        h2 Run: {{filename}}
    .global-meta(:style="{flex: 1, display:'flex', flexDirection:'column', marginLeft:'20px', overflow:'scroll'}")
        .row(:style="{display:'flex'}" v-for='(metaVal, metaName) in meta') 
            .name(:style="{color:'blue', fontWeight:'bold'}") {{ metaName }} 
            .val(:style="{whiteSpace:'nowrap'}") : {{ metaVal.value }}
    .flamegraphRow( v-for='metricName in metricNames' :style="{padding:'20px'}")
        h3(:style="{paddingBottom:'10px' }") {{metricName}}
        flame-graph(
                :runData='peeledData(data, metricName)'
                :selectedNode='selectedNode'
                :handleClick='changePath'
                )
    .topdown
        svg(width="1100", height="425", padding="100px", margin="100px")
            g(v-for='row in topdownLayout')
                g(v-for='(node, index) in row.namevals')
                rect(
                    :x="row.xOffset + (row.width + row.spacing)*index"
                    :y="100 + row.yOffset - node.val"
                    :height="node.val"
                    :width="row.width"
                    rx="5" ry="5"
                    fill="#4db6ac"
                    opacity="0.5"
                )
                text(
                    :transform="'translate(' + (row.xOffset + (index + 0.5)*(row.width) + (row.spacing*index)) + ',' + (row.yOffset + 50) + ')rotate('+ row.rotate + ')'"
                    fill="#333"
                    dy="0.35em"
                    text-anchor="middle" ) {{ node.name }}
                rect(
                    :x="row.xOffset + (row.width + row.spacing)*index"
                    :y="row.yOffset"
                    rx="5"
                    yx="5"
                    height="100"
                    stroke="#448aff"
                    :stroke-width='selName==node.name?3:1'
                    :width="row.width"
                    fill="#fff0"
                )
                    title value: {{ node.rawVal }}
</template>

<script>
import FlameGraph from './Flamegraph.vue'
import _ from 'lodash'

export default {
    props:['filename', 'data', 'meta'],
    data(){return {
        selectedNode: null

    }},
    computed:{
        funcPaths(){return Object.keys(this.data) },
        metricNames(){ return Object.keys(this.data[this.funcPaths[0]])},
    },
    methods:{
        peeledData(runData, metricName){
             let x =  _.fromPairs(_.map(runData, (metrics, funcPath) => ['--root path--/' + funcPath, parseFloat(metrics[metricName])] ))
             x['--root path--'] = 0
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