// Same in every language. Leave a field empty ("") and the page hides it.
export const profile = {
  email: "quan54877@gmail.com",
  phone: "0364 537 696",
  phoneHref: "tel:0364537696",
  site: "https://hquanpham.id.vn",
  github: "https://github.com/PhamHongQuan",
  linkedin: "", // e.g. "https://www.linkedin.com/in/username"
  cv: "", // put the PDF in /public, then set "/cv.pdf"
};

const en = {
  name: "Phạm Hồng Quân",
  ui: {
    language: "Language",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
    menu: "Menu",
    close: "Close",
    nav: "Main",
    backToTop: "Back to top",
    copy: "Copy email",
    copied: "Copied",
  },
  weather: {
    fallbackCity: "Ho Chi Minh City",
    kinds: { clear: "Clear", cloudy: "Cloudy", fog: "Foggy", drizzle: "Drizzle", rain: "Rain", storm: "Thunderstorm", snow: "Snow" },
  },
  cv: {
    profile: "Profile",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    education: "Education",
  },
  nav: {
    about: "About",
    stack: "Stack",
    work: "Work",
    experience: "Experience",
    contact: "Contact",
  },
  hero: {
    status: "Open to new roles and projects",
    role: "Frontend developer",
    intro:
      "I build frontends at Foxscore. Before that I spent over a year as a fullstack developer at Rada360, writing both the Next.js UI and the Laravel API for an AI chatbot platform.",
    primary: "Get in touch",
    secondary: "Download CV",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "Figma", "AI coding agents", "REST APIs", "Laravel", "MySQL", "Docker", "Git"],
  },
  about: {
    title: "About",
    lead: "A year and a bit of fullstack, now focused on the frontend.",
    body: [
      "Since Feb 2026 I've been a frontend developer at Foxscore.",
      "At Rada360 I built an admin CMS with Laravel 12 and Next.js, then moved to AI360: a chatbot that answers customers on Zalo, Messenger and Telegram. I wired up each platform's API, put the webhooks on queues and built the admin panel in Filament.",
      "On the side I make small tools that run entirely in the browser (reordering and signing PDFs, converting images) and a template marketplace in Laravel and Next.js.",
    ],
    stats: [
      { value: 2, label: "Years building production web apps" },
      { value: 2, label: "Products shipped to real users" },
    ],
    principlesTitle: "How I work",
    principles: [
      {
        title: "Build every state",
        text: "A Figma file usually shows the happy path. I add loading, errors, empty lists and keyboard focus.",
      },
      {
        title: "Measure before fixing",
        text: "This portfolio used to stutter on old laptops. I measured each frame to find where the time went, then added a lighter mode that turns on when a machine can't keep up.",
      },
      {
        title: "Don't ship a broken file",
        text: "Folio and the PDF signer read back the file they export and compare it with the original. One page off and the download is blocked.",
      },
      {
        title: "AI agents, my own review",
        text: "I hand scaffolding and refactors to AI coding agents, then read every change myself before merging.",
      },
    ],
  },
  stack: {
    title: "Where I work in the stack",
    intro: "Frontend is the main job. I spent over a year on the backend, so I can still write the API when a feature needs it.",
    layers: [
      {
        name: "Interface",
        level: "Main focus",
        text: "Responsive, accessible pages built from Figma with React, Next.js and Tailwind CSS, with the animation and states that make them feel finished.",
        tools: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      },
      {
        name: "API",
        level: "Comfortable",
        text: "Integrating REST APIs on the client, and building them in Laravel when a feature needs it, with auth and Swagger docs.",
        tools: ["REST", "Laravel", "Swagger", "Postman"],
      },
      {
        name: "Async",
        level: "Familiar",
        text: "Webhooks from Zalo OA, Messenger and Telegram at AI360, processed on queues, so I know what the UI should show while the server is still busy.",
        tools: ["Webhooks", "Queues"],
      },
      {
        name: "Data",
        level: "Familiar",
        text: "MySQL schemas and queries, enough to read a slow endpoint and know whether the fix belongs in the query or the UI.",
        tools: ["MySQL", "Docker"],
      },
    ],
  },
  projects: {
    title: "Selected work",
    intro: "Production products I've built or contributed to.",
    visit: "Visit site",
    caseStudy: "Case study",
    back: "Back to work",
    prev: "Previous project",
    next: "Next project",
    labels: { role: "Role", year: "Year", context: "Context", did: "What I did", outcome: "Outcome", stack: "Stack" },
    items: [
      {
        name: "Rada360",
        kind: "Booking system",
        year: "2025",
        description: "Booking pages and an admin CMS: a Next.js, React and TypeScript frontend on a Laravel 12 API.",
        stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Laravel"],
        url: "https://rada360.com",
        study: {
          role: "Frontend and API developer",
          context: "A booking system: customers pick a service, choose a free time slot and book it.",
          did: [
            "Turned the Figma designs into responsive booking pages with Next.js, React, TypeScript and Tailwind CSS",
            "Wired the pages to the APIs for services, time slots and bookings with Axios",
            "Built the admin CMS in Laravel 12 with Controller – Service – Repository: CRUD, validation, search, filters, pagination",
            "Designed the MySQL tables and Eloquent relations; documented and tested the API with Swagger and Postman",
          ],
          outcome: "In production at rada360.com, used by real customers.",
        },
      },
      {
        name: "AI360",
        kind: "SaaS AI chatbot platform",
        year: "2025",
        description:
          "An AI chatbot that answers customers on Zalo, Messenger, Telegram and websites: REST API, Filament admin, webhooks on queues.",
        stack: ["Laravel", "Filament", "MySQL", "Queue", "Tailwind CSS"],
        url: "https://ai.rada360.com",
        study: {
          role: "Fullstack developer",
          context: "A SaaS platform for AI chatbots that answer customers on Facebook, Zalo, Telegram and websites.",
          did: [
            "Built a layered REST API with a service layer that keeps business logic out of controllers",
            "Integrated the AI Core API for chatbot training and conversation flows",
            "Connected Zalo Official Account, Facebook Messenger and the Telegram Bot API so the bot receives and answers messages",
            "Moved webhook handling and outgoing messages onto queues, cutting response times",
            "Admin panel in Filament; Google OAuth and reCAPTCHA; a referral program",
          ],
          outcome: "Live at ai.rada360.com.",
        },
      },
      {
        name: "Folio",
        kind: "PDF page organizer",
        year: "2026",
        description:
          "Reorder, rotate and delete PDF pages right in the browser, built for a supermarket cashier. Files never leave the device, pages are copied byte for byte and checked before download.",
        stack: ["React", "TypeScript", "pdf-lib", "pdf.js", "Tailwind CSS"],
        url: "https://hongquan-folio.vercel.app",
        study: {
          role: "Design and development",
          context: "A supermarket cashier needs to merge and reorder pages from several invoice PDFs without altering their content, and without uploading them to a server.",
          did: [
            "Open several PDFs, drag whole groups of pages to reorder, rotate, delete, undo and redo with shortcuts",
            "Copy pages intact with pdf-lib: content streams, fonts and images keep their bytes, nothing is re-rendered as images",
            "Verify every exported page against the original (content, text, size, rotation) and block the download on any difference",
            "Download files embedded in the PDF as-is, such as e-invoice XML",
            "Mobile layout with bottom sheets and back-button handling; two UI themes that switch without losing the open document",
          ],
          outcome: "In real use for sorting invoices; everything runs in the browser, with no server or database.",
        },
      },
      {
        name: "Pixform",
        kind: "Image converter",
        year: "2026",
        description:
          "Batch-convert images between PNG, JPEG, WebP, AVIF, GIF, BMP, ICO and TIFF in the browser, detecting each file's real format and downloading them as a ZIP.",
        stack: ["React", "TypeScript", "WebAssembly", "Vite"],
        url: "https://hongquan-pixform.vercel.app",
        study: {
          role: "Design and development",
          context: "Converting an image usually means uploading it to some unknown website. Pixform does it on the user's own device, iPhone HEIC photos included.",
          did: [
            "Detect the real format from magic bytes and flag files whose extension lies about their content",
            "Read PNG, JPEG, WebP, AVIF, GIF, BMP, ICO, TIFF, HEIC and SVG; write 8 formats with quality and background controls",
            "Use the browser's encoders and fall back to WebAssembly encoders where WebP or AVIF isn't supported",
            "Load heavy codecs (HEIC, AVIF, TIFF) only when needed; show size before and after, download one by one or as a ZIP",
          ],
          outcome: "Runs entirely in the browser; images are never uploaded.",
        },
      },
      {
        name: "Signature",
        kind: "PDF signing in the browser",
        year: "2026",
        description:
          "Draw a handwritten signature with a finger, mouse or pen and place it anywhere in a PDF. Original content stays byte for byte, and the file never leaves the device.",
        stack: ["React", "TypeScript", "pdf-lib", "pdf.js", "Vitest"],
        url: "https://hongquan-signature.vercel.app",
        study: {
          role: "Design and development",
          context: "Sign a PDF quickly on a phone or laptop without installing an app or uploading the document to a third-party service.",
          did: [
            "Draw a signature on screen and place the signature, the full name or both; drag to move, rotate and resize",
            "Match page frames and rotation between pdf.js (display) and pdf-lib (writing), ignoring stray taps and extra fingers",
            "Render Vietnamese names as images, since pdf-lib's standard fonts can't encode the diacritics",
            "Re-read the signed file and check page count, sizes, original content and signature count before allowing the download",
            "On phones, share the signed file straight through the system share sheet",
          ],
          outcome: "An image signature, not a certificate-based digital signature; geometry and signing are covered by Vitest tests.",
        },
      },
      {
        name: "Template Market",
        kind: "Template marketplace",
        year: "2026",
        description: "Publish, share and sell templates: a Laravel 12 API, a Next.js frontend, files stored on AWS S3.",
        stack: ["Next.js", "TypeScript", "TanStack Query", "Zustand", "Laravel", "MySQL", "AWS S3"],
        url: "https://github.com/PhamHongQuan/Template-Market",
        study: {
          role: "Fullstack, personal project",
          context: "A marketplace where people manage, share and buy templates, with a cart and orders.",
          did: [
            "Laravel 12 API with Controller – Service – Repository, MySQL with Eloquent relations",
            "Next.js, React and TypeScript frontend; Axios with TanStack Query for data, Zustand for state",
            "JWT auth; templates, categories, cart, orders and user profiles",
            "Thumbnail, preview and source uploads to AWS S3",
            "Docker for the dev environment, Swagger for API docs",
          ],
          outcome: "In progress. Source on GitHub.",
        },
      },
      {
        name: "This portfolio",
        kind: "Personal site",
        year: "2026",
        description: "Bilingual site with light and dark themes, scroll-driven animation and pointer-lit cards, built with Next.js and Tailwind CSS.",
        stack: ["Next.js", "TypeScript", "Tailwind CSS"],
        url: "https://hquanpham.id.vn",
        study: {
          role: "Design and development",
          context: "A personal site that plays like a short film instead of a page of sections, and still works as a fast, readable portfolio.",
          did: [
            "A scroll-driven film engine: one pinned screen, scenes in four parallax planes and a multiplane camera move between them",
            "Landscapes drawn from seeded SVG generators, rendered lazily in idle time",
            "Adaptive quality: weak devices or a measured low frame rate get a lighter version",
            "A sky that follows the visitor's clock and real local weather, with festivals through the year",
            "Bilingual content, light and dark themes, keyboard navigation, deep links and a print stylesheet that turns the page into a résumé",
          ],
          outcome: "Press ? anywhere on the page to see its live performance numbers.",
        },
      },
    ],
  },
  experience: {
    title: "Experience",
    intro: "Where I've worked and what I did there.",
    stackLabel: "Stack",
    jobs: [
      {
        period: "Feb 2026 – Present",
        role: "Frontend Developer",
        org: "Foxscore",
        meta: "Full-time, Ho Chi Minh City",
        points: [] as string[],
        stack: [] as string[],
      },
      {
        period: "Dec 2024 – Feb 2026",
        role: "Fullstack Developer",
        org: "Rada360 Technology JSC",
        meta: "Full-time, Ho Chi Minh City",
        points: [
          "Rada360: admin CMS in Laravel 12 with Controller – Service – Repository, and a Next.js, React and TypeScript UI with search, filters and pagination",
          "AI360: REST API for the chatbot platform, an admin panel in Filament, and an AI Core API integration for conversation flows",
          "Connected the chatbot to Zalo Official Account, Facebook Messenger and Telegram; webhooks and outgoing messages run on queues",
          "Google OAuth sign-in and reCAPTCHA against spam",
          "Worked with BA and QA from requirements through testing and release; documented APIs in Swagger, ran dev environments in Docker",
        ],
        stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Laravel", "MySQL", "Filament", "Docker"],
      },
    ],
    educationTitle: "Education",
    education: [
      {
        period: "Sep 2021 – May 2026",
        title: "Information Technology",
        org: "Nong Lam University, Ho Chi Minh City",
        note: "GPA 3.25 / 4. ReactJS, Java (Spring Boot), PHP (Laravel), database systems.",
      },
      {
        period: "Sep 2024",
        title: "TOEIC 590",
        org: "IIG Vietnam",
        note: "Comfortable reading English technical documentation.",
      },
    ],
  },
  contact: {
    title: "Have an interface that needs building?",
    lead: "Tell me about the role or the project. I usually reply within a day.",
    labels: { phone: "Phone", location: "Location" },
    location: "Ho Chi Minh City, Vietnam",
  },
  footer: {
    tagline: "Frontend developer in Ho Chi Minh City.",
    rights: "All rights reserved.",
  },
};

