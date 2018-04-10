/**
 * 用于根据grid组件的toolbar设置的render函数渲染按钮的组件
 */
export default {
    name: 'toolbarBtnRender',
    functional: true,
    props: {
        render: Function,
        toolbarBtn: Object
    },
    render: (h, ctx) => {
        const params = {
            toolbarBtn: ctx.props.toolbarBtn,
        };
        return ctx.props.render(h, params);
    }
};