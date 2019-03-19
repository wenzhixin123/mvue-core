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
      var self = this;
      var mainEntityName = this.$route.params.entityName;
      var relationName = this.$route.params.relation;
      var subPage = this.$route.params.subPage;
      var mainRecordId = this.$route.params.id;
      var subRecordId = this.$route.params.subId;

      var mainMetaEntity = this.$metaBase.findMetaEntity(mainEntityName);
      if (mainMetaEntity == null) {
        this.errorObj.has = true;
        this.errorObj.message = `实体${mainEntityName}不存在`;
        return;
      }
      var metaRelation = mainMetaEntity.relations[relationName];
      if (metaRelation == null) {
        this.errorObj.has = true;
        this.errorObj.message = `实体${mainEntityName}不存在关系${relationName}`;
        return;
      }
      var subMetaEntity = this.$metaBase.findMetaEntity(metaRelation.targetEntity);
      try {
        var settings = null;
        if (_.isEmpty(settings)) {
          settings = await mainMetaEntity.getRelationPage(relationName,subPage);
        }
        this.pageSettings = metaLayoutConvertor.convert(settings, self);
        metaLayoutConvertor.visit(this.pageSettings, (widget) => {
          if (widget.ctype == "m-form" || widget.ctype == "m-detail-view") {
            widget["entityName"] = subMetaEntity.name;
            if (subPage == "create") {
              widget["recordId"] = null;
            }
            if (subRecordId) {
              widget["recordId"] = subRecordId;
            }
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

