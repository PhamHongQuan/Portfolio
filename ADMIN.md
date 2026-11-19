# Admin: sửa nội dung portfolio

Trang `/admin` nằm ngay trong app này. Trang công khai chỉ **đọc** Supabase; mọi thao tác ghi đi qua `/admin`.

```
/admin ──đăng nhập + ghi (RLS)──▶ Supabase (bảng site_content + bucket portfolio)
   │                                   │
   └─server action publish──▶ xoá cache tag "content" ──▶ trang / đọc lại──┘
```

Thêm trường mới vào `lib/content.ts` thì sau khi deploy form admin tự có ô cho trường đó (form sinh từ cấu trúc mặc định).

---

## 1. Thiết lập Supabase (làm một lần)

1. Tạo project Supabase.
2. Mở `supabase/schema.sql`, thay `admin@example.com` bằng email tài khoản admin, chạy trong **SQL Editor**.
3. Chạy `supabase/seed.sql` để đổ nội dung hiện tại lên (4 dòng: `en`, `vi`, `profile`, `settings`).
   - Sinh lại file seed từ `lib/content.ts`: `npm run seed`.
4. Trong **Authentication → Users**, tạo user với đúng email ở bước 2 (tắt đăng ký công khai: *Authentication → Sign In / Providers → Allow new users to sign up* = off).

### Bảng `public.site_content`

| Cột          | Kiểu          | Ghi chú                                                     |
| ------------ | ------------- | ----------------------------------------------------------- |
| `key`        | `text` PK     | Chỉ nhận `'en'`, `'vi'`, `'profile'`, `'settings'`          |
| `data`       | `jsonb`       | Nội dung, cấu trúc ở mục 3                                  |
| `updated_at` | `timestamptz` | Tự cập nhật bằng trigger khi update                          |

RLS:
- `select`: ai cũng đọc được (portfolio dùng anon key).
- `insert/update/delete`: chỉ user đã đăng nhập có email admin.

### Storage bucket `portfolio`

- Public read, chỉ admin được upload/xoá.
- URL công khai: `https://<project>.supabase.co/storage/v1/object/public/portfolio/<đường-dẫn>`
- Portfolio đã khai báo domain này cho `next/image` (`next.config.ts → images.remotePatterns`).
- Dùng được ngay cho: `profile.cv` (link file PDF). Ảnh dự án **chưa có chỗ hiển thị** trên trang; khi cần thì thêm trường (ví dụ `projects.items[].image`) vào `lib/content.ts` và component trước, admin mới có chỗ để ghi.

---

## 2. Biến môi trường (`.env.local`, và trên Vercel)

| Biến                 | Ví dụ                       | Dùng để                                                         |
| -------------------- | --------------------------- | --------------------------------------------------------------- |
| `SUPABASE_URL`       | `https://xxxx.supabase.co`  | Đọc/ghi `site_content`. Thiếu → trang dùng mặc định, `/admin` báo chưa cấu hình |
| `SUPABASE_ANON_KEY`  | `eyJ...`                    | Anon key. Quyền ghi đến từ RLS (email admin), **không** cần service role key |

`/admin` được prerender nên đọc hai biến này lúc build: đổi biến thì deploy lại.

---

## 3. Cấu trúc dữ liệu

Nguồn chuẩn: `lib/content.ts` (giá trị mặc định + kiểu). Phần dưới để tham khảo khi sửa thẳng dữ liệu trong Supabase.

### Quy tắc portfolio áp dụng khi đọc (`lib/merge.ts → fromRows`)

Portfolio **không bao giờ vỡ** vì dữ liệu sai, nhưng sẽ âm thầm thay bằng giá trị khác. Admin cần biết để không bất ngờ:

