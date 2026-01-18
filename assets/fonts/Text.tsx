import { TextStyle } from "react-native";

export const typography = {
  title: {
    // style={typography['title']}
    fontSize: 40,
    lineHeight: 48,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "title-bold": {
    // style={typography['title-bold']}
    fontSize: 40,
    lineHeight: 48,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  title2: {
    // style={typography['title-2']}
    fontSize: 32,
    lineHeight: 39,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "title-2 bold": {
    // style={typography['title-2 bold']}
    fontSize: 32,
    lineHeight: 39,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  h1: {
    // style={typography['h1']}
    fontSize: 24,
    lineHeight: 29,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "h1-bold": {
    // style={typography['h1-bold']}
    fontSize: 24,
    lineHeight: 29,
    fontFamily: "BricolageGrotesque-ExtraBold",
  } as TextStyle,
  h2: {
    // style={typography['h2-bold']}
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "h2-bold": {
    // style={typography['h2-bold']}
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  subheader: {
    // style={typography['subheader']}
    fontSize: 14,
    lineHeight: 23,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "subheader-bold": {
    // style={typography['subheader-bold']}
    fontSize: 14,
    lineHeight: 23,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  label: {
    // style={typography['label']}
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "label-bold": {
    // style={typography['label-bold']}
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  body: {
    // style={typography['body']}
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "body-bold": {
    // style={typography['body-bold']}
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  button: {
    // style={typography['button']}
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "button-bold": {
    // style={typography['button-bold']}
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
};

export const fonts = {
  regular: "BricolageGrotesque-Regular",
  bold: "BricolageGrotesque-Bold",
  extrabold: "BricolageGrotesque-ExtraBold",
} as const;
