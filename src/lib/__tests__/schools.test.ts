import { describe, expect, it } from "vitest";
import { OTHER_SCHOOL_VALUE, PROFILE_SCHOOLS } from "@/data/schools";

describe("profile school choices", () => {
  it("offers every school from the first three source pages once, followed by an other choice", () => {
    expect(PROFILE_SCHOOLS).toHaveLength(51);
    expect(new Set(PROFILE_SCHOOLS).size).toBe(51);
    expect(PROFILE_SCHOOLS).toContain("โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย");
    expect(PROFILE_SCHOOLS).toContain("วิทยาลัยเทคนิคเชียงราย");
    expect(PROFILE_SCHOOLS).toContain("โรงเรียนนานาชาติ เกนส์วิลล์ เชียงราย");
    expect(PROFILE_SCHOOLS).not.toContain(OTHER_SCHOOL_VALUE);
  });
});
