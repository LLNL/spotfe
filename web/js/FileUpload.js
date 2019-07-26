ST.FileUpload = function() {

    var dir = ST.Utility.get_param("sf");

    Vue.component("file-upload", {
        data: function() {

            return {
                directory_val: dir
            }
        },
        template: '<form action="/" method="post">' +
        '<div class="instructions">Directory containing cali files:</div>' +
        '<input type="text" class="directory" v-model:value="directory_val"/>' +
        '<div class="update_button myButton" v-on:click="update( $event )">UPDATE</div>' +
        '</form>',
        methods: {
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