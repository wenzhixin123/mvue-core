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
      let relation2=metaEntity2.relations[this.$route.params.relation2];
      if (relation2 == null) {
        this.errorObj.has = true;
        this.errorObj.message = `实体${metaEntity2.name}未配置关系${this.$route.params.relation2}`;
        return;
      }
      let metaEntity3 = this.$metaBase.findMetaEntity(relation2.targetEntity);
      let id3=this.$route.params.id3;
      let thirdPage=this.$route.params.thirdPage;
      try {
        var settings = null;
        if (_.isEmpty(settings)) {
          settings = await metaEntity2.getRelationPage(relation2.name,thirdPage);
        }
        this.pageSettings = metaLayoutConvertor.convert(settings, self);
        metaLayoutConvertor.visit(this.pageSettings, (widget) => {
          if (widget.ctype == "m-form" || widget.ctype == "m-detail-view") {
            widget["entityName"] = metaEntity3.name;
            if (thirdPage == "create") {
              widget["recordId"] = null;
            }
            if (id3) {
              widget["recordId"] = id3;
            }
          }
        });
        this.ready = true;
      } catch (e) {
        console.error(e);
        this.errorObj.has = true;
        this.errorObj.message = e;
      }
    }
  };
</script>

