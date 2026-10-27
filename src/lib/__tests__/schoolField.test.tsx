import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SchoolField } from "@/components/SchoolField";

describe("SchoolField", () => {
  it("lets players type to search the supplied schools or enter another school", () => {
    const html = renderToStaticMarkup(
      <SchoolField value="" onChange={() => undefined} />,
    );

    expect(html).toContain('list="profile-schools"');
    expect(html).toContain('placeholder="พิมพ์ค้นหาโรงเรียน หรือกรอกชื่ออื่น"');
    expect(html).toContain('value="โรงเรียนเชียงรายวิทยาคม"');
    expect(html).toContain('value="อื่น ๆ"');
  });
});
