# Admin trong Portfolio — thiết kế

Ngày: 2026-11-18. Thay cho kiến trúc "admin là app riêng" trong `ADMIN.md`.

## Mục tiêu

Một trang `/admin` ngay trong app Portfolio để chủ site (một người) sửa toàn bộ nội dung trong `site_content`
(`profile`, `settings`, `en`, `vi`), upload CV, rồi bấm một nút để trang công khai thấy nội dung mới.

**Xong khi:** đăng nhập → sửa → "Lưu & xuất bản" → reload `/` thấy thay đổi; admin không thể lưu dữ liệu khiến
`merge()` âm thầm rơi về mặc định (sai kiểu, lệch số phần tử EN/VI, URL dự án trùng/rỗng, màu sai định dạng).

**Ngoài phạm vi:** nhiều người dùng/phân quyền, lịch sử phiên bản, xem trước trước khi xuất bản, upload ảnh dự án
(chưa có chỗ hiển thị), sửa phong cảnh/logo/font.

## Kiến trúc

```
app/
├─ (site)/            ← mọi thứ hiện có dời vào đây (URL không đổi)
│   ├─ layout.tsx     root layout hiện tại (Header, Opening, getSite, theme)
│   ├─ page.tsx, s/[scene]/…, opengraph-image.tsx
├─ (admin)/admin/   ← route group để có root layout riêng, URL vẫn là /admin
│   ├─ layout.tsx     root layout riêng: <html>, globals.css, font, robots noindex. Không Header/Opening/getSite
│   ├─ page.tsx       server: đọc SUPABASE_URL/ANON_KEY, truyền xuống <Admin>
│   ├─ Admin.tsx      client: đăng nhập + tải + lưu + tab
│   ├─ Field.tsx      form tự sinh
│   ├─ Extras.tsx     Sections, Theme, CvUpload
│   └─ actions.ts     server action publish(accessToken)
├─ api/weather, robots.ts, sitemap.ts, icon.png …   giữ nguyên chỗ
```

- Hai root layout ⇒ chuyển giữa `/` và `/admin` là full reload. Chấp nhận được.
- Dependency mới duy nhất: `@supabase/supabase-js` (đăng nhập, giữ/refresh phiên, upsert, upload). Chỉ dùng ở client.
- Không thêm biến môi trường. Anon key vốn công khai; quyền ghi do RLS (email admin) quyết định.
- **Xoá** `app/api/revalidate/route.ts` và `REVALIDATE_SECRET`. Thay bằng server action `publish(token)`:
  `GET {SUPABASE_URL}/auth/v1/user` với token → 200 thì `revalidateTag("content", { expire: 0 })`, ngược lại lỗi.
  Đăng ký công khai đã tắt nên token hợp lệ = tài khoản admin; ghi dữ liệu vẫn do RLS chặn riêng.
- `merge()` và `blank()` tách từ `lib/site.ts` ra `lib/merge.ts` (thuần, không `react`/`process.env`) để client dùng lại.

## Luồng dữ liệu

1. **Đăng nhập:** form email/mật khẩu → `supabase.auth.signInWithPassword`. Có phiên sẵn thì vào thẳng. Có nút đăng xuất.
2. **Tải:** `select key,data from site_content` → mỗi key `merge(default, row)`. Kết quả = đúng cái portfolio sẽ hiển thị.
   Form state = `{ profile, settings, en, vi }`.
3. **Sửa:** toàn bộ trên state trong bộ nhớ; có cờ "chưa lưu" + `beforeunload` cảnh báo khi rời trang.
4. **Lưu & xuất bản:** validate → `upsert` 4 dòng trong một lệnh → `publish(access_token)` → báo thành công kèm thời gian.
   Lỗi ở bước nào thì báo đúng bước đó (dữ liệu đã lưu nhưng revalidate lỗi thì nói rõ, bấm lại được).
5. **Khôi phục mặc định:** mỗi tab có nút đặt state của tab đó về giá trị trong `lib/content.ts`. Chỉ đổi form, phải bấm Lưu mới ghi.

## Form tự sinh

Một component đệ quy `Field` đi theo **cấu trúc mặc định** (`def`) chứ không theo dữ liệu, nên trường lạ không bao giờ
hiện ra và trường mới trong `content.ts` tự có trong form.

