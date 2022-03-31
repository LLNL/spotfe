ST.FileUpload = function() {

    var dir = ST.Utility.get_param("sf");

    Vue.component("file-upload", {
        data: function() {

            return {
                directory_val: dir
            }
        },
        template: '<form action="javascript:void(0);" method="post">' +
        //'<div class="instructions">Directory containing cali files:</div>' +
        '<input type="text" class="directory" v-model:value="directory_val" v-on:keyup="keyup( $event )"/>' +
        '<div class="update_button myButton icon" v-on:click="update( $event )">' +
        '<div class="inner"></div></div>' +
        '</form>',
        methods: {
            keyup: function(e) {

                if( e.keyCode === 13 ) {
                    this.update(e);
                }
            },
            update: function( event ) {

                var wl = window.location;

                //  We don't want the parameters set from the old URL to impact the new directory you're going to.
                var newUrl = wl.origin + wl.pathname + '?sf=' + this.directory_val;

                history.pushState({}, null, newUrl);
                location.reload();
            }
        }
    });

    new Vue({
        'el': '#file_upload'
    });
}();