<template lang="pug">
    .topdown(style='width:100%;display:flex') 
        .node-width(:style="{width: topdownData['bs'].disp}") 
            .node(v-if='topdownData["bs"]' style='background-color:#9765f4;' @click='$emit("topdownNodeSelected", "bs")' :style='{border: selectedTopdownNode == "bs" ? "3px solid black" : ""}'  :title="'bad speculation (' + topdownData['bs'].val + ')'") 
                | bad speculation ({{topdownData['bs'].val}})
            .children
                .node-width(:style="{width: topdownData['ms'].disp}") 
                    .node(style="background-color:#b794f6" v-if='topdownData["bs"]' @click='$emit("topdownNodeSelected", "ms")' :style='{border: selectedTopdownNode == "ms" ? "3px solid black" : ""}' :title="'mispredict (' + topdownData['ms'].val + ')'") 
                        | mispredict ({{topdownData['ms'].val}})
                .node-width(:style="{width: topdownData['mc'].disp}") 
                    .node(style="background-color:#d4bff9" v-if='topdownData["mc"]' @click='$emit("topdownNodeSelected", "mc")' :style='{border: selectedTopdownNode == "mc" ? "3px solid black" : ""}' :title="'machine clears (' + topdownData['mc'].val + ')'")
                        | machine clears ({{topdownData['mc'].val}})

        .node-width(:style="{width: topdownData['fe'].disp}") 
            .node(v-if='topdownData["fe"]' style='background-color:#657bf4;' @click='$emit("topdownNodeSelected", "fe")' :style='{border: selectedTopdownNode == "fe" ? "3px solid black" : ""}' :title="'frontend (' + topdownData['fe'].val + ')'") 
                    | frontend ({{topdownData['fe'].val}})

            .children
                .node-width(:style="{width: topdownData['la'].disp}") 
                    .node(style="background-color:#97a0f7" v-if='topdownData["la"]' @click='$emit("topdownNodeSelected", "la")' :style='{border: selectedTopdownNode == "la" ? "3px solid black" : ""}' :title="'laency (' + topdownData['la'].val + ')'") 
                        | latency ({{topdownData['la'].val}})
                .node-width(:style="{width: topdownData['bw'].disp}") 
                    .node(style="background-color:#c2c5fa" v-if='topdownData["bw"]' @click='$emit("topdownNodeSelected", "bw")' :style='{border: selectedTopdownNode == "bw" ? "3px solid black" : ""}' :title="'bandwidth (' + topdownData['bw'].val + ')'") 
                        | bandwidth ({{topdownData['bw'].val}})
        .node-width(:style="{width: topdownData['be'].disp}") 
            .node(v-if='topdownData["be"]' style="backgroundColor:#FFA000" @click='$emit("topdownNodeSelected", "be")' :style='{border: selectedTopdownNode == "be" ? "3px solid black" : ""}' :title="'backend (' + topdownData['be'].val + ')'" )
                | backend ({{topdownData['be'].val}})
            .children
                .node-width(:style="{width: topdownData['co'].disp}") 
                    .node(v-if='topdownData["co"]' style="background-color:#FFB300" @click='$emit("topdownNodeSelected", "co")' :style='{border: selectedTopdownNode == "co" ? "3px solid black" : ""}' :title="'core (' + topdownData['co'].val + ')'" )
                        | core ({{topdownData['co'].val}})
                .node-width(:style="{width: topdownData['me'].disp}") 
                    .node(v-if='topdownData["me"]' style="background-color:#FFC107" @click='$emit("topdownNodeSelected", "me")' :style='{border: selectedTopdownNode == "me" ? "3px solid black" : ""}' :title="'memory (' + topdownData['me'].val + ')'" )
                        | memory ({{topdownData['me'].val}})
                    .children
                        .node-width(:style="{width: topdownData['l1'].disp}") 
                            .node(v-if='topdownData["l1"]' style="background-color:#FFCA28" @click='$emit("topdownNodeSelected", "l1")' :style='{border: selectedTopdownNode == "l1" ? "3px solid black" : ""}' :title="'L1 (' + topdownData['l1'].val + ')'" )
                                | L1 ({{topdownData['l1'].val}})
                        .node-width(:style="{width: topdownData['l2'].disp}") 
                            .node(v-if='topdownData["l2"]' style="background-color:#FFD54F" @click='$emit("topdownNodeSelected", "l2")' :style='{border: selectedTopdownNode == "l2" ? "3px solid black" : ""}' :title="'L2 (' + topdownData['l2'].val + ')'" )
                                | L2 ({{topdownData['l2'].val}})
                        .node-width(:style="{width: topdownData['l3'].disp}") 
                            .node(v-if='topdownData["l3"]' style="background-color:#FFE082" @click='$emit("topdownNodeSelected", "l3")' :style='{border: selectedTopdownNode == "l3" ? "3px solid black" : ""}' :title="'L3 (' + topdownData['l3'].val + ')'" )
                                | L3 ({{topdownData['l3'].val}})
                        .node-width(:style="{width: topdownData['mb'].disp}") 
                            .node(v-if='topdownData["mb"]' style="background-color:#FFECB3" @click='$emit("topdownNodeSelected", "mb")' :style='{border: selectedTopdownNode == "mb" ? "3px solid black" : ""}' :title="'mem_bound (' + topdownData['mb'].val + ')'" )
                                | mem_bound ({{topdownData['mb'].val}})
        .node-width(:style="{width: topdownData['re'].disp}") 
            .node(v-if='topdownData["re"]' style="background-color:#B2FF59" @click='$emit("topdownNodeSelected", "re")' :style='{border: selectedTopdownNode == "re" ? "3px solid black" : ""}' :title="'retiring (' + topdownData['re'].val + ')'") 
                | retiring ({{topdownData['re'].val}})

</template>


<style lang="stylus" scoped>
div{
    box-sizing:border-box;
}
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
    padding-left:3px;
    min-width:0px;

}
.children{
    display:flex;
}


</style>


<script>
export default {
    props:['topdownData', 'selectedTopdownNode'],
    data(){ return {

    }},
    
}
</script>