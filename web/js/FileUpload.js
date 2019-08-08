ST.FileUpload = function() {

    var dir = ST.Utility.get_param("sf");

    Vue.component("file-upload", {
        data: function() {

            return {
                directory_val: dir
            }
        },
        template: '<form action="javascript:void(0);" method="post">' +
        '<div class="instructions">Directory containing cali files:</div>' +
        '<input type="text" class="directory" v-model:value="directory_val" v-on:keyup="keyup( $event )"/>' +
        '<div class="update_button myButton" v-on:click="update( $event )">UPDATE</div>' +
        '</form>',
        methods: {
            keyup: function(e) {

                if( e.keyCode === 13 ) {
                    this.update(e);
                }
            },
            update: function( event ) {

                var dir = this.directory_val;
                ST.UrlStateManager.update_url("sf", dir);

                location.reload();
            }
        }
    });

    new Vue({
        'el': '#file_upload'
    });
}();