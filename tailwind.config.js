/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#86975A",
        secondary: "#F4F1DE",
        accent: "#E07A5F",
        background: "#3D405B",
        grayText: "#919191",
        white: "#FAFAFA",
        black: "#424242",
      },
      boxShadow: {
        "sm-subtle": "0px 1.5px 5px rgba(0,0,0,0.25)",

        soft: "0px 1px 2px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        // Font family utilities
        ".font-bricolage": {
          fontFamily: "BricolageGrotesque-Regular",
        },
        ".font-bricolage-bold": {
          fontFamily: "BricolageGrotesque-Bold",
        },
        ".font-bricolage-extrabold": {
          fontFamily: "BricolageGrotesque-ExtraBold",
        },

        // Typography presets
        ".text-title": {
          fontSize: 32,
          lineHeight: 40,
          fontFamily: "BricolageGrotesque-Regular",
        },
        ".text-title-bold": {
          fontSize: 32,
          lineHeight: 40,
          fontFamily: "BricolageGrotesque-Bold",
        },

        ".text-h1": {
          fontSize: 24,
          lineHeight: 32,
          fontFamily: "BricolageGrotesque-Regular",
        },
        ".text-h1-bold": {
          fontSize: 24,
          lineHeight: 32,
          fontFamily: "BricolageGrotesque-ExtraBold",
        },

        ".text-h2": {
          fontSize: 20,
          lineHeight: 28,
          fontFamily: "BricolageGrotesque-Regular",
        },
        ".text-h2-bold": {
          fontSize: 20,
          lineHeight: 28,
          fontFamily: "BricolageGrotesque-Bold",
        },

        ".text-subheader": {
          fontSize: 18,
          lineHeight: 26,
          fontFamily: "BricolageGrotesque-Regular",
        },
        ".text-subheader-bold": {
          fontSize: 18,
          lineHeight: 26,
          fontFamily: "BricolageGrotesque-Bold",
        },

        ".text-label": {
          fontSize: 14,
          lineHeight: 20,
          fontFamily: "BricolageGrotesque-Regular",
        },
        ".text-label-bold": {
          fontSize: 14,
          lineHeight: 20,
          fontFamily: "BricolageGrotesque-Bold",
        },

        ".text-body": {
          fontSize: 16,
          lineHeight: 24,
          fontFamily: "BricolageGrotesque-Regular",
        },
        ".text-body-bold": {
          fontSize: 16,
          lineHeight: 24,
          fontFamily: "BricolageGrotesque-Bold",
        },

        ".text-button": {
          fontSize: 16,
          lineHeight: 20,
          fontFamily: "BricolageGrotesque-Bold",
          letterSpacing: 0.8,
        },
      });
    },
  ],
};
