const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  arrowParens: "always",
  printWidth: 80,
  singleQuote: false,
  jsxSingleQuote: false,
  semi: true,
  trailingComma: "all",
  tabWidth: 2,

  overrides: [
    {
      files: "*.hbs",
      options: {
        parser: "glimmer",
      },
    },
    // {
    //   files: "layout.hbs",
    //   options: {
    //     parser: "html",
    //   },
    // },
  ],
};

module.exports = config;
