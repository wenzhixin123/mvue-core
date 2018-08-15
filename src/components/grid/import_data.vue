<template>
    <div class="grid-import-data-con">
        <div @click="showImport">
            <slot>
                <Button v-if="operation.toolbarType=='compact'" type="text"  :icon="operation.icon">{{operation.title}}</Button>
                <Button v-else type="primary"  :icon="operation.icon">{{operation.title}}</Button>
            </slot>
        </div>
        <Modal class="search-modal"
            v-model="importModal"
            width="560"
            title="数据导入"
            :scrollable="true"
            :mask-closable="false"
            >
            <div id="import-data-scroll-con" style="height:340px;overflow:auto;padding:4px;">
                <Steps :current="current" size="small" style="margin-bottom:20px;">
                    <Step title="上传Excel"></Step>
                    <Step title="映射关系"></Step>
                    <Step title="导入数据"></Step>
                </Steps>
                <div v-show="current===0">
                    <!-- <Alert>
                        导入数据详细步骤如下：
                        <template slot="desc">
                            <div>第一步：选择要导入的数据文件，数据文件只支持Excel类型文件(.xlsx或.xls)，Excel文件的第一行为标题行</div>
                            <div>
                                第二步：创建实体字段与Excel标题列间的映射关系
                                <Poptip trigger="hover" width="400">
                                    <a href="javascript://">详细说明</a>
                                    <div slot="content">
                                        <div class="detail-help">
                                            对于引用类型的字段，导入过程支持将名称转换为Id的操作，因此，对于'创建人'，'修改人'这些字段，Excel文件中该列的值可以直接写用户姓名，转换时可启用'显示名转Id'功能，导入时，系统将根据用户名查询用户Id，并进行保存针对名称转换为Id的操作，在Excel模板的标题行上可附加'|toid'，系统创建映射时，会自动选中”映射到值“的选项
                                        </div>
                                    </div>
                                </Poptip>
                            </div>
                        </template>
                    </Alert> -->
                    <div class="upload-con margin-top42">
                        <Row>
                            <Col span="24">
                                <import-file-upload v-model="model.file" :form-item="excelUploadFormItem" :paths="paths"></import-file-upload>
                                <div style="margin-left:auto;margin-right:auto;width:220px;margin-top:10px;">
                                    <!--

                                    <import-boolean v-model="modelForImport.overideOnDup" :form-item="overrideFormItem"></import-boolean>
                                    -->
                                    <a v-if="templateUrl.length>0" style="margin-left: 36px;" :href="templateUrl" >下载模板</a>
                                  <Alert  v-if="templateUrl.length<=0" type="warning" show-icon>管理员未设置模板</Alert>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div class="col-md-10 col-md-offset-1 font12 tips-color" style="margin-top:59px;">
                        <div>注意事项</div>
                        <div>
                            1.数据文件只支持Excel类型文件(.xlsx或.xls)，Excel文件的第一行为标题行
                        </div>
                        <div>
                            2.最多支持导入3000条数据
                        </div>
                        <div>
                            3.覆盖导入：导入过程中如发现同名，且对该数据有更新权限，则更新这条数据。
                        </div>
                    </div>
                </div>
                <div v-show="current===1">
                    <table class="table field-mapping-con" v-if="modelForImport.mappings&&modelForImport.mappings.length">
                        <thead>
                            <tr>
                                <th>序号</th>
                                <th>Excel列名</th>
                                <th></th>
                                <th>实体属性名</th>
                                <th>映射到值</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(mapping,index) in modelForImport.mappings" :key="index">
                                <th scope="row">{{index}}</th>
                                <td>{{mapping.headerText}}</td>
                                <td>&#x2192;</td>
                                <td>
                                    <select v-model="mapping.fieldName">
                                        <option v-for="field in metaEntity.fields" :value="field.name" :key="field.name">{{field.title}}</option>
                                    </select>
                                </td>
                                <td><input type="checkbox" v-model="mapping.nameToId" :true-value="true" :false-value="false"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-show="current===2">
                    <div class="progress-con margin-top42" v-if="progressData&&progressData.length&&!hasReport">
                        <Row v-for="(prg,index) in progressData" :key="index" v-if="index===3">
                            <Col span="24" class="textalignC font13">
                             正在导入数据...({{importedCount(prg)}})
                            </Col>
                        </Row>
                    </div>
                    <div class="report-con margin-top42" v-if="report">
                        <Row v-for="(sr,index) in report.summaryReport" :key="index">
                            <Col span="24" class="textalignL">
                            已成功创建<span class="highlight-number">{{sr.created}}</span>个/更新<span class="highlight-number">{{sr.updated}}</span>个[{{sr.entityDisplayName}}]记录 失败<span class="highlight-number">{{sr.error}}</span>个
                            </Col>
                        </Row>
                        <Row style="margin-top:20px;" v-if="errorRows().length>0">
                            <Col span="24" class="textalignL" style="color:#19be6b;margin-bottom:10px;">
                                提示信息
                            </Col>
                            <Col span="24" class="textalignL" v-for="(row,index) in errorRows()" :key="index">
                            第{{row.lineNo}}行 : {{row.error}}
                            </Col>
                        </Row>
                        <Row style="margin-top:10px;">
                            <Col span="24" class="textalignL">
                                <a href="javascript://" @click="doDownloadReport">下载报告详情</a>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button type="text" size="small" @click="cancel"><span>关闭</span></button>
                <Button type="primary" v-if="current===0" size="small" @click="doMapping"><span>下一步</span></button>
                <Button type="text" v-if="current===1" size="small" @click="previous"><span>上一步</span></button>
                <Button type="primary" v-if="current===1" size="small" @click="doImport"><span>开始导入</span></button>
                <Button type="primary" v-if="current===2" size="small" @click="reImport"><span>重新导入</span></button>
            </div>
        </Modal>
    </div>
