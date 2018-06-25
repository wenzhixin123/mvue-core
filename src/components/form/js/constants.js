var Config=require("../../../config/config");
export default {
    entityModelRedundantKey:'_data',
    entityModelTitleKey:'title',
    paths(){
        return {
            uploadUrl:Config.getUploadUrl(),
            userApiUrl:Config.getUserApiUrl()+"{/id}",
            orgApiUrl:Config.getOrgApiUrl()+"{/id}"
        };
    }
}