- Mỗi trường được lấy từ Supabase **nếu đúng kiểu** (string/number/boolean/object/array) so với mặc định; sai kiểu → dùng giá trị mặc định trong `lib/content.ts`.
- Thiếu trường ở object → dùng giá trị mặc định.
- **Mảng** được thay nguyên mảng. Phần tử thiếu trường → trường đó thành rỗng (`""`, `0`, `false`, `[]`), không lấy mặc định.
- Trường lạ (không có trong mặc định) bị bỏ qua. Muốn thêm trường mới phải sửa code portfolio trước.
- Dòng nào không tồn tại / request lỗi → toàn bộ dùng mặc định (lỗi log ra console server).
- `en` và `vi` phải **cùng cấu trúc**, cùng số phần tử ở các mảng tương ứng (dự án, kinh nghiệm...) để hai ngôn ngữ khớp nhau.
- Chuỗi rỗng `""` ở `profile` = ẩn mục đó trên trang.

### 3.1 `key = 'profile'` (chung cho mọi ngôn ngữ)

```ts
type Profile = {
  email: string;     // hiện ở Contact, PrintCV, JSON-LD
  phone: string;     // chữ hiển thị, vd "0364 543 769"
  phoneHref: string; // "tel:0364543769"
  site: string;      // URL gốc, phải là URL hợp lệ (dùng cho metadata, sitemap, robots)
  github: string;    // "" = ẩn
  linkedin: string;  // "" = ẩn
  cv: string;        // "" = nút "Download CV" đổi thành "Work"; có thể là URL Storage
};
```

> ⚠️ `phone` hiện có 11 chữ số (`0364 543 7696`), số di động VN chỉ có 10. Kiểm tra lại.

### 3.2 `key = 'en'` và `key = 'vi'` (nội dung theo ngôn ngữ)

```ts
type Content = {
  name: string; // tên lớn ở Hero, title share, tác giả metadata (lấy từ bản en)

  ui: { language: string; toLight: string; toDark: string; menu: string; close: string;
        nav: string; backToTop: string; copy: string; copied: string };

  weather: {
    fallbackCity: string;
    kinds: { clear: string; cloudy: string; fog: string; drizzle: string; rain: string; storm: string; snow: string };
  };

  cv: { profile: string; experience: string; projects: string; skills: string; education: string }; // tiêu đề bản in CV

  nav: { about: string; stack: string; work: string; experience: string; contact: string };

  hero: {
    status: string;
    role: string;      // "Frontend developer": hiện ở Hero, OG image, JSON-LD jobTitle
    intro: string;
    primary: string;   // nút "Get in touch"
    secondary: string; // nút "Download CV"
    stack: string[];   // dải chữ chạy dưới Hero; 4 cái đầu lên ảnh OG
  };

  about: {
    title: string;
    lead: string;
    body: string[];                              // các đoạn văn
    stats: { value: number; label: string }[];   // value là SỐ; thẻ đầu tiên tô màu accent
    principlesTitle: string;
    principles: { title: string; text: string }[]; // nên 4 cái (lưới 4 cột)
  };

  stack: {
    title: string;
    intro: string;
    layers: { name: string; level: string; text: string; tools: string[] }[]; // layer đầu = thẻ lớn
  };

  projects: {
    title: string; intro: string; visit: string; caseStudy: string; back: string; prev: string; next: string;
    labels: { role: string; year: string; context: string; did: string; outcome: string; stack: string };
    items: {
      name: string;
      kind: string;
      year: string;        // chuỗi, không phải số
      description: string;
      stack: string[];
      url: string;         // BẮT BUỘC và DUY NHẤT giữa các dự án (dùng làm key của scene)
      study: { role: string; context: string; did: string[]; outcome: string };
    }[];
  };

  experience: {
    title: string; intro: string; stackLabel: string;
    jobs: { period: string; role: string; org: string; meta: string; points: string[]; stack: string[] }[];
    educationTitle: string;
    education: { period: string; title: string; org: string; note: string }[];
  };

  contact: { title: string; lead: string; labels: { phone: string; location: string }; location: string };

  footer: { tagline: string; rights: string };
};
```

### 3.3 `key = 'settings'`

