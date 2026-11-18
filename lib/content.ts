// Same in every language. Leave a field empty ("") and the page hides it.
export const profile = {
  email: "quan54877@gmail.com",
  phone: "0364 543 7696", // TODO: 11 digits, Vietnamese mobile numbers have 10. Check it.
  phoneHref: "tel:03645437696",
  site: "https://hquanpham.id.vn",
  github: "", // e.g. "https://github.com/username"
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
      "I turn designs into fast, responsive interfaces with React, Next.js and Tailwind CSS, and I know the backend well enough to wire them to real APIs.",
    primary: "Get in touch",
    secondary: "Download CV",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "Figma", "AI coding agents", "REST APIs", "Laravel", "MySQL", "Docker", "Git"],
  },
  about: {
    title: "About",
    lead: "I care about interfaces that feel fast and stay easy to change.",
    body: [
      "I work on the frontend at Foxscore, turning designs into responsive, production-ready interfaces and connecting them to the APIs behind them.",
      "Before that I spent a year as a fullstack developer at Rada360, building Laravel APIs for an AI chatbot platform and a booking system. That backend time is why my frontends talk to APIs cleanly.",
    ],
    stats: [
      { value: 2, label: "Years building production web apps" },
      { value: 2, label: "Products shipped to real users" },
    ],
    principlesTitle: "How I work",
    principles: [
      {
        title: "Match the design, then go further",
        text: "Spacing, type and states taken straight from Figma, plus the hover, focus, loading and empty states a mockup forgets.",
      },
      {
        title: "Measure, then optimize",
        text: "I check what the browser is actually doing before changing anything, so fixes land where the time goes.",
      },
      {
        title: "Readable first",
        text: "Small components, clear names, no clever tricks. Code gets read far more than it gets written.",
      },
      {
        title: "AI agents in the loop",
        text: "I work with AI coding agents for scaffolding, refactors and reviews, with clear instructions and a read of every line they change.",
      },
    ],
  },
  stack: {
    title: "Where I work in the stack",
    intro: "Frontend first, with enough backend to wire it up properly.",
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
        text: "Webhooks and queued jobs from my Rada360 work, so I know what the UI should do while the server is still busy.",
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
        description:
          "Turned Figma designs into responsive booking pages and wired them to the APIs for services, time slots and bookings.",
        stack: ["Tailwind CSS", "JavaScript", "REST API"],
        url: "https://rada360.com",
        study: {
          role: "Frontend and API developer",
          context: "A booking system: customers pick a service, choose a free time slot and book it.",
          did: [
            "Turned the Figma designs into responsive booking pages with Tailwind CSS and JavaScript",
            "Wired the pages to the APIs for services, time slots and bookings",
            "Designed and built the REST API behind the booking system in Laravel",
            "Documented and tested the API with Swagger and Postman",
          ],
          outcome: "In production at rada360.com, used by real customers.",
        },
      },
      {
        name: "AI360",
        kind: "SaaS AI chatbot platform",
        year: "2025",
        description:
          "Fullstack work on a chatbot platform for Facebook, Zalo, Telegram and websites: the training system, the REST API, webhook processing and a referral program.",
        stack: ["Laravel", "REST API", "MySQL", "JavaScript"],
        url: "https://ai.rada360.com",
        study: {
          role: "Fullstack developer",
          context: "A SaaS platform for AI chatbots that answer customers on Facebook, Zalo, Telegram and websites.",
          did: [
            "Built the chatbot training system and the REST API behind the platform",
            "Processed the incoming webhooks from each messaging platform",
            "Moved webhook handling and outgoing messages onto queues, cutting response times",
            "Introduced a service layer to keep business logic out of controllers, easier to maintain and test",
            "Built the referral program",
          ],
          outcome: "Live at ai.rada360.com.",
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
        period: "Dec 2024 – Jan 2026",
        role: "Fullstack PHP Developer",
        org: "Rada360 Technology JSC",
        meta: "Full-time, Ho Chi Minh City",
        points: [
          "Turned Figma designs into responsive pages with Tailwind CSS and JavaScript, connected to the APIs behind them",
          "Designed and built the REST API for the booking system and AI chatbot",
          "Introduced a service layer to keep business logic out of controllers, making code easier to maintain and test",
          "Moved webhook handling and outgoing messages onto queues, cutting response times",
          "Documented and tested APIs with Swagger and Postman; set up Docker for local and dev environments",
        ],
        stack: ["Tailwind CSS", "JavaScript", "Laravel", "MySQL", "Docker", "Swagger"],
      },
    ],
    educationTitle: "Education",
    education: [
      {
        period: "Sep 2021 – Dec 2025",
        title: "Information Technology",
        org: "Nong Lam University, Ho Chi Minh City",
        note: "GPA 3.25 / 4. ReactJS, Java (Spring Boot), PHP (Laravel), database systems.",
      },
      {
        period: "Dec 2024",
        title: "TOEIC 590",
        org: "ETS",
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
    tagline: "Frontend developer building fast, responsive interfaces.",
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
      "Tôi biến thiết kế thành giao diện nhanh, responsive với React, Next.js và Tailwind CSS, và hiểu backend đủ để kết nối chúng với API thật.",
    primary: "Liên hệ với tôi",
    secondary: "Tải CV",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "Figma", "AI coding agents", "REST APIs", "Laravel", "MySQL", "Docker", "Git"],
  },
  about: {
    title: "Giới thiệu",
    lead: "Tôi quan tâm đến những giao diện chạy nhanh và dễ thay đổi.",
    body: [
      "Hiện tôi làm frontend tại Foxscore, chuyển thiết kế thành giao diện responsive sẵn sàng cho production và kết nối với API phía sau.",
      "Trước đó tôi làm fullstack một năm tại Rada360, xây dựng API Laravel cho nền tảng chatbot AI và hệ thống đặt lịch. Nhờ khoảng thời gian làm backend đó, frontend của tôi làm việc với API gọn gàng hơn.",
    ],
    stats: [
      { value: 2, label: "Năm xây dựng ứng dụng web production" },
      { value: 2, label: "Sản phẩm đến tay người dùng thật" },
    ],
    principlesTitle: "Cách tôi làm việc",
    principles: [
      {
        title: "Đúng thiết kế, rồi làm tốt hơn",
        text: "Khoảng cách, chữ và trạng thái lấy đúng từ Figma, cộng thêm hover, focus, loading và trạng thái rỗng mà bản mockup hay bỏ quên.",
      },
      {
        title: "Đo trước, tối ưu sau",
        text: "Tôi xem trình duyệt thực sự đang làm gì trước khi sửa, để công sức đặt đúng chỗ tốn thời gian.",
      },
      {
        title: "Dễ đọc trước tiên",
        text: "Component nhỏ, tên rõ ràng, không mẹo vặt. Code được đọc nhiều hơn được viết.",
      },
      {
        title: "Làm việc cùng AI agent",
        text: "Tôi dùng AI coding agent để dựng khung, refactor và review, với chỉ dẫn rõ ràng và đọc lại từng dòng chúng thay đổi.",
      },
    ],
  },
  stack: {
    title: "Tôi mạnh ở tầng nào",
    intro: "Frontend là chính, cùng đủ backend để kết nối mọi thứ cho đúng.",
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
        text: "Webhook và queue từ thời làm ở Rada360, nên tôi biết giao diện nên hiển thị gì khi server còn đang xử lý.",
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
        description:
          "Chuyển thiết kế Figma thành các trang đặt lịch responsive và tích hợp API cho dịch vụ, khung giờ và đặt lịch.",
        stack: ["Tailwind CSS", "JavaScript", "REST API"],
        url: "https://rada360.com",
        study: {
          role: "Frontend và API",
          context: "Hệ thống đặt lịch: khách chọn dịch vụ, chọn khung giờ còn trống rồi đặt lịch.",
          did: [
            "Chuyển thiết kế Figma thành các trang đặt lịch responsive với Tailwind CSS và JavaScript",
            "Kết nối các trang với API dịch vụ, khung giờ và đặt lịch",
            "Thiết kế và xây dựng REST API cho hệ thống đặt lịch bằng Laravel",
            "Tài liệu hoá và kiểm thử API bằng Swagger và Postman",
          ],
          outcome: "Đang chạy production tại rada360.com, có khách hàng thật sử dụng.",
        },
      },
      {
        name: "AI360",
        kind: "Nền tảng SaaS chatbot AI",
        year: "2025",
        description:
          "Làm fullstack cho nền tảng chatbot trên Facebook, Zalo, Telegram và website: hệ thống training, RESTful API, xử lý webhook và chương trình referral.",
        stack: ["Laravel", "REST API", "MySQL", "JavaScript"],
        url: "https://ai.rada360.com",
        study: {
          role: "Fullstack",
          context: "Nền tảng SaaS chatbot AI trả lời khách hàng trên Facebook, Zalo, Telegram và website.",
          did: [
            "Xây dựng hệ thống training chatbot và REST API của nền tảng",
            "Xử lý webhook gửi đến từ từng nền tảng nhắn tin",
            "Đưa xử lý webhook và gửi tin nhắn sang queue, giảm thời gian phản hồi",
            "Xây dựng service layer tách business logic khỏi controller, dễ bảo trì và kiểm thử hơn",
            "Xây dựng chương trình referral",
          ],
          outcome: "Đang chạy tại ai.rada360.com.",
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
        period: "12/2024 – 01/2026",
        role: "Lập trình viên PHP Fullstack",
        org: "Công ty Công nghệ Rada360",
        meta: "Toàn thời gian, TP. Hồ Chí Minh",
        points: [
          "Chuyển thiết kế Figma thành giao diện responsive với Tailwind CSS và JavaScript, kết nối với API phía sau",
          "Thiết kế và phát triển RESTful API cho hệ thống đặt lịch và chatbot AI",
          "Xây dựng service layer tách business logic khỏi controller, dễ bảo trì và kiểm thử hơn",
          "Đưa xử lý webhook và gửi tin nhắn sang queue, giảm thời gian phản hồi",
          "Tài liệu hóa và kiểm thử API bằng Swagger và Postman; dựng Docker cho môi trường local và dev",
        ],
        stack: ["Tailwind CSS", "JavaScript", "Laravel", "MySQL", "Docker", "Swagger"],
      },
    ],
    educationTitle: "Học vấn",
    education: [
      {
        period: "09/2021 – 12/2025",
        title: "Công nghệ Thông tin",
        org: "Đại học Nông Lâm TP.HCM",
        note: "GPA 3.25 / 4. ReactJS, Java (Spring Boot), PHP (Laravel), hệ quản trị cơ sở dữ liệu.",
      },
      {
        period: "12/2024",
        title: "TOEIC 590",
        org: "ETS",
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
    tagline: "Lập trình viên frontend xây giao diện nhanh và responsive.",
    rights: "Bảo lưu mọi quyền.",
  },
};

export const content = { en, vi };
export type Language = keyof typeof content;
