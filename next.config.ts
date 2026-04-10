/** @type {import('next').NextConfig} */
const nextConfig = {
  // これを true にすると最新すぎる最適化でスマホが死ぬことがあるので一旦 false
  swcMinify: true, 
}
module.exports = nextConfig