| Kiểu trong `def`            | Render                                                                  |
| --------------------------- | ----------------------------------------------------------------------- |
| `string`                    | `<input>`; `<textarea>` nếu chuỗi mặc định > 80 ký tự                   |
| `number`                    | `<input type="number">`                                                 |
| `boolean`                   | checkbox                                                                |
| `string[]`                  | `<textarea>` một dòng một mục                                           |
| object                      | `<fieldset>` với `<legend>` = tên khoá                                  |
| mảng object                 | danh sách thẻ, mỗi thẻ có ↑ ↓ xoá; nút "Thêm" chèn `blank(def[0])`     |

**EN/VI cạnh nhau:** tab Nội dung đi cây `content.en` một lần; mỗi ô lá hiện hai input [EN | VI]. Thêm/xoá/sắp xếp
phần tử mảng tác động **đồng thời** lên cả `en` và `vi`, nên hai ngôn ngữ luôn cùng số phần tử.
Profile và settings dùng cùng `Field` với một giá trị.

**Ngoại lệ viết tay (3 chỗ):**
- `settings.sections`: chỉ ↑ ↓ và checkbox `visible`; `id` chỉ đọc; không thêm/xoá.
- `settings.theme`: mặc định là `{}` nên không suy ra được; render 10 `themeTokens` × light/dark, mỗi ô một text input
  (rỗng = dùng màu mặc định trong `globals.css`, không chép bảng màu sang TS) + ô xem màu khi có giá trị. Lưu chỉ các token có giá trị.
- `profile.cv`: ô text như thường + nút upload PDF → bucket `portfolio` tại `cv.pdf` (`upsert: true`) → ghi public URL
  kèm `?v=<thời điểm>` vào ô (phá cache CDN vì cùng đường dẫn). File lên ngay khi upload; URL mới có hiệu lực khi Lưu.

## 404

Bỏ `app/layout.tsx` gốc ⇒ URL không khớp route dùng trang 404 mặc định của Next (không có Header). Chấp nhận;
trả đúng status 404 là đủ. Không bật `experimental.globalNotFound`.

## Kiểm tra trước khi lưu (`lib/admin.ts → validate`)

Hàm thuần `validate(state): string[]` trả danh sách lỗi đọc được; có lỗi thì không lưu, hiện danh sách lên đầu trang.
- `projects.items[].url` (cả en và vi) không rỗng, không trùng; và url của dự án thứ i giống nhau ở en và vi.
- `profile.site` qua `URL.canParse`.
- Mỗi màu trong theme khớp `^[#\w\s().,/%-]+$`.
- `about.stats[].value` là số hữu hạn (input number có thể cho `NaN` khi để trống).

## Lỗi

- Supabase chưa cấu hình (thiếu env) → `/admin` hiện thông báo cần đặt `SUPABASE_URL`/`SUPABASE_ANON_KEY`.
- Đăng nhập sai → hiện thông báo của Supabase.
- Upsert bị RLS chặn (đăng nhập bằng email không phải admin) → hiện lỗi, không gọi publish.
- Phiên hết hạn giữa chừng → supabase-js tự refresh; refresh thất bại → quay về form đăng nhập, **state đang sửa giữ nguyên**.

## Kiểm thử

- `scripts/admin.test.ts` (`node:test`): `fromRows`, `validate`, `clean`, và kiểm tra cho thao tác mảng đôi EN/VI, chạy bằng `node --experimental-strip-types`
  (giống `npm run seed`), thêm script `npm test`. Không thêm framework test.
- Thủ công trên dev server: đăng nhập, sửa một chữ, thêm/xoá/đổi chỗ dự án, ẩn section, đổi màu, upload CV,
  Lưu & xuất bản → `/` hiện đúng; `npm run build` + `npm run lint` sạch.

## Tài liệu

- `ADMIN.md` viết lại: thiết lập Supabase, cách dùng `/admin`, các quy tắc dữ liệu vẫn còn đúng, bỏ phần app riêng/revalidate secret.
- `.env.example`: bỏ `REVALIDATE_SECRET`.
- Folder `demo/admin/` (trống, ngoài repo này) không dùng nữa.
