import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
}));

vi.mock("firebase/auth", () => ({
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));