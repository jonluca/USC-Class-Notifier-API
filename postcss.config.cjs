const config = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production" && !process.env.DEBUG ? { cssnano: {} } : {}),
  },
};

module.exports = config;