export type Content = typeof en;

const vi: Content = {
  name: "Phạm Hồng Quân",
  ui: {
    language: "Ngôn ngữ",
    toLight: "Chuyển sang giao diện sáng",
    toDark: "Chuyển sang giao diện tối",
    menu: "Menu",
    close: "Đóng",
    nav: "Điều hướng",
    backToTop: "Lên đầu trang",
    copy: "Sao chép email",
    copied: "Đã sao chép",
  },
  weather: {
    fallbackCity: "TP. Hồ Chí Minh",
    kinds: { clear: "Trời quang", cloudy: "Nhiều mây", fog: "Sương mù", drizzle: "Mưa phùn", rain: "Mưa", storm: "Giông", snow: "Tuyết" },
  },
  cv: {
    profile: "Giới thiệu",
    experience: "Kinh nghiệm",
    projects: "Dự án",
    skills: "Kỹ năng",
    education: "Học vấn",
  },
  nav: {
    about: "Giới thiệu",
    stack: "Thế mạnh",
    work: "Dự án",
    experience: "Kinh nghiệm",
    contact: "Liên hệ",
  },
  hero: {
    status: "Sẵn sàng cho vị trí và dự án mới",
    role: "Lập trình viên Frontend",
    intro:
      "Tôi làm frontend ở Foxscore. Trước đó tôi làm fullstack hơn một năm ở Rada360, viết cả giao diện Next.js lẫn API Laravel cho một nền tảng chatbot AI.",
    primary: "Liên hệ với tôi",
    secondary: "Tải CV",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "Figma", "AI coding agents", "REST APIs", "Laravel", "MySQL", "Docker", "Git"],
  },
  about: {
    title: "Giới thiệu",
    lead: "Hơn một năm làm fullstack, giờ tập trung vào frontend.",
    body: [
      "Từ 02/2026 tôi làm frontend ở Foxscore.",
      "Ở Rada360 tôi làm trang quản trị bằng Laravel 12 và Next.js, rồi chuyển sang AI360: chatbot trả lời khách trên Zalo, Messenger và Telegram. Tôi nối API của từng nền tảng, đưa webhook vào queue và làm trang quản trị bằng Filament.",
      "Ngoài giờ tôi làm mấy công cụ chạy hoàn toàn trên trình duyệt (sắp xếp và ký PDF, đổi định dạng ảnh) và một marketplace template bằng Laravel và Next.js.",
    ],
    stats: [
      { value: 2, label: "Năm xây dựng ứng dụng web production" },
      { value: 2, label: "Sản phẩm đến tay người dùng thật" },
    ],
    principlesTitle: "Cách tôi làm việc",
    principles: [
      {
        title: "Làm đủ các trạng thái",
        text: "Bản Figma thường chỉ vẽ lúc mọi thứ ổn. Tôi làm thêm loading, lỗi, danh sách rỗng và focus bàn phím.",
      },
      {
        title: "Đo rồi mới sửa",
        text: "Portfolio này từng giật trên máy yếu. Tôi đo từng frame để tìm chỗ tốn thời gian, rồi thêm một bản nhẹ tự bật khi máy không kéo nổi.",
      },
      {
        title: "Không để file sai lọt ra",
        text: "Folio và Ký PDF đọc lại file xuất ra và so với file gốc. Lệch một trang là chặn tải.",
      },
      {
        title: "Dùng AI agent, tự đọc diff",
        text: "Tôi giao cho AI coding agent phần dựng khung và refactor, rồi tự đọc từng thay đổi trước khi merge.",
      },
    ],
  },
  stack: {
    title: "Tôi mạnh ở tầng nào",
    intro: "Frontend là việc chính. Backend tôi đã làm hơn một năm, nên vẫn tự viết API được khi cần.",
    layers: [
      {
        name: "Giao diện",
        level: "Thế mạnh chính",
        text: "Trang responsive, dễ tiếp cận dựng từ Figma với React, Next.js và Tailwind CSS, cùng animation và các trạng thái khiến giao diện trông hoàn thiện.",
        tools: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      },
      {
        name: "API",
        level: "Thành thạo",
        text: "Tích hợp REST API phía client, và tự viết bằng Laravel khi tính năng cần, có xác thực và tài liệu Swagger.",
        tools: ["REST", "Laravel", "Swagger", "Postman"],
      },
      {
        name: "Bất đồng bộ",
        level: "Đã làm",
        text: "Webhook từ Zalo OA, Messenger và Telegram ở AI360, xử lý qua queue, nên tôi biết giao diện nên hiển thị gì khi server còn đang xử lý.",
        tools: ["Webhook", "Queue"],
      },
      {
        name: "Dữ liệu",
        level: "Đã làm",
        text: "Schema và truy vấn MySQL, đủ để đọc một endpoint chậm và biết nên sửa ở truy vấn hay ở giao diện.",
        tools: ["MySQL", "Docker"],
      },
    ],
  },
  projects: {
    title: "Dự án tiêu biểu",
    intro: "Những sản phẩm production tôi đã xây dựng hoặc tham gia.",
    visit: "Xem website",
    caseStudy: "Chi tiết dự án",
    back: "Quay lại dự án",
    prev: "Dự án trước",
    next: "Dự án tiếp theo",
    labels: { role: "Vai trò", year: "Năm", context: "Bối cảnh", did: "Tôi đã làm", outcome: "Kết quả", stack: "Công nghệ" },
    items: [
      {
        name: "Rada360",
        kind: "Hệ thống đặt lịch",
        year: "2025",
        description: "Trang đặt lịch và trang quản trị: giao diện Next.js, React, TypeScript, API và CMS bằng Laravel 12.",
        stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Laravel"],
        url: "https://rada360.com",
        study: {
          role: "Frontend và API",
          context: "Hệ thống đặt lịch: khách chọn dịch vụ, chọn khung giờ còn trống rồi đặt lịch.",
          did: [
            "Chuyển thiết kế Figma thành các trang đặt lịch responsive với Next.js, React, TypeScript và Tailwind CSS",
            "Kết nối các trang với API dịch vụ, khung giờ và đặt lịch qua Axios",
            "Làm trang quản trị bằng Laravel 12 theo Controller – Service – Repository: CRUD, validation, tìm kiếm, lọc, phân trang",
            "Thiết kế bảng MySQL và quan hệ bằng Eloquent; tài liệu và kiểm thử API bằng Swagger và Postman",
          ],
          outcome: "Đang chạy production tại rada360.com, có khách hàng thật sử dụng.",
        },
      },
      {
        name: "AI360",
        kind: "Nền tảng SaaS chatbot AI",
        year: "2025",
        description: "Chatbot AI trả lời khách trên Zalo, Messenger, Telegram và website: REST API, trang quản trị Filament, webhook qua queue.",
        stack: ["Laravel", "Filament", "MySQL", "Queue", "Tailwind CSS"],
        url: "https://ai.rada360.com",
        study: {
          role: "Fullstack",
          context: "Nền tảng SaaS chatbot AI trả lời khách hàng trên Facebook, Zalo, Telegram và website.",
          did: [
            "Xây dựng REST API theo kiến trúc nhiều tầng, service layer tách business logic khỏi controller",
            "Tích hợp AI Core API cho hệ thống training và luồng hội thoại của chatbot",
            "Nối Zalo Official Account, Facebook Messenger và Telegram Bot API để chatbot nhận và trả lời tin nhắn",
            "Đưa xử lý webhook và gửi tin nhắn sang queue, giảm thời gian phản hồi",
            "Trang quản trị bằng Filament; đăng nhập Google OAuth và reCAPTCHA; chương trình referral",
          ],
          outcome: "Đang chạy tại ai.rada360.com.",
        },
      },
      {
        name: "Folio",
        kind: "Công cụ sắp xếp trang PDF",
        year: "2026",
        description:
          "Sắp xếp, xoay, xoá trang PDF ngay trên trình duyệt cho thủ quỹ siêu thị. File không rời máy, trang được chép nguyên byte và tự kiểm tra trước khi cho tải.",
        stack: ["React", "TypeScript", "pdf-lib", "pdf.js", "Tailwind CSS"],
        url: "https://hongquan-folio.vercel.app",
        study: {
          role: "Thiết kế và phát triển",
          context: "Thủ quỹ siêu thị cần gộp và sắp xếp lại trang từ nhiều file PDF hoá đơn mà không được làm sai lệch nội dung, và không muốn tải file lên máy chủ.",
          did: [
            "Mở nhiều PDF, kéo thả cả nhóm trang để đổi thứ tự, xoay, xoá, hoàn tác/làm lại bằng phím tắt",
            "Chép trang nguyên vẹn bằng pdf-lib: content stream, font, ảnh giữ nguyên byte, không render lại thành ảnh",
            "Kiểm tra toàn vẹn từng trang của file xuất so với file gốc (nội dung, chữ, kích thước, góc xoay); sai lệch là chặn tải",
            "Tải nguyên bản file đính kèm trong PDF, ví dụ XML hoá đơn điện tử",
            "Giao diện mobile có bottom sheet, nút back đóng sheet; hai bộ giao diện chuyển qua lại không mất tài liệu",
          ],
          outcome: "Đang dùng thật cho việc sắp xếp hoá đơn; mọi xử lý chạy trên trình duyệt, không có máy chủ hay database.",
        },
      },
      {
        name: "Pixform",
        kind: "Công cụ chuyển định dạng ảnh",
        year: "2026",
        description:
          "Chuyển hàng loạt ảnh giữa PNG, JPG, WebP, AVIF, GIF, BMP, ICO, TIFF ngay trên trình duyệt, tự nhận định dạng thật của file và tải về dạng ZIP.",
        stack: ["React", "TypeScript", "WebAssembly", "Vite"],
        url: "https://hongquan-pixform.vercel.app",
        study: {
          role: "Thiết kế và phát triển",
          context: "Đổi định dạng ảnh thường phải tải ảnh lên một website lạ. Pixform làm việc đó ngay trên máy người dùng, kể cả ảnh HEIC từ iPhone.",
          did: [
            "Nhận diện định dạng thật bằng magic bytes, báo rõ khi đuôi file không khớp nội dung",
            "Đọc PNG, JPG, WebP, AVIF, GIF, BMP, ICO, TIFF, HEIC, SVG; ghi ra 8 định dạng, chỉnh chất lượng và màu nền",
            "Dùng encoder của trình duyệt, tự chuyển sang encoder WebAssembly khi trình duyệt không hỗ trợ WebP/AVIF",
            "Thư viện nặng (HEIC, AVIF, TIFF) chỉ tải khi cần; xem dung lượng trước/sau, tải từng file hoặc gộp ZIP",
          ],
          outcome: "Chạy hoàn toàn trên trình duyệt, ảnh không bị tải lên máy chủ.",
        },
      },
      {
        name: "Ký PDF",
        kind: "Ký PDF trên trình duyệt",
        year: "2026",
        description:
          "Vẽ chữ ký tay bằng ngón tay, chuột hoặc bút rồi đặt lên một hay nhiều chỗ trong PDF. Nội dung gốc giữ nguyên từng byte, file không rời máy.",
        stack: ["React", "TypeScript", "pdf-lib", "pdf.js", "Vitest"],
        url: "https://hongquan-signature.vercel.app",
        study: {
          role: "Thiết kế và phát triển",
          context: "Ký nhanh một file PDF trên điện thoại hay máy tính mà không cần cài app hay tải tài liệu lên dịch vụ bên ngoài.",
          did: [
            "Vẽ chữ ký trên màn hình, đặt chữ ký, họ tên hoặc cả hai lên trang; kéo để di chuyển, xoay, đổi cỡ",
            "Khớp khung trang và góc xoay giữa pdf.js (hiển thị) và pdf-lib (ghi), bỏ qua chạm nhầm và ngón tay thừa",
            "Vẽ họ tên tiếng Việt thành ảnh vì font chuẩn của pdf-lib không mã hoá được dấu",
            "Đọc lại file đã ký để kiểm tra số trang, kích thước, nội dung gốc và số chữ ký trước khi cho tải",
            "Trên điện thoại, chia sẻ file đã ký thẳng qua bảng chia sẻ của hệ điều hành",
          ],
          outcome: "Đây là chữ ký hình ảnh, không phải chữ ký số; phần hình học và ký có test bằng Vitest.",
        },
      },
      {
        name: "Template Market",
        kind: "Marketplace template",
        year: "2026",
        description: "Nơi đăng, chia sẻ và mua bán template: Laravel 12 làm API, Next.js làm giao diện, file lưu trên AWS S3.",
        stack: ["Next.js", "TypeScript", "TanStack Query", "Zustand", "Laravel", "MySQL", "AWS S3"],
        url: "https://github.com/PhamHongQuan/Template-Market",
        study: {
          role: "Fullstack, dự án cá nhân",
          context: "Một marketplace nơi người dùng quản lý, chia sẻ và mua bán template, có giỏ hàng và đơn hàng.",
          did: [
            "API bằng Laravel 12 theo Controller – Service – Repository, MySQL với quan hệ Eloquent",
            "Giao diện Next.js, React, TypeScript; gọi API bằng Axios và TanStack Query, state bằng Zustand",
            "Xác thực bằng JWT; quản lý template, danh mục, giỏ hàng, đơn hàng và hồ sơ người dùng",
            "Upload thumbnail, bản preview và source lên AWS S3",
            "Môi trường dev bằng Docker, tài liệu API bằng Swagger",
          ],
          outcome: "Đang phát triển. Mã nguồn trên GitHub.",
        },
      },
      {
        name: "Portfolio này",
        kind: "Website cá nhân",
        year: "2026",
        description: "Website song ngữ với giao diện sáng và tối, animation theo thao tác cuộn và card phát sáng theo con trỏ, xây dựng bằng Next.js và Tailwind CSS.",
        stack: ["Next.js", "TypeScript", "Tailwind CSS"],
        url: "https://hquanpham.id.vn",
        study: {
          role: "Thiết kế và phát triển",
          context: "Website cá nhân xem như một đoạn phim ngắn thay vì một trang chia mục, mà vẫn nhanh và dễ đọc như một portfolio.",
          did: [
            "Engine \"phim\" theo thao tác cuộn: một màn hình ghim, các cảnh gồm bốn lớp parallax và camera di chuyển xuyên qua giữa chúng",
            "Phong cảnh vẽ bằng SVG sinh theo seed, chỉ vẽ khi trình duyệt rảnh",
            "Tự điều chỉnh chất lượng: máy yếu hoặc FPS đo được thấp sẽ dùng bản nhẹ hơn",
            "Bầu trời theo giờ và thời tiết thật nơi người xem, có lễ hội theo mùa trong năm",
            "Song ngữ, giao diện sáng và tối, điều hướng bằng bàn phím, deep link và bản in biến trang thành CV",
          ],
          outcome: "Bấm ? ở bất kỳ đâu trên trang để xem số liệu hiệu năng trực tiếp.",
        },
      },
    ],
  },
  experience: {
    title: "Kinh nghiệm",
    intro: "Những nơi tôi đã làm việc và đã làm gì ở đó.",
    stackLabel: "Công nghệ",
    jobs: [
      {
        period: "02/2026 – Hiện tại",
        role: "Lập trình viên Frontend",
        org: "Foxscore",
        meta: "Toàn thời gian, TP. Hồ Chí Minh",
        points: [],
        stack: [],
      },
      {
        period: "12/2024 – 02/2026",
        role: "Lập trình viên Fullstack",
        org: "Công ty Công nghệ Rada360",
        meta: "Toàn thời gian, TP. Hồ Chí Minh",
        points: [
          "Rada360: trang quản trị bằng Laravel 12 theo Controller – Service – Repository, giao diện Next.js, React, TypeScript có tìm kiếm, lọc và phân trang",
          "AI360: REST API cho nền tảng chatbot, trang quản trị bằng Filament, tích hợp AI Core API cho luồng hội thoại",
          "Nối chatbot với Zalo Official Account, Facebook Messenger và Telegram; webhook và gửi tin chạy qua queue",
          "Đăng nhập bằng Google OAuth, chống spam bằng reCAPTCHA",
          "Làm cùng BA và QA từ phân tích yêu cầu đến kiểm thử và triển khai; tài liệu API bằng Swagger, môi trường dev bằng Docker",
        ],
        stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Laravel", "MySQL", "Filament", "Docker"],
      },
    ],
    educationTitle: "Học vấn",
    education: [
      {
        period: "09/2021 – 05/2026",
        title: "Công nghệ Thông tin",
        org: "Đại học Nông Lâm TP.HCM",
        note: "GPA 3.25 / 4. ReactJS, Java (Spring Boot), PHP (Laravel), hệ quản trị cơ sở dữ liệu.",
      },
      {
        period: "09/2024",
        title: "TOEIC 590",
        org: "IIG Việt Nam",
        note: "Đọc tốt tài liệu kỹ thuật tiếng Anh.",
      },
    ],
  },
  contact: {
    title: "Bạn cần dựng một giao diện?",
    lead: "Kể cho tôi về vị trí hoặc dự án. Tôi thường trả lời trong vòng một ngày.",
    labels: { phone: "Điện thoại", location: "Địa điểm" },
    location: "TP. Hồ Chí Minh, Việt Nam",
  },
  footer: {
    tagline: "Lập trình viên frontend ở TP. Hồ Chí Minh.",
    rights: "Bảo lưu mọi quyền.",
  },
};

