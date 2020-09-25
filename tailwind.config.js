// tailwind.config.js
module.exports = {
  theme: {
    inset: {
      "1/2": "50%",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    fontFamily: {
      display: ["Mukta", "sans-serif"],
      body: ["Mukta", "sans-serif"],
    },
    extend: {
      spacing: {
        "1/2": "50%",
        "n-1/2": "-50%",
      },
    },
  },
};
