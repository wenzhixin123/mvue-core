<template>
  <meta-page 
    :error-obj="errorObj" 
    :lazy="true"
    :preprocessed="ready"
    :no-page="true"
    :page-settings="pageSettings"></meta-page>
</template>
<script>
  import metaLayoutConvertor from '../../meta-layout/layout-convertor';
  export default {
    data: function () {
      var errorObj = {has: false, code: null, message: null};
      return {
        errorObj: errorObj,
        ready: false,
        pageSettings: null,
      };
    },
    mounted: async function () {
      let self = this;
      let metaEntity1 = this.$metaBase.findMetaEntity(this.$route.params.entityName);
      if (metaEntity1 == null) {
        this.errorObj.has = true;
        this.errorObj.message = `实体${this.$route.params.entityName}不存在`;
        return;
      }
      let relation = metaEntity1.relations[this.$route.params.relation];
      if (relation == null) {
        this.errorObj.has = true;
        this.errorObj.message = `实体${metaEntity1.name}未配置关系${this.$route.params.relation}`;
        return;
      }
      let metaEntity2 = this.$metaBase.findMetaEntity(relation.targetEntity);
      let id2 = this.$route.params.subId;
      let thirdPage=this.$route.params.thirdPage;
      try {
        var settings = await metaEntity2.getPage(thirdPage);
        if (_.isEmpty(settings)) {
          this.$router.push({path: this.$route.path + "/list", query: this.$route.query});
          return;
        }
        this.pageSettings = metaLayoutConvertor.convert(settings, self);
        _.forEach(this.pageSettings.layout, com => {
          if (com.ctype == "m-form" || com.ctype == "m-detail-view") {
            com["showHeader"] =false;
            com["entityName"] = metaEntity2.name;
            com["recordId"] = id2;
          }
        });
        this.ready = true;
      } catch (e) {
        this.errorObj.has = true;
        this.errorObj.message = e;
      }
    }
  };
</script>