</template>
<script>
import controlTypeService from '../form/js/control_type_service';
import constants from '../form/js/constants';
import toolService from '../../services/tool/tool_service';
import metaservice from "../../services/meta/metaservice";
import contextHelper from "../../libs/context"
import ExportCsv from './js/export_csv';

var dayjs = require("dayjs");
var Config=require("../../config/config.js");
export default {
    props:{
        operation:{
            type:Object,
            required:true
        },
        widgetContext:{
            type:Object,
            required:true
        }
    },
    data:function(){
        var _self=this;
        let excelUploadFormItem=controlTypeService.buildFormItemByComponentType(controlTypeService.componentTypes.FileUpload.id);
        excelUploadFormItem.dataField="file";
        excelUploadFormItem.componentParams.layout=controlTypeService.componentLayout.horizontal;
        excelUploadFormItem.componentParams.title="";
        excelUploadFormItem.componentParams.required=true;
        excelUploadFormItem.componentParams.multiple.isAllowed=false;
        excelUploadFormItem.componentParams.limitFileType.limit=true;
        excelUploadFormItem.componentParams.limitFileType.fileTypes=["xlsx","xls"];
        let overrideFormItem=controlTypeService.buildFormItemByComponentType(controlTypeService.componentTypes.Boolean.id);
        overrideFormItem.dataField="override";
        overrideFormItem.componentParams.layout=controlTypeService.componentLayout.horizontal;
        overrideFormItem.componentParams.title="是否覆盖已有数据";
        //let metaEntity=this.$metaBase.findMetaEntity(this.grid.metaEntity);
        let metaEntity=this.widgetContext.metaEntity;
        let grid=this.widgetContext.grid;
        if(!metaEntity){
            metaEntity=this.$metaBase.findMetaEntity(grid.metaEntity);
        }
        let entityName=metaEntity.name;
        return {
            grid:grid,
            metaEntity:metaEntity,
            importModal:false,
            model:{
                file:null
            },
            templateUrl:"",
            modelForImport:{
                file:null,
                swagger:null,
                entityName:entityName,
                mappings:[],
                callback:Config.getMetaserviceUrl()+"/meta_entity_event/on_imported",
                worksheet:0,
                startRowIndex:1,
                overideOnDup:true,
                otherFieldValues:this.parseImportQuery()
            },
            modelForMapping:{
                excelUrl:null,
                swaggerUrl:null,
                entityName:entityName
            },
            excelUploadFormItem:excelUploadFormItem,
            overrideFormItem:overrideFormItem,
            paths:constants.paths(),
            changedQueue:[],//智能验证变化队列
            progressData:[],//导入步骤的进度数据
            progressInterval:null,//进度获取定时器
            importId:null,//导入操作后的后端标志id，用来获取进度数据
            importFinished:null,//导入是否完成，null:未开始 false:一开始 true:结束
            report:null,//导入报告详细数据
            current:0,//表示进度条的位置
            hasReport:false//是否已经有报告了
        }
    },
    watch:{
        "model.file":function(){
            //一旦上传Excel文件，则重新计算Excel路径，并重设映射关系
            this.resetAndGetMapping();
        },
        importModal:function(){
            if(!this.importModal){
                this.closeProgressInterval();
                if(this.importFinished===false){
                    this.$Loading.finish();
                }
            }
            if(this.importModal&&!this.templateUrl){
                //初始化实体导入模板地址
                metaservice().getEntityTemplate({projectId:this.metaEntity.projectId,entityName:this.entityName})
                .then(({data})=>{
                    if(!_.isEmpty(data)){
                        this.templateUrl=Config.getUploadUrl()+"?filePath="+data["pathInfo"]["relativePath"]+"&filename="+encodeURIComponent(data["pathInfo"]["fileName"]);
                    }
                });
            }
        }
    },
    mounted:function(){
        var _this=this;
        //this.$validator.attach("file", {required:true});
        //获取当前项目的swagger地址
        this.$metaBase.currentSwagger(this.$route.params.projectId).then(function(swagger){
            _this.modelForImport.swagger=swagger;
            _this.modelForMapping.swaggerUrl=swagger;
        });
    },
    methods:{
        importedCount(prg){//已导入的数据数百分比
            if(prg.progress===100){
                return '99%';
            }
            return `${prg.progress}%`
        },
        parseImportQuery(){
            var _query=this.$route.query;
            var importQuery={};
            if(_query){
                _.each(_query,function(value,key){
                    if(key!="formShortId"&&key!="viewShortId"){
                        importQuery[key]=value;
                    }
                });
            }
            return importQuery;
        },
        progressStatus(status){
            if(status===3){
                return "success";
            }else if(status===2){
                return "wrong";
            }else if(status===1){
                return "active";
            }else{
                return "normal";
            }
        },
        resetAndGetMapping(){
            var _this=this;
            //清空进度
            this.closeProgressInterval();
            //标志导入未开始
            this.importFinished=null;
            //清空导入步骤的进度数据
            this.progressData=[];
            //清空导入操作后的后端标志id，用来获取进度数据
            this.importId=null;
            //清空报告数据
            this.report=null;
            this.hasReport=false;
            this.doValidation(function(){
                var fileRelativePath="";
                if(_this.model.file&&_this.model.file.length==1){
                    fileRelativePath=_this.model.file[0].url;
                }
                var fileUrl=`${_this.paths.uploadUrl}?filePath=${fileRelativePath}`;
                _this.modelForMapping.excelUrl=fileUrl;
                _this.modelForImport.file=fileUrl;
                toolService().getImportMapping(_this.modelForMapping).then(({data})=>{
                    //构造新的映射关系
                    var _mappings=[];
                    _.each(data.cols,function(col){
                        _mappings.push({
                            headerText:col.headerText,
                            fieldName: col.fieldName,
                            columnIndex: col.index,
                            nameToId: col.nameToId
                        });
                    });
                    _this.modelForImport.mappings=_mappings;
                });
            });
        },
        doValidation:function(callback){
            var _this=this;
            //启用智能校验
            /*Utils.smartValidate(_this,this.model,this.$validator,function(){
                callback&&callback();
            });*/
        },
        cancel(){
            this.importModal=false;
        },
        showImport(){
            this.importModal=true;
            //如果之前的导入过程还没结束就关闭了对话框，重新启动进度获取进程
            if(this.importFinished===false){
                this.startProgressInterval();
            }
        },
        closeProgressInterval(){
            if(null!==this.progressInterval){
                clearInterval(this.progressInterval);
            }
        },
        startProgressInterval(){
            /** 进度数据结构
             * [{"id":"98eff232-9e6e-4022-983a-20295a9f8326","title":"数据初始化","status":3,"progress":100},
             * {"id":"545b0b8f-686b-4419-993e-1abf95ef4870","title":"数据转换","status":3,"progress":100},
             * {"id":"0a04febf-4054-4406-a765-262819ac70c3","title":"创建引用实体","status":2,"progress":100},
             * {"id":"e3f55038-c754-42cb-84d7-e25d1f98a1d3","title":"导入实体数据","status":2,"progress":100},
             * {"id":"027741a6-9250-446b-85e8-0dd33b7fcb67","title":"生成报表","status":3,"progress":100}]
             */
            var _this=this;
            _this.progressInterval=setInterval(function(){
                if(!_this.importId){
                    return;
                }
                toolService().getImportProgress({id:_this.importId}).then(({data})=>{
                    _this.progressData=data;

                    let finished=true;
                    _.each(data,function(prg){
                        if(prg.status===0||prg.status===1){
                            finished=false;
                        }
                        //故意将失败的进度设置为50，100表示成功
                        if(prg.status===2){
                            prg.progress=50;
                        }
                    });
                    //如果有一个步骤失败了，则表示已经完成导入
                    _.each(data,function(prg){
                        if(prg.status===2){
                            finished=true;
                            return false;
                        }
                    });
                    //标志当前导入的全局状态
                    _this.importFinished=finished;
                    if(finished){//如果步骤都处理完成（只有失败2或者成功3的状态），停止定时获取进度
                        _this.closeProgressInterval();
                        _this.getReport();
                        _this.$Loading.finish();
                        _this.grid&&_this.grid.reload();
                    }
                });
            },300);
        },
        getReport(){//导入完成后获取导入的报告
            var _this=this;
            if(this.importFinished){
                toolService().getImportReport({id:this.importId}).then(({data})=>{
                    _this.report=data;
                    _this.hasReport=true;
                });
            }
        },
        doImport(){
            if(this.importFinished===false){
                contextHelper.info("正在导入数据");
                return;
            }
            if(this.importFinished===true){
                contextHelper.info("已经完成导入，请上传新的Excel文件后导入");
                return;
            }
            var _this=this;
            this.doValidation(function(r){
                _this.current=_this.current+1;
                //显示导入对话框
                _this.importModal=true;
                //标志导入开始，但未完成
                _this.importFinished=false;
                _this.$Loading.start();
                toolService().doImport(_this.modelForImport).then(({data})=>{
                    _this.importId=data;
                    //开始定时获取进度数据，直到导入步骤完成
                    _this.startProgressInterval();
                });
            });
        },
        doDownloadTmpl(){
            alert("TODO");
        },
        doDownloadReport(){//根据报告生成csv数据下载
            if(!this.report){
                return;
            }
            var reportName=this.report.title?this.report.title:this.metaEntity;
            var data=[];
            var padding="               ";
            if(this.report.summaryReport){
                let _date="";
                if(this.report.date){
                    _date=dayjs(this.report.date).format('YYYY-MM-DD HH:mm:ss');
                }
                data.push(`${reportName} ${_date}`);
                let _header1=["实体名称", "实体显示名称", "已创建", "已更新", "出错"];
                data.push(_header1.join(padding));
                _.forIn(this.report.summaryReport,function(sr,key){
                    data.push(`${sr.entityName}${padding}${sr.entityDisplayName}${padding}${sr.created}${padding}${sr.updated}${padding}${sr.error}`);
                });
            }
            if(this.report.exceptionMsg){
                data.push(this.report.exceptionMsg);
            }
            if(this.report.exceptionStack){
                data.push(this.report.exceptionStack);
            }
            function buildData(data,initData){
                _.forIn(initData,function(value,key){
                    if(!value.title){
                        return;
                    }
                    data.push(`${value.title}`);
                    data.push(value.headerTexts.join(padding));
                    _.each(value.rows,function(row){
                        row[0]=row[0]===0?'创建':(row[0]===1?'更新':(row[0]===2?"出错":row[0]));
                        data.push(row.join(padding));
                    });
                });
            }
            if(this.report.entityReport){
                buildData(data,[this.report.entityReport])
            }
            if(this.report.relatedEntityReport){
                buildData(data,this.report.relatedEntityReport)
            }
            data=data.join("\r\n");
            ExportCsv.download(`${reportName}.csv`, data);
        },
        previous(){//上一步
            this.current=this.current-1;
        },
        doMapping(){//下一步，设置映射关系
            var _this=this;
            this.doValidation(function(r){
                _this.current=_this.current+1;
            });
        },
        reImport(){//重新导入设置
            this.current=0;
            this.model.file=null;
        },
        errorRows(){//导入完成后错误的数据
            let entityReport=this.report&&this.report.entityReport;
            if(entityReport){
                let r=[];
                _.each(entityReport.rows,function(row,index){
                    if(row[0]===2){
                        r.push({
                            lineNo:index+1,
                            error:row[row.length-1]
                        });
                    }
                });
                return r;
            }else{
                return [];
            }
        }
    },
    components:{
        importFileUpload:require('../form/control_tmpl/import_file_upload'),
        importBoolean:require('../form/control_tmpl/import_boolean'),
    }
}
</script>
<style lang="scss">
.grid-import-data-con{
    display:inline-block;
}
/*.detail-help{
    word-break: break-all;
    word-wrap: break-word;
    height: 120px;
    overflow: hidden;
    white-space: normal;
}*/
.highlight-number{
    color:#ff9900;
}
.margin-top42{
    margin-top:42px;
}
</style>


