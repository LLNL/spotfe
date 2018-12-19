"use strict";


Vue.component('run-table-component', {
        template: `
<div>
            <span>run table component:</span>
            <table>
            <tr>
                <td v-for="(column, index2) in specs[0]"
                    @click="order(index2)">
                    {{ index2 }}
                </td>
            </tr>
            <tr v-for="(spec,index) in specs">
                <td v-for="(column, index2) in spec">
                    {{ spec[index2] }}
                </td>
            </tr>
        </table>
    </div>`,
        methods: {
            order: function( param ) {

                console.dir(param);
                console.log('order me.');
            }
        },
        data: function() {
            return {
                specs: [
                    {cola:2, b:7, next_col: "asdfsdf"},
                    {cola:2234, b:732, next_col: "hambstring"},
                    {cola:2798, b:78373, next_col: "finlnd."}
                ]
            }
        },
        created: function() {

            //app.$on('updateData', function() {
            //    console.log('updateData.');
            //});
        }
    });