```ts
type SectionId = "about" | "stack" | "projects" | "experience" | "contact";

type Settings = {
  // Thứ tự và ẩn/hiện các phần. Hero luôn đứng đầu, không nằm trong danh sách.
  sections: { id: SectionId; visible: boolean }[];

  // Ghi đè màu theo theme. Chỉ nhận các token dưới đây; giá trị là màu CSS
  // (#hex, rgb(...), hsl(...)), không được chứa ; { } < >.
  theme: {
    light: Partial<Record<ThemeToken, string>>;
    dark:  Partial<Record<ThemeToken, string>>;
  };

  seo: {
    title: string;       // <title> trang chủ, og:title
    description: string; // meta description, cũng dùng cho các link share scene
    keywords: string[];
  };
};

type ThemeToken = "bg" | "surface" | "ink" | "muted" | "line" | "accent" | "on-accent" | "sun" | "sun-ink" | "glow";
```

Giá trị mặc định:

```json
{
  "sections": [
    { "id": "about", "visible": true },
    { "id": "stack", "visible": true },
    { "id": "projects", "visible": true },
    { "id": "experience", "visible": true },
    { "id": "contact", "visible": true }
  ],
  "theme": { "light": {}, "dark": {} },
  "seo": {
    "title": "Phạm Hồng Quân, Frontend Developer",
    "description": "Frontend developer building fast, responsive interfaces with React, Next.js and Tailwind CSS, with enough backend to wire them to real APIs.",
    "keywords": ["Frontend Developer", "React", "Next.js", "TypeScript", "Tailwind CSS", "REST API", "Laravel"]
  }
}
```

Quy tắc với `sections`:
- `id` lạ hoặc trùng bị bỏ; id bị thiếu tự thêm vào cuối với giá trị mặc định (`visible: true`).
- Phần tử thiếu `visible` → coi là `false` (ẩn). Luôn ghi đủ cả hai trường.
- Menu header/footer tự theo thứ tự và ẩn mục bị ẩn.

Màu mặc định hiện tại (từ `app/globals.css`):

| Token       | Light                    | Dark                        |
| ----------- | ------------------------ | --------------------------- |
| `bg`        | `#edf5f1`                | `#04100c`                   |
| `surface`   | `#ffffff`                | `#0a1c16`                   |
| `ink`       | `#0b1f18`                | `#e7f4ee`                   |
| `muted`     | `#3c574c`                | `#b2c9bf`                   |
| `line`      | `#d2e2da`                | `rgb(255 255 255 / 0.08)`   |
| `accent`    | `#0e8a5a`                | `#3ddc97`                   |
| `on-accent` | `#ffffff`                | `#03140d`                   |
| `sun`       | `#f2c94c`                | `#f3d37a`                   |
| `sun-ink`   | `#7d6200`                | `#f3d37a`                   |
| `glow`      | `rgb(14 138 90 / 0.16)`  | `rgb(61 220 151 / 0.22)`    |

Màu phong cảnh (trời, núi, cây, nước...) **không** cho chỉnh từ admin.

---

## 4. Những gì admin KHÔNG điều khiển được (cố định trong code)

- **Phong cảnh của từng scene** gắn với section, không theo thứ tự: Hero = toàn cảnh đêm, About = hồ đêm, Principles = bìa rừng, Stack = rừng sâu, Projects = sông/đồng cỏ/cây đơn (lặp lại theo thứ tự dự án), Experience = thung lũng sương, Education = hồ trước bình minh, Contact = bình minh. Đổi thứ tự section thì "hành trình đêm → bình minh" cũng bị xáo; mặc định là thứ tự đẹp nhất.
- Principles đi chung với About, Education đi chung với Experience (ẩn cha là ẩn luôn con).
- Hiệu ứng film/scroll, chất lượng thấp cho máy yếu, thời tiết, mùa/lễ: chỉnh trong code.
- Logo (`public/logo.png`, `public/logo-mark.png`, `app/icon.png`), font chữ.
- Địa chỉ trong JSON-LD (Ho Chi Minh City, VN).
- Bản in CV (Ctrl+P) luôn in đủ mọi phần, kể cả phần đang ẩn trên trang.

