var Config=require("../../../config/config");
export default{
    entityModelRedundantKey:'_data',
    entityModelTitleKey:'title',
    paths:{
        uploadUrl:Config.getUploadUrl(),
        userApiUrl:Config.getUserApiUrl(),
        orgApiUrl:Config.getOrgApiUrl()
    }
}