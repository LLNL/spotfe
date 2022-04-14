<template lang="pug">
.flamenode
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

<style scoped>
    *{
        box-sizing: border-box;
        margin: 0px;
    }
</style>
