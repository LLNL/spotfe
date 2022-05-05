import Vue from 'vue'
import {reactive} from 'vue'
import {createApp} from 'vue'
import App from './App.vue'
import AresSankey from "./AresSankey.vue"



var selSankeyPath = "main";

var runData = {};
runData[selSankeyPath] = {};

runData[selSankeyPath].topdown = {
    retiring: .15,
    bad_speculation: .8,
    frontend_bound: .612,
    backend_bound: .23,
    branch_mispredict: .9,
    machine_clear: .11,
    frontend_latency: .5,
    frontend_bandwidth: .18,
    core_bound: .9,
    memory_bound: .212,
    l1_bound: .4,
    l2_bound: .8,
    l3_bound: .11,
    uncore_bound: .7,
    mem_bound: .4
};

const props = reactive({ runData: runData });
var aresApp = createApp(AresSankey, props);

aresApp.mount(".ares_container");
