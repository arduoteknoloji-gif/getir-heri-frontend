const path = require("path");
require("dotenv").config();

// Development kontrolü
const isDev = process.env.NODE_ENV !== "production";

const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
};

// Health Check Plugin'leri (opsiyonel)
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  try {
    WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
    setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
    healthPluginInstance = new WebpackHealthPlugin();
    console.log("✅ [Health Check] Plugin başarıyla yüklendi");
  } catch (err) {
    console.warn("⚠️ [Health Check] Plugin yüklenemedi:", err.message);
  }
}

module.exports = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },

  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },

    configure: (webpackConfig) => {
      // Performans iyileştirmesi - node_modules ve gereksiz klasörleri izleme
      webpackConfig.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/build/**',
          '**/dist/**',
          '**/coverage/**',
          '**/public/**',
        ],
      };

      // Health Check Plugin ekle (sadece aktifse)
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins = webpackConfig.plugins || [];
        webpackConfig.plugins.push(healthPluginInstance);
      }

      return webpackConfig;
    },
  },

  // devServer yapılandırması - En stabil yöntem
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
        try {
          setupHealthEndpoints(devServer, healthPluginInstance);
          console.log("✅ [Health Check] Endpoints kuruldu");
        } catch (err) {
          console.warn("⚠️ [Health Check] Endpoints kurulurken hata:", err.message);
        }
      }
      return middlewares;
    },
  },
};