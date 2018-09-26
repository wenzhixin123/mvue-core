<template>
    <Tabs>
        <TabPane v-for="(pane,index) in panes" :key="index" :label="pane.title">
            <meta-layout :settings="paneLayout(pane.layout)"></meta-layout>
        </TabPane>
    </Tabs>
</template>

<script>
    import  layoutConvertor from "../meta-layout/layout-convertor";
    export default {
        props: {
            "panes": {
                type: Array,
                required: true,
            }
        },
        data(){
            return {
                processed:false,
            }
        },
        mounted:function () {
            this.processed=true;
        },
        methods:{
                paneLayout:function (setting) {
                    if(_.isArray(setting)){
                        return setting;
                    }
                    var pageSetting=layoutConvertor.convert(setting);
                    return pageSetting.layout;
                }
        },
        components:{
            metaLayout:require("../meta-layout/index")
        }
    }
</script>
