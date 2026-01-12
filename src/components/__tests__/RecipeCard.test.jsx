import React from "react"; // obligatoriu
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RecipeCard from "../RecipeCard";

describe("RecipeCard", () => {
  it("afișează titlul rețetei", () => {
    const recipe = {
      title: "Pizza Margherita",
      images: [],
      userId: "123",
    };

    render(<RecipeCard recipe={recipe} isFavorite={false} />);
    expect(screen.getByText("Pizza Margherita")).toBeInTheDocument();
  });
});
