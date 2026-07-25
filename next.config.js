const fs = require('fs')
const path = require('path')
const withSourceMaps = require('@zeit/next-source-maps')

// This version of next predates built-in .env support, so read .env.local here
// and inline it at build time. The key is public either way once exported --
// what protects it is the HTTP referrer restriction on the domain. Keeping it
// in .env.local just keeps it out of the (public) repo.
function localEnv() {
    const file = path.resolve('./.env.local')
    if (!fs.existsSync(file)) return {}

    return fs.readFileSync(file, 'utf8').split('\n').reduce((env, line) => {
        const parsed = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/)
        if (parsed) env[parsed[1]] = parsed[2].replace(/^['"]|['"]$/g, '')
        return env
    }, {})
}

const GCP_MAPS_API = process.env.GCP_MAPS_API || localEnv().GCP_MAPS_API

if (!GCP_MAPS_API) {
    throw new Error('GCP_MAPS_API is missing -- set it in .env.local or the environment, or the build ships key=undefined')
}

module.exports = withSourceMaps({
    pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

    env: { GCP_MAPS_API },

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
