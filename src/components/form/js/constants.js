import context from "../../../libs/context";
export default {
    entityModelRedundantKey:'_data',
    entityModelTitleKey:'title',
    paths(){
        return {
            uploadUrl:context.getConfig().getUploadUrl(),
            userApiUrl:context.getConfig().getUserApiUrl()+"{/id}",
            orgApiUrl:context.getConfig().getOrgApiUrl()+"{/id}"
        };
    }
}