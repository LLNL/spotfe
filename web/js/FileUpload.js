ST.FileUpload = function() {

    var dir = ST.Utility.get_param("sf");

    const fuapp = Vue.createApp({});

    fuapp.component("file-upload", {
        data: function() {

            return {
                directory_val: dir
            }
        },
        template: '<form action="javascript:void(0);" method="post">' +
        //'<div class="instructions">Directory containing cali files:</div>' +
        '<input type="text" class="directory" v-on:keyup="keyup( $event )"/>' +
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

                var dir = $('.directory').val();
                ST.UrlStateManager.update_url("sf", dir);

                location.reload();
            }
        }
    });

    fuapp.mount("#file_upload");
}();
