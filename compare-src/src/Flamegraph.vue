<template lang="pug">
    .flamegraph(
        :style=`{
            flex:2,
            minWidth:'600px',
            overflow:'scroll'
            }`
        ) 
        .rootbutton(
            @click="handleClick('--root path--')"
            :style=`{
                backgroundColor:'#ddd',
                textAlign:'center',
                border: selectedNode == '--root path--' ? 'solid 1px black':'',
                }`
            ) /
        .collapsed-parent(
            v-for='funcPath in collapsedFuncPaths' v-if="funcPath != '--root path--'"
            :style=`{
                display:'flex',
                alignItems:'center',
                height:'25px',
                backgroundColor:'white',
                cursor:'pointer',
                }`
            @click='handleClick(funcPath)'
            )
            .text(
                :style=`{
                    marginLeft:'3px',
                    overflow:'hidden',
                    cursor:'pointer'
                    }`
                ) {{ title(funcPath)}}
        
        FlamegraphNode(
            :runData='addInclusive(runData)'
            :selectedNode='selectedNode'
            :selectedTopdownNode='selectedTopdownNode'
            :topdownData='topdownData'
            :funcPath='selectedNode'
            :handleClick='handleClick'
            :showTopdown='showTopdown'
            )
    
</template>

<script>
import FlamegraphNode from './FlamegraphNode.vue'
import {childrenPaths} from './functions.js'
import _ from 'lodash'
export default {
    props:['runData', 'selectedNode', 'handleClick', 'showTopdown', 'topdownData', 'metricName', 'showTopdown', 'selectedTopdownNode'],
    computed:{
        collapsedFuncPaths(){
            let collapsedNodes = []
            const names = this.selectedNode.split('/').slice(0, -1)
            for (let i = 1; i <= names.length; i++) {
                collapsedNodes.push(names.slice(0, i).join('/'))
            }
            return collapsedNodes
        },
    },
    methods:{
        title(funcPath){ 
            var encoded_title = `${funcPath.split('/').slice(-1)[0]} (${this.runData[funcPath].value})`
            var layman_title = ST.RunDictionaryTranslator.lookupStr( encoded_title );

            return layman_title;
        },
        addInclusive(selectedRunData){
            // recursively sum up inclusive times
            const funcPathKeys =  Object.keys(selectedRunData)

            let inclusiveData = {}
            function addInclusiveNode(nodeName){
                const myValue = selectedRunData[nodeName].value
                const topdown = selectedRunData[nodeName].topdown
                const childrenFuncPaths = childrenPaths(nodeName, funcPathKeys)

                // if no children set value
                if(!childrenFuncPaths.length) {
                    inclusiveData[nodeName] =  {inclusive: myValue, exclusive: myValue, topdown}
                // else recurse
                } else {
                    childrenFuncPaths.forEach(path => addInclusiveNode(path))
                    const childrenNodes = _.filter(inclusiveData, (value, key) => childrenFuncPaths.includes(key))
                    const childrenSum = _.sumBy(childrenNodes, node => node.inclusive)
                    inclusiveData[nodeName] =  {inclusive: _.max([myValue, childrenSum]), exclusive: myValue, topdown}
                }
            }
            addInclusiveNode(_.min(funcPathKeys))
            return inclusiveData
        },
        

    },
    components:{
        FlamegraphNode
    },

    
    
}
</script>