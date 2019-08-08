<template>
  <div @click.stop="doHttpOpt">
    <slot>
      <Button type="primary" size="small" 
        :title="operation.title" >
        <m-icon :type="operation.icon"></m-icon>
        {{operation.title}}
      </Button>
    </slot>
</div>
</template>
<script>
import context from '../../libs/context';
var pathToRegexp = require('path-to-regexp');
var Qs=require("qs");
export default {
  props:{
    widgetContext:{//由使用操作的部件传入的部件上下文
      type:Object,
      required:true
    },
    operation:{//操作的定义，必传参数
      type:Object,
      required:true
    }
  },
  methods:{
    //query参数设置
    //paramsMapping:['name',{'name':'name2'}]
    buildQueryParams(requestOptions,_params){
      let queryParams=this.operation.params||{};
      //如果需要映射上下文数据到params中
      if(this.operation.paramsMapping){
        _.forEach(this.operation.paramsMapping,pm=>{
          if(_.isPlainObject(pm)){
            _.forIn(pm,(to,from)=>{
              if(_.has(_params,from)){
                queryParams[to]=_params[from];
              }
            });
          }else if(_.isString(pm)){
            if(_.has(_params,pm)){
              queryParams[pm]=_params[pm];
            }
          }
        });
      }
      if(!_.isEmpty(queryParams)){
        requestOptions.params=queryParams;
      }
    },
    //body参数设置
    //dataMapping:['name',{'name':'name2'}]
    buildBodyData(requestOptions,_params){
      let bodyData=this.operation.data||{};
      //如果需要映射上下文数据到params中
      if(_.isPlainObject(bodyData)&&this.operation.dataMapping){
        _.forEach(this.operation.dataMapping,pm=>{
          if(_.isPlainObject(pm)){
            _.forIn(pm,(to,from)=>{
              if(_.has(_params,from)){
                bodyData[to]=_params[from];
              }
            });
          }else if(_.isString(pm)){
            if(_.has(_params,pm)){
              bodyData[pm]=_params[pm];
            }
          }
        });
      }
      if(!_.isEmpty(bodyData)){
        requestOptions.data=bodyData;
      }
    },
    doHttpOpt(){
      if(!this.operation.url){
        console.log(`http操作未配置url`);
        return;
      }
      let requestOptions={
        paramsSerializer: function (params) {
          return Qs.stringify(params, {arrayFormat: 'brackets'});
        }
      };
      if(this.operation.method){
        requestOptions.method=this.operation.method;
      }
      let props=['responseType','headers','timeout','responseType','baseURL'];
      _.forEach(props,p=>{
        if(_.has(this.operation,p)){
          requestOptions[p]=this.operation[p];
        }
      });
      let _url=this.operation.url;
      //包含动态路径参数
      let _params=Object.assign({id:this.widgetContext.selectedId},this.widgetContext.selectedItem);
      if(_url.indexOf('/:')>-1){
        _url=pathToRegexp.compile(_url)(_params);
      }
      requestOptions.url=_url;
      this.buildQueryParams(requestOptions,_params);
      this.buildBodyData(requestOptions,_params);
      if(this.operation.confirm){
        context.confirm({
          title: '提示',
          content: this.operation.confirm,
          onOk: () => {
            this.doRequest(requestOptions);
          }
        });
      }else{
        this.doRequest(requestOptions);
      }
    },
    doRequest(requestOptions){
      this.$http.request(requestOptions).then(res=>{
        if(this.operation.message){
          this.$Message.success(this.operation.message);
        }
        context.grid&&context.grid.reload();
      },err=>{
        console.error(err);
        if(this.operation.error){
          this.$Message.error(this.operation.error);
        }
      });
    }
  }
}
</script>