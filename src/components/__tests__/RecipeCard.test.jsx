/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RecipeCard from "../RecipeCard";

describe("RecipeCard", () => {
  it("afișează titlul rețetei", () => {
    const recipe = {
      title: "Pizza Margherita",
      images: [],
      userId: "123",
      averageRating: 0, // Adăugat pentru a evita erori de undefined în componentă
      ratingsCount: 0
    };

    render(<RecipeCard recipe={recipe} isFavorite={false} />);
    expect(screen.getByText("Pizza Margherita")).toBeInTheDocument();
  });
});