export const content = { en, vi };
export type Language = keyof typeof content;

// Page-level settings the admin can change. Hero always opens the film, so it is not in `sections`.
export const sectionIds = ["about", "stack", "projects", "experience", "contact"] as const;
export type SectionId = (typeof sectionIds)[number];

// Colour tokens the admin may override per theme (see app/globals.css for the defaults).
export const themeTokens = ["bg", "surface", "ink", "muted", "line", "accent", "on-accent", "sun", "sun-ink", "glow"] as const;

// Background of each screen. `id` is the scene id, or `work:<project url>` for a project (so it
// follows the project when the list is reordered). The layer switches hide parts of the scenery.
export const sceneSets = ["panorama", "lake", "forest", "deep", "river", "meadow", "lone", "valleys", "sunrise"] as const;
export const sceneTimes = ["night", "late", "predawn", "dawn"] as const;
export const scenePalettes = ["green", "autumn", "sakura", "blue", "winter"] as const;
export const sceneWinds = ["calm", "breeze", "strong"] as const;
export const sceneLayers = ["trees", "grass", "drift", "mist", "flies", "moon", "stars", "aurora", "meteors"] as const;
export type Look = {
  id: string;
  set: (typeof sceneSets)[number];
  time: (typeof sceneTimes)[number];
  palette: (typeof scenePalettes)[number];
  wind: (typeof sceneWinds)[number];
  seed: number;
} & Record<(typeof sceneLayers)[number], boolean>;
const look = (id: string, set: Look["set"], time: Look["time"], seed: number, moon = false): Look => ({
  id, set, time, seed, palette: "green", wind: "breeze",
  trees: true, grass: true, drift: true, mist: true, flies: true, moon, stars: true, aurora: true, meteors: true,
});
// A project with no saved background yet: river, meadow, lone in turn.
export const projectLook = (url: string, i: number) => look(`work:${url}`, (["river", "meadow", "lone"] as const)[i % 3], "late", 5 + i);
export const fixedScenes = [
  look("top", "panorama", "night", 1, true),
  look("about", "lake", "night", 2, true),
  look("principles", "forest", "night", 3),
  look("stack", "deep", "night", 4),
  look("experience", "valleys", "predawn", 8),
  look("education", "lake", "predawn", 9),
  look("contact", "sunrise", "dawn", 10),
];
// The saved background for a screen, with anything missing or invalid taken from its default.
export function lookFor(list: Look[], key: string, fallback?: Look): Look {
  const d = fallback ?? fixedScenes.find((l) => l.id === key) ?? look(key, "meadow", "night", 1);
  const l = list.find((x) => x?.id === key);
  if (!l) return d;
  // Field by field: an entry saved before a field existed (or with a bad value) keeps the default.
  const ok = <K extends keyof Look>(k: K, valid: (v: Look[K]) => boolean) => (valid(l[k]) ? l[k] : d[k]);
  const out = {
    ...d,
    set: ok("set", (v) => sceneSets.includes(v)),
    time: ok("time", (v) => sceneTimes.includes(v)),
    palette: ok("palette", (v) => scenePalettes.includes(v)),
    wind: ok("wind", (v) => sceneWinds.includes(v)),
    seed: ok("seed", (v) => Number.isFinite(v)),
  };
  for (const k of sceneLayers) out[k] = ok(k, (v) => typeof v === "boolean");
  return out;
}

export const settings = {
  sections: sectionIds.map((id) => ({ id: id as SectionId, visible: true })),
  scenery: [...fixedScenes, ...en.projects.items.map((p, i) => projectLook(p.url, i))] as Look[],
  theme: { light: {} as Record<string, string>, dark: {} as Record<string, string> },
  seo: {
    title: "Phạm Hồng Quân, Frontend Developer",
    description:
      "Frontend developer at Foxscore in Ho Chi Minh City, working in React, Next.js and TypeScript. Previously fullstack at Rada360, building a Laravel API and Next.js UI for an AI chatbot platform.",
    keywords: ["Frontend Developer", "React", "Next.js", "TypeScript", "Tailwind CSS", "REST API", "Laravel"],
  },
};

export type Profile = typeof profile;
export type Settings = typeof settings;
export type Site = { content: typeof content; profile: Profile; settings: Settings };
