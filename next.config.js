const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Ignore optional dependencies that cause warnings
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };
    
    // Polyfills for Web3Auth (Buffer and process)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };
      
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    
    // Ignore warnings for optional dependencies
    config.ignoreWarnings = [
      { module: /@react-native-async-storage\/async-storage/ },
      { module: /pino-pretty/ },
    ];
    
    return config;
  },
  transpilePackages: ['@web3auth/modal'],
};

module.exports = nextConfig;



