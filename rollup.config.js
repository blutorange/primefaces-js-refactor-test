const defaults = {
    output: {
        dir: "dist",
        format: 'iife',
        globals: {
            "jquery": '$',
            "../../core/core-widget.js": 'PrimeFaces.widget',
        },
    },
    external: ["jquery"],
};

export default [
    {
        ...defaults,
        input: 'src/bundles/components.js',
    },
    {
        ...defaults,
        input: 'src/bundles/core.js',
    },
];
