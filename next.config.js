
module.exports = {
  reactStrictMode: true,
  compress: true,
  swcMinify: true,
  experimental: { optimizePackageImports: [] },
  async headers(){
    return [{source:'/(.*)', headers:[
      {key:'Cache-Control', value:'public, max-age=3600, stale-while-revalidate=86400'},
      {key:'X-Powered-By', value:'CCIOS V9 ULTRA FAST'}
    ]}]
  }
}
