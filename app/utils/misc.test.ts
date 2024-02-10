import { describe, expect, test, vi } from "vitest";
import {
  ERROR_FALL_BACK_MESSAGE,
  generateCallAll,
  getErrorMessage,
  unvariant,
} from "./misc.ts";
import { faker } from "@faker-js/faker";
import type { Assertion, ExpectStatic } from "vitest";

describe("fn unvariant", () => {
  test("returns value if condition is true", () => {
    const value = faker.lorem.text();
    expect(unvariant(true, value)).toBe(value);
  });

  test("returns undefined if condition is false", () => {
    const value = faker.lorem.text();
    expect(unvariant(false, value)).toBe(undefined);
  });
});

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

describe("fn generateCallAll", () => {
  test("generates a function that calls everyone", () => {
    const fns = new Array(faker.number.int({ min: 1, max: 10 }))
      .fill(0)
      .map(() => vi.fn());

    generateCallAll(...fns)();

    expectArray(fns, (expected) => expected.toHaveBeenCalledOnce());
  });

  test("everyone receives args", () => {
    const fns = new Array(faker.number.int({ min: 1, max: 10 }))
      .fill(0)
      .map(() => vi.fn());

    const arg = [
      faker.lorem.slug(),
      faker.number.int(),
      faker.datatype.boolean(),
    ];

    generateCallAll(...fns)(...arg);

    expectArray(fns, (expected) => expected.toHaveBeenCalledWith(...arg));
  });
});

const expectArray = (
  actuals: Array<Parameters<ExpectStatic>[0]>,
  assert: (expected: Assertion) => void,
  message?: Parameters<ExpectStatic>[1],
) => {
  for (let idx = 0; idx < actuals.length; idx += 1) {
    const actual = actuals[idx]!;
    assert(
      expect(actual, `the ${idx + 1} time${message ? ` - ${message}` : ""}`),
    );
  }
};
