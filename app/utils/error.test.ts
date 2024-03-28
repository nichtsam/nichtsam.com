import { describe, expect, test } from "vitest";
import { ERROR_FALL_BACK_MESSAGE, getErrorMessage } from "./error.ts";
import { faker } from "@faker-js/faker";

describe("fn getErrorMessage", () => {
  test("gets message from Error object", () => {
    const message = faker.lorem.sentence();
    const error = new Error(message);
    expect(getErrorMessage(error)).toBe(message);
  });

  test("returns string right away", () => {
    const message = faker.lorem.sentence();
    expect(getErrorMessage(message)).toBe(message);
  });

  test("cases not covered fallback", () => {
    const error = null;
    expect(getErrorMessage(error)).toBe(ERROR_FALL_BACK_MESSAGE);
  });
});
