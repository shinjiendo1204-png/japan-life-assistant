/** @type {import('next').NextConfig} */
const nextConfig = {
  // 圧縮エンジンを低速だが確実なものに変更
  swcMinify: false,
  // 古いブラウザへの互換性を高める
  compiler: {
    removeConsole: false,
  },
}
module.exports = nextConfig