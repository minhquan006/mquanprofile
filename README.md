# Profile / Bio Website

<p align="center">
  <a href="https://khoahihiprofile.web.app/"><strong>Website demo: khoahihiprofile.web.app</strong></a>
</p>

> Bản trong thư mục `github/` là source public mẫu. Các thông tin riêng như Firebase config, Discord ID, link mạng xã hội và ảnh cá nhân cần được thay bằng thông tin của bạn trước khi deploy.

Trang bio cá nhân tĩnh: avatar, mô tả, link mạng xã hội, trình phát nhạc có lời đồng bộ (karaoke), widget Discord hiển thị trạng thái thời gian thực, và bộ đếm **lượt thích / lượt xem** lưu trên Firebase.

Đây là **HTML/CSS/JS thuần** — không cần build, không cần `npm install`. Chỉ cần một static server là chạy. Firebase được nạp sẵn từ CDN của Google.

> **Thư mục này (chỗ chứa `index.html`) chính là gốc website.** Mọi đường dẫn trong tài liệu này tính từ đây.

---

## Mục lục

1. [Phải tự setup những gì? (đọc trước)](#1-phải-tự-setup-những-gì-đọc-trước)
2. [Chạy thử trên máy](#2-chạy-thử-trên-máy)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Setup Firebase (like/view)](#4-setup-firebase-likeview)
5. [Đổi tên, mô tả, ảnh, mạng xã hội](#5-đổi-tên-mô-tả-ảnh-mạng-xã-hội)
6. [Widget Discord](#6-widget-discord)
7. [Thêm/đổi nhạc và lyric](#7-thêmđổi-nhạc-và-lyric)
8. [Deploy lên mạng](#8-deploy-lên-mạng)
9. [Dành cho người không rành code: đưa prompt cho AI làm hộ](#9-dành-cho-người-không-rành-code-đưa-prompt-cho-ai-làm-hộ)
10. [Khắc phục sự cố](#10-khắc-phục-sự-cố)

---

## 1. Phải tự setup những gì? (đọc trước)

Sau khi tải source về, có **4 thứ bắt buộc/nên đổi** để trang thành của bạn:

| # | Việc cần làm | File / vị trí | Bắt buộc? |
|---|--------------|---------------|-----------|
| 1 | **Tạo Firebase riêng** và dán cấu hình | `src/firebase/firebase.js` | Bắt buộc nếu muốn like/view chạy |
| 2 | **Đổi tên, mô tả, ảnh, social link** | `index.html` | Bắt buộc |
| 3 | **Đổi Discord User ID** (widget presence) | `index.html` | Nếu dùng widget Discord |
| 4 | **Thay nhạc + lyric** của riêng bạn | `assets/audio/`, `assets/lyrics/`, `index.html` | Tùy chọn |

Nếu bạn **không rành code**, nhảy xuống [mục 9](#9-dành-cho-người-không-rành-code-đưa-prompt-cho-ai-làm-hộ) — ở đó có sẵn các prompt để copy đưa cho AI (ChatGPT, Claude, Cursor, Copilot...) làm hộ.

---

## 2. Chạy thử trên máy

Trang dùng ES modules + `fetch`, nên **không mở trực tiếp bằng `file://`** được (sẽ lỗi). Phải chạy qua một static server:

```bash
# Có Python:
python -m http.server 5500

# Hoặc có Node:
npx serve .
```

Rồi mở trình duyệt vào `http://localhost:5500/`.

---

## 3. Cấu trúc thư mục

```
(gốc website)
├─ index.html                 # Trang chính — chỉnh hầu hết nội dung ở đây
├─ assets/
│  ├─ audio/                  # File nhạc .mp3
│  ├─ lyrics/                 # File lời .lrc
│  └─ images/                 # Avatar, ảnh bìa bài hát, hiệu ứng
├─ src/
│  ├─ firebase/
│  │  ├─ firebase.js          # << DÁN CẤU HÌNH FIREBASE Ở ĐÂY
│  │  ├─ firestore.js         # Kết nối Firestore + document thống kê
│  │  └─ auth.js              # Đăng nhập ẩn danh (tùy chọn)
│  └─ features/
│     └─ profileCounters.js   # Logic đếm like/view
├─ styles/
│  └─ bio.css                 # CSS gốc (đã minify — hạn chế sửa)
└─ scripts/                   # Thư viện: jQuery, tilt, tippy, hiệu ứng...
```

> CSS tùy biến (màu, hiệu ứng riêng) nằm trong khối `<style>` ngay đầu `index.html`, không phải trong `bio.css`. Muốn đổi giao diện thì sửa ở đó.

---

## 4. Setup Firebase (like/view)

Bộ đếm **like** và **view** lưu trên Firestore. Không cấu hình thì trang vẫn chạy, nhưng số like/view không tăng và console báo lỗi đỏ.

### Bước 1 — Tạo project
[console.firebase.google.com](https://console.firebase.google.com) → **Add project** → đặt tên → tạo.

### Bước 2 — Bật Firestore
**Build → Firestore Database → Create database** → chọn vị trí → **Start in production mode**.

### Bước 3 — Tạo Web App, lấy config
Project Settings (⚙️) → mục **Your apps** → bấm icon `</>` → đặt tên → **Register app**. Firebase hiện ra object `firebaseConfig` — copy nó.

### Bước 4 — Dán config vào code
Mở `src/firebase/firebase.js`, thay nguyên object bằng của bạn:

```js
// src/firebase/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "...CỦA BẠN...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};

export const app = initializeApp(firebaseConfig);
```

> `apiKey`/`appId` của Firebase **không phải bí mật** — chúng luôn công khai trong web app. Bảo mật nằm ở Rules (Bước 5).

### Bước 5 — Cấu hình Security Rules
Trang dùng:
- `profile/stats` — document chứa `{ likes, views }`.
- `profileLikes/{clientId}` — mỗi khách 1 document (chống like trùng).

Vào **Firestore → Rules**, dán:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /profile/stats {
      allow read: if true;
      allow write: if true;
    }

    match /profileLikes/{clientId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Bấm **Publish**. (Đây là mức đủ dùng cho trang cá nhân. Muốn chống spam chặt hơn thì chuyển sang Cloud Functions.)

### Bước 6 — Kiểm tra
Mở trang qua localhost → F12 → Console. Không có lỗi đỏ Firebase và số view tăng sau reload là OK. Vào Firestore thấy document `profile/stats` xuất hiện là thành công.

> **Đổi version SDK:** Firebase nạp bản `12.15.0` từ CDN trong khối `<script type="importmap">` của `index.html`. Muốn đổi thì sửa số version ở cả 3 dòng URL.

---

## 5. Đổi tên, mô tả, ảnh, mạng xã hội

Mở `index.html`, dùng Ctrl+F tìm tới các chỗ sau:

**Tên hiển thị:**
```html
<p data-tippy-content="demo-tooltip" class="header" id="userName">Demo Profile</p>
```
Đổi `Demo Profile` → tên bạn. `data-tippy-content` là tooltip khi rê chuột.

**Mô tả ngắn:**
```html
<p id="bio_description" class="bio_description">Short bio example</p>
```

**Tiêu đề tab + thẻ chia sẻ (ở `<head>`):** đổi tất cả `Demo Profile` trong `<title>` và các thẻ `<meta ... content="Demo Profile">`, `og:image`/`twitter:image` đổi sang ảnh thumbnail của bạn.

**Avatar:** bỏ ảnh vào `assets/images/`, rồi sửa:
```html
<img src="./assets/images/avatar-example.jpg" alt="" class="img">
```

**Mạng xã hội:** mỗi link là một khối:
```html
<a href="https://www.facebook.com/..." target="_blank" rel="noopener noreferrer"
   class="svg_item singleColor" data-social-url="https://www.facebook.com/...">
    <i class="fa-brands fa-facebook-f"></i>
    <p class="svg_text" style="display: none">https://www.facebook.com/...</p>
</a>
```
- Sửa **cả** `href` lẫn `data-social-url`.
- Đổi icon: thay class `fa-brands fa-facebook-f` bằng icon khác từ [Font Awesome](https://fontawesome.com/icons) (vd `fa-instagram`, `fa-tiktok`, `fa-youtube`).
- Thêm/xóa: copy hoặc xóa nguyên khối `<a>`.

---

## 6. Widget Discord

Widget hiển thị trạng thái online + bài đang nghe, lấy qua dịch vụ miễn phí **[Lanyard](https://github.com/Phineas/lanyard)**.

1. **Join server Lanyard:** vào [discord.gg/lanyard](https://discord.gg/lanyard) (bắt buộc, để Lanyard đọc được presence của bạn).
2. **Đổi User ID** trong `index.html`, tìm:
   ```js
   const userId = '123456789012345678';
   ```
   Thay bằng Discord User ID của bạn (bật Developer Mode trong Discord → chuột phải avatar mình → *Copy User ID*).
3. (Tùy chọn) Vài link/tên Discord tĩnh trong HTML sẽ bị JS ghi đè khi Lanyard trả dữ liệu, nhưng nên sửa cho khớp lúc trang chưa load.

> Không dùng widget? Xóa khối `<div class="widget_container discord_presence_widget ...>` và script Lanyard liên quan.

---

## 7. Thêm/đổi nhạc và lyric

Mỗi bài cần **1 file `.mp3`** và (nếu muốn lời) **1 file `.lrc`**.

### Chuẩn bị file
- Nhạc `.mp3` → bỏ vào `assets/audio/`
- Ảnh bìa → `assets/images/`
- Lyric `.lrc` → `assets/lyrics/`

### Định dạng file .lrc
File text, mỗi dòng lời có timestamp `[phút:giây.centisecond]`:
```lrc
[ti:Tên bài]
[ar:Ca sĩ]
[00:12.50]Dòng lời đầu tiên
[00:15.20]Dòng lời thứ hai
[00:18.00]Dòng tiếp theo
```
- Chấp nhận `[mm:ss.xx]`, `[mm:ss]` hoặc `[mm:ss,xxx]`.
- **Lưu file ở encoding UTF-8** để tiếng Việt có dấu hiển thị đúng.
- Tạo nhanh bằng công cụ "lrc generator" online hoặc app như *Lyricify*.

### Khai báo bài vào playlist
Trong `index.html`, tìm `const playlist = [`:
```js
const playlist = [
    {
        src: "./assets/audio/ten-file.mp3",
        title: "ten bai hat",
        totalDuration: "3:55",      // "0:00" để tự lấy theo file
        audioImage: "./assets/images/anh-bia.jpg",
        hasLyrics: true,            // true nếu có .lrc
        lyrics: { source: "lrc", track: "assets/lyrics/ten-loi.lrc", synced: "" }
    },
    // thêm bài khác ở đây...
];
```
> Lưu ý: `lyrics.track` viết dạng `assets/lyrics/...` (**không** có `./` ở đầu).

### Đặt bài mặc định
Đầu file, sửa thẻ `<audio>`:
```html
<audio id="audio" preload="metadata" src="./assets/audio/bai-mac-dinh.mp3" ...></audio>
```
và khối cấu hình lyric:
```js
window.zyoAudioLyricsEnabled = true;     // bật lyric
window.zyoAudioLyricsRequired = true;    // chỉ phát bài CÓ lyric (xem lưu ý)
window.zyoAudioLyricsVisibleSlots = 3;   // số dòng lyric hiện cùng lúc
window.zyoInitialAudioLyrics = {"source":"lrc","track":"assets/lyrics/bai-mac-dinh.lrc","synced":""};
```

> **Quan trọng:** khi `zyoAudioLyricsRequired = true`, player **bỏ qua** mọi bài có `hasLyrics: false`. Nếu thêm bài chưa có lyric, đặt `window.zyoAudioLyricsRequired = false;` hoặc bổ sung file `.lrc`.

---

## 8. Deploy lên mạng

Trang tĩnh nên deploy rất dễ:

**GitHub Pages:** push thư mục này lên repo → Settings → Pages → chọn branch + thư mục root → xong, truy cập tại `https://<username>.github.io/<repo>/`.

**Netlify / Vercel / Cloudflare Pages:** kéo-thả thư mục vào dashboard (hoặc nối repo). Build command để trống, publish directory là thư mục chứa `index.html`.

> Nếu bật Firebase Auth, vào **Authentication → Settings → Authorized domains** thêm domain thật của bạn.

---

## 9. Dành cho người không rành code: đưa prompt cho AI làm hộ

Không biết code cũng được. Mở một AI coding (ChatGPT, Claude, Cursor, GitHub Copilot Chat, Gemini...), **mở thư mục source này trong đó** (hoặc dán file `index.html` vào), rồi copy từng prompt dưới đây, **điền thông tin của bạn vào chỗ `[...]`**, và gửi.

> Mẹo: nếu AI có thể đọc cả thư mục (Cursor, Claude Code, Copilot trong VS Code) thì tốt nhất. Nếu chỉ chat thuần (ChatGPT web), hãy dán nội dung file `index.html` vào trước rồi mới hỏi.

### Prompt A — Đổi toàn bộ thông tin cá nhân

```
Đây là source một trang bio tĩnh (HTML/CSS/JS thuần). Hãy giúp tôi đổi toàn bộ
thông tin cá nhân trong file index.html sang của tôi. Thông tin của tôi:

- Tên hiển thị: [TÊN CỦA BẠN]
- Mô tả ngắn / bio: [VÍ DỤ: 18 tuổi, thích nhạc lo-fi]
- Vị trí: [VÍ DỤ: Hà Nội, Việt Nam]
- Tiêu đề tab trình duyệt: [TÊN BẠN]
- Các mạng xã hội (đổi link + icon cho đúng):
    + Facebook: [LINK hoặc "bỏ"]
    + Instagram: [LINK hoặc "bỏ"]
    + TikTok: [LINK hoặc "bỏ"]
    + YouTube: [LINK hoặc "bỏ"]
    + GitHub: [LINK hoặc "bỏ"]
    + Spotify: [LINK hoặc "bỏ"]

Yêu cầu:
1. Sửa thẻ có id="userName" thành tên tôi.
2. Sửa thẻ có id="bio_description" thành mô tả của tôi.
3. Sửa <title> và tất cả thẻ <meta> (description, og:title, og:description,
   twitter:title, twitter:description) trong <head> thành tên tôi.
4. Với mỗi mạng xã hội: sửa CẢ href LẪN data-social-url, và đổi class icon
   Font Awesome cho đúng (vd fa-instagram, fa-tiktok). Mạng nào tôi ghi "bỏ"
   thì xóa nguyên khối <a> đó.
5. Chỉ sửa đúng những chỗ này, không đổi cấu trúc hay giao diện khác.
Sau khi sửa xong, liệt kê ngắn gọn những dòng bạn đã thay đổi.
```

### Prompt B — Setup Firebase (đếm like/view)

```
Trang bio này dùng Firebase Firestore để đếm like và view. Tôi đã tạo project
Firebase và có đoạn firebaseConfig sau:

[DÁN NGUYÊN ĐOẠN firebaseConfig FIREBASE ĐƯA CHO BẠN VÀO ĐÂY]

Hãy:
1. Thay object firebaseConfig trong file src/firebase/firebase.js bằng config trên.
2. Cho tôi nội dung Firestore Security Rules phù hợp để: ai cũng đọc/ghi được
   document profile/stats (likes, views), và mỗi khách tạo được 1 document trong
   collection profileLikes nhưng không sửa/xóa được. Giải thích tôi dán rules đó
   vào đâu trong Firebase Console.
3. Hướng dẫn tôi cách kiểm tra xem like/view đã chạy chưa.
```

### Prompt C — Đổi Discord widget

```
Trang này có widget hiển thị trạng thái Discord qua dịch vụ Lanyard.
Discord User ID của tôi là: [USER ID DISCORD CỦA BẠN]
Username Discord của tôi là: [USERNAME]

Hãy đổi biến `const userId` trong index.html thành ID của tôi, và sửa các link
discord.com/users/... cùng tên Discord tĩnh trong HTML cho khớp. Nhắc tôi nếu
cần làm thêm bước gì (vd phải join server Lanyard).
```

### Prompt D — Thêm bài hát + lyric

```
Tôi muốn thêm một bài hát vào trình phát nhạc của trang bio này. Tôi có:
- File nhạc tên: [TEN-FILE.mp3]  (tôi đã bỏ vào thư mục assets/audio/)
- Ảnh bìa tên: [TEN-ANH.jpg]     (tôi đã bỏ vào assets/images/)
- File lyric tên: [TEN-LOI.lrc]  (tôi đã bỏ vào assets/lyrics/) — nếu không có thì ghi "không có lyric"
- Tên bài hiển thị: [TÊN BÀI HÁT]

Hãy thêm bài này vào mảng `const playlist` trong index.html theo đúng định dạng
các object đã có sẵn. Nếu bài không có lyric, hãy nhắc tôi về biến
window.zyoAudioLyricsRequired (vì nó có thể khiến bài bị bỏ qua) và xử lý giúp.
```

### Prompt E — Đem deploy lên mạng

```
Đây là một trang web tĩnh (HTML/CSS/JS thuần, không cần build). Tôi muốn đưa nó
lên mạng MIỄN PHÍ để có link chia sẻ. Hãy hướng dẫn tôi từng bước chi tiết
(bấm vào đâu, làm gì) để deploy bằng [GitHub Pages / Netlify / Vercel — chọn 1],
dành cho người không rành kỹ thuật.
```

> Sau khi AI sửa xong, luôn **chạy thử lại trên máy** (mục 2) để chắc chắn mọi thứ hoạt động trước khi deploy.

---

## 10. Khắc phục sự cố

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| Trang trắng, console lỗi module/CORS | Mở bằng `file://` | Chạy qua http server (mục 2). |
| Like/View luôn = 0, lỗi Firebase đỏ | Config sai hoặc Rules chặn | Kiểm tra `firebase.js` và Rules (mục 4). |
| Bấm play nhưng không phát | Bài chưa có lyric mà `zyoAudioLyricsRequired = true` | Đặt `false` hoặc thêm `.lrc`. |
| Lyric không hiện / không chạy | Sai đường dẫn `lyrics.track` hoặc `.lrc` sai định dạng | Đường dẫn dạng `assets/lyrics/...` (không có `./`); kiểm tra timestamp. |
| Lyric tiếng Việt lỗi dấu | File `.lrc` không phải UTF-8 | Lưu lại ở UTF-8. |
| Widget Discord trống | Chưa join Lanyard hoặc sai `userId` | Join discord.gg/lanyard, kiểm tra `userId` (mục 6). |
| Ảnh không hiện | Sai đường dẫn hoặc file chưa nằm trong `assets/images/` | Kiểm tra lại `src`. |

---

Chúc bạn dựng được trang bio ưng ý. Trước khi chia sẻ link, nhớ kiểm tra đã đổi hết: Firebase config, Discord ID, tên/ảnh/social, và nhạc của riêng bạn.
