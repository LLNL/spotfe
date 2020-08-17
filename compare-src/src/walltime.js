import Vue from 'vue'
import App from './WalltimeApp.vue'
import "babel-polyfill"
import localforage from 'localforage'

// parse search parameters form URL
const params = new URLSearchParams(new URL(window.location).search)
const runSetId = params.get("runSetId")
const runId = params.get("runId")


localforage.getItem(runSetId)
    .then(runSet => {
        const fileData = runSet.Runs[runId]
        for (const [key, val] of Object.entries(fileData.Globals)){
            const type_ = runSet.RunGlobalMeta[key] ? runSet.RunGlobalMeta[key].type : "string"
            fileData.Globals[key] = {value: fileData.Globals[key], type: type_ }
        }

        const flags = {filename: runId, data: fileData.Data, meta: fileData.Globals}
        return new Vue({
            el: "main",
            render: h => h(App, {
                props:{
                    filename: runId, 
                    data: fileData.Data ,
                    meta: fileData.Globals
                },
            }),
        })
        
    })
document.title = runId
