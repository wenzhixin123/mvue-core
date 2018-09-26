<template>
    <div class="section">
        <slot>
            <Icon v-if="hasIcon" :type="icon" />
            {{value}}
        </slot>
    </div>
</template>

<script>
    export default {
        props: {
            "icon": {
                type:String
            },
            "value":{
                type:String
            },
        },
        data(){
            return {
            }
        },
        computed:{
          hasIcon:function () {
              if(_.isEmpty(this.icon)){
                  return false;
              }
              return true;
          }
        },
        mounted:function () {

        }
    }
</script>