---

## 5. Dùng trang admin

1. Mở `/admin`, đăng nhập bằng tài khoản admin (Supabase Auth).
2. Ba tab:
   - **Nội dung**: mọi trường của `en` và `vi`, hai ô EN | VI cạnh nhau. Thêm/xoá/sắp xếp phần tử mảng (dự án, job, stats...) áp cho **cả hai** ngôn ngữ. Mảng chữ (stack, tools, did...) nhập mỗi dòng một mục.
   - **Hồ sơ**: `profile` + nút upload CV (PDF lên bucket `portfolio/cv.pdf`, ô `cv` tự điền link có `?v=` để phá cache). File lên ngay; link mới có hiệu lực khi lưu.
   - **Cài đặt**: thứ tự/ẩn hiện section, màu theme (để trống = mặc định), SEO.
3. **Lưu & xuất bản**: kiểm tra → ghi cả 4 dòng → xoá cache. Lượt truy cập kế tiếp thấy nội dung mới. Bị chặn nếu:
   - `profile.site` không phải URL hợp lệ;
   - dự án thiếu `url`, hoặc trùng `url` với dự án khác;
   - `url` của cùng một dự án khác nhau giữa EN và VI;
   - `about.stats[].value` không phải số;
   - màu theme không khớp `^[#\w\s().,/%-]+$`;
   - mảng object (dự án, job...) có số phần tử khác nhau giữa EN và VI.
4. **Khôi phục mặc định**: đặt tab đang mở về giá trị trong `lib/content.ts`. Chỉ đổi form, phải bấm Lưu mới ghi.
5. Rời trang khi còn thay đổi chưa lưu → trình duyệt hỏi lại. Phiên hết hạn → về form đăng nhập, đăng nhập lại vẫn giữ thay đổi.

Không cần deploy khi: sửa chữ, thêm/xoá dự án, đổi thứ tự/ẩn section, đổi màu, SEO, profile.
**Cần** sửa code + deploy khi: thêm trường mới, thêm section mới, đổi phong cảnh, logo, font.

---

## 6. Link chia sẻ theo scene

`/?s=<scene>` tạo link có ảnh preview riêng. Các scene: `about`, `principles`, `stack`, `work`, `work-2`, `work-3`, …, `experience`, `education`, `contact`.

- `work` = dự án thứ 1, `work-N` = dự án thứ N. Thêm dự án mới trong admin là có link ngay (trang render lần đầu khi có người mở rồi cache).
- Xoá dự án thì link cũ của nó trả về trang chủ thường.
- Đổi thứ tự dự án = đổi luôn dự án mà các link `work-N` cũ trỏ tới.

---

## 7. File liên quan

| File                              | Vai trò                                                      |
| --------------------------------- | ------------------------------------------------------------ |
| `lib/content.ts`                  | Giá trị mặc định + kiểu (`Content`, `Profile`, `Settings`)   |
| `lib/merge.ts`                    | `merge()`, `blank()`, `fromRows()`: phủ dữ liệu Supabase lên mặc định |
| `lib/site.ts`                     | `getSite()` đọc Supabase (cache tag `content`), `themeCss()` |
| `lib/admin.ts`                    | Sửa theo đường dẫn, thao tác mảng EN/VI, `clean()`, `validate()` |
| `app/(admin)/admin/*`             | Trang admin: `Admin.tsx`, `Field.tsx` (form tự sinh), `Extras.tsx`, `actions.ts` (publish) |
| `scripts/admin.test.ts`           | `npm test`                                                   |
| `lib/share.ts`                    | Dữ liệu ảnh preview cho từng scene                           |
| `supabase/schema.sql`             | Bảng, RLS, bucket                                            |
| `supabase/seed.sql`, `scripts/seed.ts` | Dữ liệu ban đầu (`npm run seed` để sinh lại)            |
| `.env.example`                    | Biến môi trường cần có                                       |
