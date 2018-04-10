<template>
  <div v-html="value"></div>
</template>
<script>
export default {
    props:{
        value:{
            required:true
        }
    }
}
</script>

