<template lang="pug">
    .flamenode(:style="{width:inclusiveWidthPercent, display:'flex', flexDirection:'column'}")
        .inclusive(v-if="!title.startsWith('--root')" :style="{display:'flex', alignItems:'center', height:'25px', background:inclusiveBackground(funcPath)}"
                  ) 
            .exclusive-white-buffer( @click='handleClick(funcPath)' :style="{width:exclusiveWidthPercent, display:'inline-block', backgroundColor:'white', position: 'relative', border: showTopdown ?  '1px solid black' : ''}")
                .exclusive(:style=`{ display:'flex' 
                                   , position:'relative'
                                   , alignItems:'center'
                                   , height: '25px'
                                   , backgroundColor: colorHash(funcPath) 
                                   , cursor:'pointer'
                                   , width: showTopdown ? topdownData[selectedTopdownNode].flame: '100%'
                                   , border: iAmSelected ? '3px solid black' : '' 
                                   }`
                        )
                .text(@click='handleClick(funcPath)' :style="{width: exclusiveWidthPercent,overflow: 'hidden', cursor:'pointer', whiteSpace:'nowrap', position:'absolute', top: '3px', left: '3px'}" :title='title' ) {{ title }} 
                    

        .children(:style="{display:'flex'}") 
            FlamegraphNode(v-for='fp in childrenPaths(funcPath, allFuncPaths)'
                           :runData='runData' 
                           :selectedNode='selectedNode'
                           :selectedTopdownNode='selectedTopdownNode'
                           :topdownData='topdownData'
                           :showTopdown='showTopdown'
                           :funcPath='fp'
                           :handleClick='handleClick'
                           )
</template>

<script>
import {parentPath, childrenPaths, colorHash} from './functions.js'

export default {
    props: [ 
        'selectedNode',
        'selectedTopdownNode',
        'showTopdown',
        'topdownData',
        'runData',
        'funcPath',
        'handleClick',
    ],

    computed:{
        title(){

            if( !window.ST ) {
                return "";
            } else {

                var encoded_title = `${this.funcPath.split('/').slice(-1)[0]} (${this.runData[this.funcPath].exclusive})`
                var layman_title = ST.RunDictionaryTranslator.lookupStr(encoded_title);

                return layman_title;
            }
        },
        iAmSelected(){return this.selectedNode == this.funcPath},
        allFuncPaths(){return Object.keys(this.runData)},
        myInclusive(){ return this.runData[this.funcPath].inclusive },
        exclusiveWidthPercent(){ 
            // css doesn't like a width to be 0% so if it is zero just return 0 without the %
            if (this.myInclusive == 0) return 0
            const width =  this.runData[this.funcPath].exclusive / this.myInclusive * 100 
            if(width == 0) return 0
            return width + "%"
        },
        inclusiveWidthPercent(){
            return this.funcPath == this.selectedNode 
                     ? '100%'
                     :  this.myInclusive / this.runData[parentPath(this.funcPath)].inclusive * 100 + '%'
        },


    },

    methods: {
        colorHash,
        parentPath,
        childrenPaths,
        inclusiveBackground(funcPath){
            return `repeating-linear-gradient( 45deg, #fff, #fff 10px, ${colorHash(this.funcPath)} 10px, ${colorHash(this.funcPath)} 20px)`
        },
    },
    name: 'FlamegraphNode',
}
</script>
<style lang="scss" scoped>
    *{
        box-sizing: border-box;
        margin: 0px;
    }
</style>
