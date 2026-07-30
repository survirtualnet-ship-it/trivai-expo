const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

const zustandRoot = path.dirname(require.resolve('zustand/package.json'))

/**
 * Metro web resolves zustand's ESM build (`import.meta.env`), but Expo
 * exports load bundles as classic scripts — that syntax crashes before React mounts.
 * Force the CJS build (`process.env.NODE_ENV`) on all platforms.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    const subpath =
      moduleName === 'zustand'
        ? 'index.js'
        : `${moduleName.slice('zustand/'.length)}.js`

    return {
      type: 'sourceFile',
      filePath: path.join(zustandRoot, subpath),
    }
  }

  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
