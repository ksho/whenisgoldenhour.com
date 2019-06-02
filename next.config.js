const path = require('path')
const withTypescript = require('@zeit/next-typescript')
const withSourceMaps = require('@zeit/next-source-maps')

module.exports = withTypescript(withSourceMaps({
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
}))
