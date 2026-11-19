// Admin menu and Vietnamese labels. Keys are dotted paths without array indexes
// ("projects.items.study.did"). A field with no label falls back to its key, so new fields in
// lib/content.ts still show up. Pure: no runtime imports (scripts/admin.test.ts runs it in node).

export type SectionKind = "content" | "other" | "profile" | "order" | "scenery" | "theme" | "seo";
export type Section = { id: string; group: string; title: string; kind: SectionKind; paths?: string[] };

// Sidebar icons: SVG path data on a 24×24 stroke grid.
export const icons: Record<string, string> = {
  hero: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  about: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  principles: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  stack: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  projects: "M3 8h18v12H3zM8 8V5h8v3",
  experience: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  education: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5",
  contact: "M3 6h18v12H3zM3 6l9 7 9-7",
  profile: "M3 5h18v14H3zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 16a3 3 0 0 1 6 0M14 9h4M14 13h4",
  order: "M4 6h10M4 12h10M4 18h10M18 5v14M15 16l3 3 3-3",
  scenery: "M3 19l6-9 4 6 3-4 5 7zM16 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  theme: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
  seo: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
  ui: "M4 7V5h16v2M9 19h6M12 5v14",
  other: "M5 12h.01M12 12h.01M19 12h.01",
};

export const sections: Section[] = [
  { id: "hero", group: "Nội dung", title: "Hero", kind: "content", paths: ["name", "hero.status", "hero.role", "hero.intro", "hero.primary", "hero.secondary", "hero.stack"] },
  { id: "about", group: "Nội dung", title: "Giới thiệu", kind: "content", paths: ["about.title", "about.lead", "about.body", "about.stats"] },
  { id: "principles", group: "Nội dung", title: "Cách làm việc", kind: "content", paths: ["about.principlesTitle", "about.principles"] },
  { id: "stack", group: "Nội dung", title: "Kỹ năng", kind: "content", paths: ["stack.title", "stack.intro", "stack.layers"] },
  { id: "projects", group: "Nội dung", title: "Dự án", kind: "content", paths: ["projects.title", "projects.intro", "projects.items"] },
  { id: "experience", group: "Nội dung", title: "Kinh nghiệm", kind: "content", paths: ["experience.title", "experience.intro", "experience.jobs"] },
  { id: "education", group: "Nội dung", title: "Học vấn", kind: "content", paths: ["experience.educationTitle", "experience.education"] },
  { id: "contact", group: "Nội dung", title: "Liên hệ & chân trang", kind: "content", paths: ["contact", "footer"] },
  { id: "profile", group: "Trang", title: "Hồ sơ & CV", kind: "profile" },
  { id: "order", group: "Trang", title: "Sắp xếp mục", kind: "order" },
  { id: "scenery", group: "Trang", title: "Nền phong cảnh", kind: "scenery" },
  { id: "theme", group: "Trang", title: "Màu", kind: "theme" },
  { id: "seo", group: "Trang", title: "SEO", kind: "seo" },
  {
    id: "ui", group: "Nâng cao", title: "Chữ giao diện", kind: "content",
    paths: ["ui", "nav", "weather", "cv", "projects.visit", "projects.caseStudy", "projects.back", "projects.prev", "projects.next", "projects.labels", "experience.stackLabel"],
  },
  { id: "other", group: "Nâng cao", title: "Khác", kind: "other" },
];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

// Content fields no section claims (e.g. a field just added to lib/content.ts). Shown under "Khác".
export function leftovers(def: unknown): string[] {
  const used = sections.flatMap((s) => s.paths ?? []);
  const out: string[] = [];
  const walk = (v: unknown, p: string) => {
    if (used.some((u) => p === u || p.startsWith(`${u}.`))) return;
    if (isObj(v)) for (const [k, x] of Object.entries(v)) walk(x, p ? `${p}.${k}` : k);
    else out.push(p);
  };
  walk(def, "");
  return out;
}

