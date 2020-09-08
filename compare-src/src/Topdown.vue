<template lang="pug">
    .topdown(style='width:100%;display:flex') 
        .node-width(:style="{width: topdownData['bs'].disp * 100 + '%'}") 
            .bad_spec.node(v-if='topdownData && topdownData["bs"]' style='background-color:#9765f4;') 
                | bad speculation ({{topdownData['bs'].val}})
            .children
                .node-width(:style="{width: topdownData['ms'].disp * 100 + '%'}") 
                    .mispredict.node(style="background-color:#b794f6" v-if='topdownData && topdownData["bs"]') 
                        | mispredict ({{topdownData['ms'].val}})
                .node-width(:style="{width: topdownData['mc'].disp * 100 + '%'}") 
                    .mach_clear.node(style="background-color:#d4bff9" v-if='topdownData && topdownData["mc"]')
                        | machine clears ({{topdownData['mc'].val}})

        .node-width(:style="{width: topdownData['fe'].disp * 100 + '%'}") 
            .frontend.node(v-if='topdownData && topdownData["fe"]' style='background-color:#657bf4;') 
                    | frontend ({{topdownData['fe'].val}})

            .children
                .node-width(:style="{width: topdownData['la'].disp * 100 + '%'}") 
                    .latency.node(style="background-color:#97a0f7" v-if='topdownData && topdownData["la"]') latency
                .node-width(:style="{width: topdownData['bw'].disp * 100 + '%'}") 
                    .bandwidth.node(style="background-color:#c2c5fa" v-if='topdownData && topdownData["bw"]') bandwidth
        .node-width(:style="{width: topdownData['be'].disp * 100 + '%'}") 
            .backend.node(v-if='topdownData && topdownData["be"]' style="backgroundColor:#FFA000" )
                | backend ({{topdownData['be'].val}})
            .children
                .node-width(:style="{width: topdownData['co'].disp * 100 + '%'}") 
                    .backend.node(v-if='topdownData && topdownData["co"]' style="background-color:#FFB300" )
                        | core ({{topdownData['co'].val}})
                .node-width(:style="{width: topdownData['me'].disp * 100 + '%'}") 
                    .backend.node(v-if='topdownData && topdownData["me"]' style="background-color:#FFC107" )
                        | memory ({{topdownData['me'].val}})
                    .children
                        .node-width(:style="{width: topdownData['l1'].disp * 100 + '%'}") 
                            .backend.node(v-if='topdownData && topdownData["l1"]' style="background-color:#FFCA28" )
                                | 1 ({{topdownData['l1'].val}})
                        .node-width(:style="{width: topdownData['l2'].disp * 100 + '%'}") 
                            .backend.node(v-if='topdownData && topdownData["l2"]' style="background-color:#FFD54F" )
                                | 2 ({{topdownData['l2'].val}})
                        .node-width(:style="{width: topdownData['l3'].disp * 100 + '%'}") 
                            .backend.node(v-if='topdownData && topdownData["l3"]' style="background-color:#FFE082" )
                                | 3 ({{topdownData['l3'].val}})
                        .node-width(:style="{width: topdownData['mb'].disp * 100 + '%'}") 
                            .backend.node(v-if='topdownData && topdownData["mb"]' style="background-color:#FFECB3" )
                                | mem_bound ({{topdownData['mb'].val}})
        .node-width(:style="{width: topdownData['be'].disp * 100 + '%'}") 
            .retiring.node(v-if='topdownData && topdownData["re"]' style="background-color:#B2FF59") 
                | retiring ({{topdownData['re'].val}})
    
</template>


<style lang="stylus" scoped>
.node-width{
    display:flex;
    flex-direction:column;
    flex-shrink:1;
    min-width:0;
}
.node{
    height:35px;
    border-radius:10px;
    overflow:hidden;
    padding-top:5px;
    min-width:0px;

}
.children{
    display:flex;
}


</style>

<script>
export default {
    props:['topdownData'],
    
}
</script>