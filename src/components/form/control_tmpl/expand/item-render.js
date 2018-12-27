export default {
    name: 'ItemRender',
    functional: true,
    props: {
        entity: Object,
        metaField: Object,
        render: Function
    },
    render: (h, ctx) => {
        const params = {
            row: ctx.props.entity,
        };
        return ctx.props.render(h, params);
    }
};