import { render, screen } from "@testing-library/react-native";
import React from "react";
import { Text, View } from "react-native";

const SimpleComponent = () => (
  <View>
    <Text>Hello Nurtura!</Text>
  </View>
);

test("Testing Library works and finds text", () => {
  render(<SimpleComponent />);

  const element = screen.getByText("Hello Nurtura!");

  expect(element).toBeTruthy();
});
