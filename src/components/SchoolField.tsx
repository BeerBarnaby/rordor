import { OTHER_SCHOOL_VALUE, PROFILE_SCHOOLS } from "@/data/schools";

export function SchoolField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="school-field">
      <span>โรงเรียน / สถานศึกษา</span>
      <input
        type="search"
        list="profile-schools"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        minLength={2}
        maxLength={120}
        autoComplete="organization"
        placeholder="พิมพ์ค้นหาโรงเรียน หรือกรอกชื่ออื่น"
        required
      />
      <datalist id="profile-schools">
        {PROFILE_SCHOOLS.map((school) => (
          <option value={school} key={school} />
        ))}
        <option value={OTHER_SCHOOL_VALUE} />
      </datalist>
      <small>พิมพ์บางส่วนของชื่อเพื่อค้นหา หรือกรอกชื่อใหม่ได้เลย</small>
    </label>
  );
}
