var Config=require("../../config/config");
var runtimeUrl=Config.getActivitiRuntimeUrl();

var customActions = {
    //流程实例
    startProcess: {method: "POST", url: "v1/process-instances"}, //启动某个流程示例，参数中需传入commandType: StartProcessInstanceCmd
    deleteProcessInstance: {method: "DELETE", url: "v1/process-instances{/id}"}, //删除某个流程示例
    suspend: {method: "GET", url: "v1/process-instances{/id}/suspend"}, //挂起某个流程示例（支持所有请求格式）
    activate: {method: "GET", url: "v1/process-instances{/id}/activate"}, //激活某个流程示例（支持所有请求格式）
    sendSignal: {method: "GET", url: "v1/process-instances/signal"}, //发送信号*（支持所有请求格式，目前作用未知）
    getProcessInstanceDiagram: {method: "GET", url: "v1/process-instances{/id}/model"}, //获取某个流程示例带跟踪的图片
    getProcessInstanceById: {method: "GET", url: "v1/process-instances{/id}"}, //根据ID获取某个流程示例
    getProcessInstances: {method: "GET", url: "v1/process-instances"}, //获取可见的所有流程示例
    getProcessVariables: {method: "GET", url: "v1/process-instances{/id}/variables", responseType: "application/hal+json"}, //流程实例参数的查询
    setProcessVariables: {method: "POST", url: "v1/process-instances{/id}/variables", responseType: "application/hal+json"}, //流程实例参数的新增
    removeProcessVariables: {method: "DELETE", url: "v1/process-instances{/id}/variables", responseType: "application/hal+json"}, //流程实例参数的删除
    getProcessVariablesLocal: {method: "GET", url: "v1/process-instances{/id}/variables/local", responseType: "application/hal+json"}, //获取本流程实例的参数
    getProcessTasks: {method: "GET", url: "v1/process-instances{/id}/tasks"}, //获取某个流程实例下的任务（支持所有请求格式）
    getHistoryProcessInstances: {method: "GET", url: "v1/history/process-instances"}, //获取当前用户发起的流程示例
    //任务
    createNewTask: {method: "POST", url: "v1/tasks"}, //新增任务
    getTaskById: {method: "GET", url: "v1/tasks{/id}"}, //根据ID获取任务
    updateTask: {method: "PUT", url: "v1/tasks{/id}"}, //修改任务
    deleteTask: {method: "DELETE", url: "v1/tasks{/id}"}, //删除任务
    getTasks: {method: "GET", url: "v1/tasks"}, //查询当前用户的待办（任务）--查询条件：任务的候选者或指定的执行人是当前用户
    claimTask: {method: "POST", url: "v1/tasks{/id}/claim"}, //签收任务，--将任务的执行人设为当前用户
    releaseTask: {method: "POST", url: "v1/tasks{/id}/release"}, //释放任务，和签收任务相反
    completeTask: {method: "POST", url: "v1/tasks{/id}/complete"}, //完成任务，可携带完成任务时的参数
    createSubTask: {method: "POST", url: "v1/tasks{/id}/subtask"}, //创建子任务
    getSubTasks: {method: "GET", url: "v1/tasks{/id}/subtask"}, //查询子任务
    getTaskVariables: {method: "GET", url: "v1/tasks{/id}/variables", responseType: "application/hal+json"}, //任务参数的查询(包含父级和本身)
    setTaskVariables: {method: "POST", url: "v1/tasks{/id}/variables", responseType: "application/hal+json"}, //任务参数的查询(包含父级和本身)
    getTaskVariablesLocal: {method: "GET", url: "v1/tasks{/id}/variables/local", responseType: "application/hal+json"}, //任务参数的设置(仅包含任务本身)
    setTaskVariablesLocal: {method: "POST", url: "v1/tasks{/id}/variables/local", responseType: "application/hal+json"}, //任务参数的设置(仅包含任务本身)
    //流程定义
    getProcessDefinitions: {method: "GET", url: "v1/process-definitions"}, //获取当前用户可见的流程定义
    getProcessDefinitionById: {method: "GET", url: "v1/process-definitions{/id}"}, //获取当前用户可见的流程定义
    getProcessDefinitionDiagram: {method: "GET", url: "v1/process-definitions{/id}/model", responseType: "image/svg+xml"}, //获取流程定义图片
    getProcessDefinitionBPMN: {method: "GET", url: "v1/process-definitions{/id}/model", responseType: "image/svg+xml"}, //获取流程定义的bpmn模型(json格式)
    getProcessDefinitionXML: {method: "GET", url: "v1/process-definitions{/id}/model", responseType: "image/svg+xml"}, //获取流程定义的xml文件
    getProcessDefinitionMetadata: {method: "GET", url: "v1/process-definitions{/id}/meta", responseType: "application/hal+json"} //获取某个流程定义的全部信息
};
var $resource=Vue.resource('v1/tasks',null,customActions,{root:runtimeUrl});

export default {
    startProcess: $resource.startProcess,
    deleteProcessInstance: $resource.deleteProcessInstance,
    suspend: $resource.suspend,
    activate: $resource.activate,
    sendSignal: $resource.sendSignal,
    getProcessInstanceDiagram: $resource.getProcessInstanceDiagram,
    getProcessInstanceById: $resource.getProcessInstanceById,
    getProcessInstances: $resource.getProcessInstances,
    getProcessVariables: $resource.getProcessVariables,
    setProcessVariables: $resource.setProcessVariables,
    removeProcessVariables: $resource.removeProcessVariables,
    getProcessVariablesLocal: $resource.getProcessVariablesLocal,
    getProcessTasks: $resource.getProcessTasks,
    getHistoryProcessInstances: $resource.getHistoryProcessInstances,
    createNewTask: $resource.createNewTask,
    getTaskById: $resource.getTaskById,
    updateTask: $resource.updateTask,
    deleteTask: $resource.deleteTask,
    getTasks: $resource.getTasks,
    claimTask: $resource.claimTask,
    releaseTask: $resource.releaseTask,
    completeTask: $resource.completeTask,
    createSubTask: $resource.createSubTask,
    getSubTasks: $resource.getSubTasks,
    getTaskVariables: $resource.getTaskVariables,
    setTaskVariables: $resource.setTaskVariables,
    getTaskVariablesLocal: $resource.getTaskVariablesLocal,
    setTaskVariablesLocal: $resource.setTaskVariablesLocal,
    getProcessDefinitions: $resource.getProcessDefinitions,
    getProcessDefinitionById: $resource.getProcessDefinitionById,
    getProcessDefinitionDiagram: $resource.getProcessDefinitionDiagram,
    getProcessDefinitionBPMN: $resource.getProcessDefinitionBPMN,
    getProcessDefinitionXML: $resource.getProcessDefinitionXML,
    getProcessDefinitionMetadata: $resource.getProcessDefinitionMetadata
}