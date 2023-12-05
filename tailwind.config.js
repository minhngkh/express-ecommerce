module.exports = {
  content: ["./src/views/**/*.hbs"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        "2xsm": "375px",
        xsm: "425px",
      },
    },
  },

  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
