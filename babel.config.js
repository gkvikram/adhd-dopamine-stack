module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Required for resolving inline module imports smoothly across platform borders
        ],
    };
};
                            