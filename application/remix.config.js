/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
    serverDependenciesToBundle: ["@klevu/ui-react"],
    ignoredRouteFiles: ['.*'],
    appDirectory: 'src',
    devServerPort: 3019,
    // assetsBuildDirectory: "public/build",
    // serverBuildPath: "build/index.js",
    // publicPath: "/build/",
};