export const labels: Record<string, string> = {
  name: "Tên hiển thị",
  "hero.status": "Dòng trạng thái",
  "hero.role": "Vai trò (Frontend developer)",
  "hero.intro": "Đoạn giới thiệu",
  "hero.primary": "Nút chính (Liên hệ)",
  "hero.secondary": "Nút phụ (Tải CV)",
  "hero.stack": "Dải công nghệ chạy ngang (4 cái đầu lên ảnh chia sẻ)",

  "about.title": "Tiêu đề mục",
  "about.lead": "Câu dẫn",
  "about.body": "Các đoạn văn",
  "about.stats": "Số liệu",
  "about.stats.value": "Con số",
  "about.stats.label": "Mô tả",
  "about.principlesTitle": "Tiêu đề mục",
  "about.principles": "Nguyên tắc (nên đủ 4)",
  "about.principles.title": "Tiêu đề",
  "about.principles.text": "Nội dung",

  "stack.title": "Tiêu đề mục",
  "stack.intro": "Mô tả",
  "stack.layers": "Các tầng (tầng đầu là thẻ lớn)",
  "stack.layers.name": "Tên tầng",
  "stack.layers.level": "Mức độ",
  "stack.layers.text": "Mô tả",
  "stack.layers.tools": "Công cụ",

  "projects.title": "Tiêu đề mục",
  "projects.intro": "Mô tả",
  "projects.items": "Danh sách dự án",
  "projects.items.name": "Tên dự án",
  "projects.items.kind": "Loại sản phẩm",
  "projects.items.year": "Năm",
  "projects.items.description": "Mô tả ngắn",
  "projects.items.stack": "Công nghệ",
  "projects.items.url": "Link (bắt buộc, không trùng, giống nhau ở EN và VI)",
  "projects.items.study": "Trang chi tiết",
  "projects.items.study.role": "Vai trò",
  "projects.items.study.context": "Bối cảnh",
  "projects.items.study.did": "Đã làm gì",
  "projects.items.study.outcome": "Kết quả",

  "experience.title": "Tiêu đề mục",
  "experience.intro": "Mô tả",
  "experience.jobs": "Danh sách công việc",
  "experience.jobs.period": "Thời gian",
  "experience.jobs.role": "Vị trí",
  "experience.jobs.org": "Công ty",
  "experience.jobs.meta": "Ghi chú (hình thức, địa điểm)",
  "experience.jobs.points": "Việc đã làm",
  "experience.jobs.stack": "Công nghệ",
  "experience.educationTitle": "Tiêu đề mục",
  "experience.education": "Danh sách học vấn",
  "experience.education.period": "Thời gian",
  "experience.education.title": "Ngành / bằng",
  "experience.education.org": "Trường",
  "experience.education.note": "Ghi chú",

  contact: "Liên hệ",
  "contact.title": "Tiêu đề mục",
  "contact.lead": "Câu dẫn",
  "contact.labels": "Nhãn",
  "contact.labels.phone": "Nhãn số điện thoại",
  "contact.labels.location": "Nhãn địa chỉ",
  "contact.location": "Địa chỉ",
  footer: "Chân trang",
  "footer.tagline": "Khẩu hiệu",
  "footer.rights": "Dòng bản quyền",

  ui: "Nút và trợ năng",
  "ui.language": "Chọn ngôn ngữ",
  "ui.toLight": "Chuyển sang nền sáng",
  "ui.toDark": "Chuyển sang nền tối",
  "ui.menu": "Mở menu",
  "ui.close": "Đóng",
  "ui.nav": "Tên vùng menu (trình đọc màn hình)",
  "ui.backToTop": "Lên đầu trang",
  "ui.copy": "Sao chép email",
  "ui.copied": "Đã sao chép",
  nav: "Menu",
  "nav.about": "Giới thiệu",
  "nav.stack": "Kỹ năng",
  "nav.work": "Dự án",
  "nav.experience": "Kinh nghiệm",
  "nav.contact": "Liên hệ",
  weather: "Thời tiết",
  "weather.fallbackCity": "Thành phố mặc định",
  "weather.kinds": "Tên kiểu thời tiết",
  "weather.kinds.clear": "Quang",
  "weather.kinds.cloudy": "Nhiều mây",
  "weather.kinds.fog": "Sương mù",
  "weather.kinds.drizzle": "Mưa phùn",
  "weather.kinds.rain": "Mưa",
  "weather.kinds.storm": "Dông",
  "weather.kinds.snow": "Tuyết",
  cv: "Tiêu đề bản in CV (Ctrl+P)",
  "cv.profile": "Hồ sơ",
  "cv.experience": "Kinh nghiệm",
  "cv.projects": "Dự án",
  "cv.skills": "Kỹ năng",
  "cv.education": "Học vấn",
  "projects.visit": "Nút xem website",
  "projects.caseStudy": "Nút chi tiết dự án",
  "projects.back": "Nút quay lại",
  "projects.prev": "Nút dự án trước",
  "projects.next": "Nút dự án sau",
  "projects.labels": "Nhãn trang chi tiết dự án",
  "projects.labels.role": "Vai trò",
  "projects.labels.year": "Năm",
  "projects.labels.context": "Bối cảnh",
  "projects.labels.did": "Đã làm gì",
  "projects.labels.outcome": "Kết quả",
  "projects.labels.stack": "Công nghệ",
  "experience.stackLabel": "Nhãn công nghệ ở kinh nghiệm",

  "profile.email": "Email",
  "profile.phone": "Số điện thoại (hiển thị)",
  "profile.phoneHref": "Link gọi (tel:…)",
  "profile.site": "Địa chỉ website (URL đầy đủ)",
  "profile.github": "GitHub (để trống = ẩn)",
  "profile.linkedin": "LinkedIn (để trống = ẩn)",
  "profile.cv": "Link CV (để trống = nút Tải CV đổi thành Dự án)",

  "seo.title": "Tiêu đề trang (tab trình duyệt, Google, mạng xã hội)",
  "seo.description": "Mô tả (Google, mạng xã hội)",
  "seo.keywords": "Từ khoá",
};

