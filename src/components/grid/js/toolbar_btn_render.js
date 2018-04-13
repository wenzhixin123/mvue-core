/**
 * 用于根据grid组件的toolbar设置的render函数渲染按钮的组件
 */
export default {
    name: 'toolbarBtnRender',
    functional: true,
    props: {
        render: Function,
        toolbarBtn: Object,
        toolbarType:String
    },
    render: (h, ctx) => {
        const params = {
            toolbarBtn: ctx.props.toolbarBtn,
            toolbarType:ctx.props.toolbarType
        };
        return ctx.props.render(h, params);
    }
};