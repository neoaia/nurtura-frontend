import { TextStyle } from "react-native";

export const typography = {
  title: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "title-bold": {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  h1: {
    fontSize: 24,
    lineHeight: 29,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "h1-bold": {
    fontSize: 24,
    lineHeight: 29,
    fontFamily: "BricolageGrotesque-ExtraBold",
  } as TextStyle,
  h2: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "h2-bold": {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  subheader: {
    fontSize: 14,
    lineHeight: 23,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "subheader-bold": {
    fontSize: 14,
    lineHeight: 23,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  label: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "label-bold": {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  body: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "body-bold": {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "BricolageGrotesque-Bold",
  } as TextStyle,
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "BricolageGrotesque-Regular",
  } as TextStyle,
  "button-bold": {
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
