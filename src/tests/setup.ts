import "@testing-library/react";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("@/lib/firebase/client", () => ({
  app: {},
  auth: {},
  db: {},
}));

afterEach(() => {
  cleanup();
});
