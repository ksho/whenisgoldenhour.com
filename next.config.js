const path = require('path')
const withSourceMaps = require('@zeit/next-source-maps')

module.exports = withSourceMaps({
    pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

    webpack(config, { dev, defaultLoaders }) {
        // Absolute import paths https://moduscreate.com/blog/es6-es2015-import-no-relative-path-webpack/
        config.resolve.modules.push(path.resolve('./'))

        config.node = {
            Buffer: false
        }

        return config
    },
    exportPathMap() {
        return {
            '/': { page: '/' },
        }
    },
})