// Singular name for one item of an array of objects: "Xoá dự án #2".
export const itemNames: Record<string, string> = {
  "about.stats": "số liệu",
  "about.principles": "nguyên tắc",
  "stack.layers": "tầng",
  "projects.items": "dự án",
  "experience.jobs": "công việc",
  "experience.education": "học vấn",
};

export const sectionNames: Record<string, string> = {
  about: "Giới thiệu (kèm Cách làm việc)",
  stack: "Kỹ năng",
  projects: "Dự án",
  experience: "Kinh nghiệm (kèm Học vấn)",
  contact: "Liên hệ",
};

export const tokenNames: Record<string, string> = {
  bg: "Nền trang",
  surface: "Nền thẻ",
  ink: "Chữ chính",
  muted: "Chữ phụ",
  line: "Đường viền",
  accent: "Màu nhấn",
  "on-accent": "Chữ trên màu nhấn",
  sun: "Vàng điểm xuyết",
  "sun-ink": "Chữ vàng",
  glow: "Quầng sáng",
};

export const sceneNames: Record<string, string> = {
  top: "Mở đầu (Hero)",
  about: "Giới thiệu",
  principles: "Cách làm việc",
  stack: "Kỹ năng",
  experience: "Kinh nghiệm",
  education: "Học vấn",
  contact: "Liên hệ",
};

export const setNames: Record<string, string> = {
  panorama: "Toàn cảnh núi đồi",
  lake: "Hồ nước",
  forest: "Rừng thông",
  deep: "Rừng sâu, tia nắng",
  river: "Bờ sông",
  meadow: "Đồng cỏ, cây lớn",
  lone: "Vách đá, cây đơn",
  valleys: "Thung lũng sương",
  sunrise: "Đồi bình minh",
};

export const timeNames: Record<string, string> = { night: "Đêm", late: "Khuya", predawn: "Trước bình minh", dawn: "Bình minh" };

export const paletteNames: Record<string, string> = { green: "Xanh lá (mặc định)", autumn: "Mùa thu", sakura: "Anh đào", blue: "Sương lam", winter: "Mùa đông" };
export const windNames: Record<string, string> = { calm: "Lặng gió", breeze: "Gió nhẹ", strong: "Gió mạnh" };

// Layer switches, grouped as the admin shows them.
export const layerGroups = [
  ["Mặt đất", { trees: "Cây tiền cảnh", grass: "Cỏ", drift: "Lá bay", mist: "Sương", flies: "Đom đóm" }],
  ["Bầu trời", { moon: "Trăng", stars: "Sao", aurora: "Cực quang", meteors: "Sao băng" }],
] as const;
