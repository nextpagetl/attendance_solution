/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((subRule) => {
          if (subRule.use && subRule.use.loader && subRule.use.loader.includes('css-loader')) {
            subRule.use.options = {
              ...subRule.use.options,
              esModule: false,
            };
          }
        });
      }
    });
    return config;
  },
};

export default nextConfig;