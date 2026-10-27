# Bàn giao custom 9Router → Duwn

> Tài liệu tổng hợp toàn bộ yêu cầu, quyết định kỹ thuật, thay đổi đã thực hiện và trạng thái được biết trong đoạn chat này. Mục tiêu là giúp tiếp tục cập nhật bản custom từ mã nguồn gốc mà không phải phân tích lại từ đầu.

## 0. Quy ước đây là tài liệu sống

File này là nguồn theo dõi chính cho mọi lần đồng bộ 9Router gốc vào bản Duwn. Không tạo một file bàn giao mới cho mỗi lần update; hãy cập nhật file này và giữ lại lịch sử các lần trước.

### Trạng thái tài liệu hiện tại

| Trường | Giá trị |
|---|---|
| Phiên bản tài liệu | 2.0 |
| Cập nhật gần nhất | 2026-10-16 |
| Upstream base đã hoàn thành gần nhất | `v0.5.104` / `87a74e1b` |
| Custom snapshot đã hoàn thành gần nhất | `origin/goc` / `04e2d807` |
| Đợt update upstream đang hoạt động | `UPD-007` — ĐANG KIỂM THỬ |
| Nơi ghi tiến độ | Mục 16 — Nhật ký update |

### Quy tắc bắt buộc khi có bản gốc mới

1. Trước khi sửa code, tạo một bản ghi mới ở Mục 16 và đặt trạng thái `ĐANG PHÂN TÍCH`.
2. Ghi rõ commit/tag upstream cũ, commit/tag upstream mới, custom commit hiện tại và tên branch làm việc.
3. Sau mỗi pha Database, Backend, Frontend, Branding, Docker và Test, cập nhật ngay trạng thái, file đã xử lý, conflict và quyết định vào bản ghi đó.
4. Không ghi “đã xong” nếu chưa có kết quả kiểm thử tương ứng.
5. Khi hoàn tất, đổi trạng thái thành `HOÀN THÀNH`, ghi commit custom mới, ngày hoàn tất và các vấn đề còn lại.
6. Cập nhật bảng “Trạng thái tài liệu hiện tại” ở trên để snapshot mới trở thành mốc cho lần update sau.
7. Không xóa nhật ký cũ. Mỗi đợt update phải được nối thêm để truy được lý do của mọi thay đổi.
8. Nên commit file này cùng commit code tương ứng hoặc ít nhất trong cùng pull request update, để tài liệu và source không lệch nhau.

Các trạng thái thống nhất dùng trong nhật ký:

```text
CHƯA BẮT ĐẦU → ĐANG PHÂN TÍCH → ĐANG MERGE → ĐANG SỬA CONFLICT
→ ĐANG KIỂM THỬ → CHỜ DUYỆT → HOÀN THÀNH

Ngoại lệ: BỊ CHẶN hoặc HỦY
```

## 1. Nguồn chuẩn của tài liệu

- Repository GitHub: `https://github.com/leduwn/9Router-Custom`
- Nhánh được dùng làm nguồn sự thật: `goc`
- Snapshot đã xác minh trực tiếp từ GitHub gần nhất ngày 2026-09-07: `f88330f843e4469093247a91a332a949287192ed`
- Điểm bắt đầu của bản custom: tag upstream `v0.5.45`, commit `6fcd2733`
- Upstream base hiện tại sau UPD-004: tag `v0.5.69`, commit `eb712ca8`.
- Phạm vi lịch sử từ `v0.5.45` đến `origin/goc`: 175 commit, 440 file, 28011 dòng thêm và 4514 dòng xóa.
- Trạng thái file trong các thư mục local không được dùng để kết luận nội dung tài liệu này. Mọi mô tả về mã nguồn bên dưới dựa trên object Git của `origin/goc`, không dựa trên working tree.

Lệnh dùng để kiểm tra lại đúng snapshot:

```bash
git fetch origin refs/heads/goc:refs/remotes/origin/goc --no-tags
git rev-parse origin/goc
git log --oneline v0.5.45..origin/goc
git diff --stat v0.5.45..origin/goc
```

## 2. Mục tiêu custom cố định

1. Tên sản phẩm hiển thị cho người dùng là **Duwn**.
2. Giữ cấu trúc và bố cục UI gốc của 9Router; chỉ custom nhận diện thương hiệu, logo và tone màu.
3. Toàn bộ màu thương hiệu dùng một màu xanh da trời duy nhất: `#2188FF`.
4. Không dùng cyan, gradient cyan, tím hoặc cam làm màu nhận diện phụ.
5. Vẫn giữ màu semantic khi cần: đỏ cho lỗi/hết hạn mức, vàng cho cảnh báo, xanh lá cho trạng thái thành công.
6. Docker phải build trực tiếp từ source của repository custom hiện tại; Dockerfile/Compose không clone hoặc tải lại repository gốc trong lúc build.
7. Giữ các tên kỹ thuật cần tương thích như package `9router-app`, service/container `9router`, prefix API key và thư mục dữ liệu `.9router`, trừ khi có một kế hoạch migration riêng.
8. Bổ sung quản lý API key gồm giới hạn token và danh sách model được phép sử dụng.

## 3. Lịch sử 5 commit custom trên nhánh `goc`

### 3.1. `caf4b9b8` — Branding và cấu hình Duwn

Commit: `feat: customize branding and config for 9Router-Custom`

Nội dung chính:

- Đổi tên hiển thị từ 9Router/9Router Proxy thành Duwn ở metadata, manifest, trang đăng nhập, sidebar, landing page và các khu vực nhận diện khác.
- Thêm component logo dùng chung `src/shared/components/BrandMark.js`.
- Thay favicon và icon PWA bằng biểu tượng chữ D.
- Đồng bộ màu thương hiệu về `#2188FF`.
- Loại cyan và các màu trang trí không thuộc nhận diện Duwn khỏi nút, link, CTA, card, sơ đồ và hiệu ứng nền.
- Giữ bố cục UI gần bản gốc, không thiết kế lại dashboard.
- Đổi package description thành `Duwn-branded 9Router web dashboard`.
- Đổi metadata ứng dụng thành Duwn và theme color thành `#2188ff`.
- Chuyển Docker Compose sang build source local.
- Chuyển luồng publish Docker sang GHCR của repository custom.

### 3.2. `b11d67ac` — Giới hạn token theo API key

Commit: `feat(auth): integrate api key token limits and fix tests`

Nội dung chính:

- Thêm `tokenLimit` và `usedTokens` vào bảng `apiKeys`.
- Thêm migration schema version 2.
- Thêm validation hạn mức token.
- Cộng token đã dùng từ dữ liệu usage thực tế.
- Chặn request khi API key đã đạt hạn mức.
- Thêm API create/update cho hạn mức.
- Thêm form, số liệu và progress bar ở trang Endpoint.
- Thêm unit test riêng cho Token Limit và cập nhật mock của các test liên quan.

### 3.3. `370112b5` — Giới hạn model theo API key

Commit: `feat(auth): add allowed models to api keys and update UI`

Nội dung chính:

- Thêm `allowedModels` vào bảng `apiKeys`.
- Thêm migration schema version 3.
- Cho phép nhập danh sách model cách nhau bằng dấu phẩy khi tạo/sửa API key.
- Chặn model không nằm trong danh sách với HTTP 403.
- Truyền model được yêu cầu vào lớp kiểm tra quyền ở các handler.
- Đổi modal chỉ sửa Token Limit thành modal sửa API key, gồm cả Token Limit và Allowed Models.
- Xóa `DonateModal` và các điểm hiển thị Donate khỏi Header/Sidebar trong snapshot cuối.

### 3.4. `79d704c9` — Sửa production build của nhánh `goc`

Commit: `fix: repair goc production build`

Commit trước đó đã làm lẫn/nhân đôi một khối lớn giữa `Header.js` và Gemini native route. Commit này:

- Khôi phục cấu trúc đầy đủ, hợp lệ của `src/shared/components/Header.js`.
- Xóa khối code bị lặp/sai vị trí khỏi `src/app/api/v1beta/models/[...path]/route.js`.
- Giữ kiểm tra API key theo model cho Gemini native TTS dưới dạng chuẩn hóa `gemini/<modelId>`.

Không được bỏ commit sửa build này khi cherry-pick hoặc tái áp dụng tính năng Allowed Models.

### 3.5. `522740d2` — Hạn mức token ngày/giờ theo giờ Việt Nam

Commit: `feat(auth): add Vietnam daily and hourly token limits`

Nội dung chính:

- Thêm hạn mức token theo ngày và theo giờ cho từng API key.
- Cho chọn giờ/phút reset hằng ngày và phút reset trong mỗi giờ theo `Asia/Ho_Chi_Minh` (UTC+7).
- Tính usage cửa sổ trực tiếp từ `usageHistory`, có index `(apiKey, timestamp)` để truy vấn quota.
- Thêm migration schema version 4, export/import và legacy JSON migration cho bốn field mới.
- Chặn request bằng HTTP 429 khi chạm hạn mức ngày hoặc giờ, kèm thời điểm reset tiếp theo.
- Cập nhật màn hình Endpoint để tạo/sửa cấu hình, xem usage, progress và mốc reset Việt Nam.

## 4. Branding và UI Duwn

### 4.1. Quy chuẩn màu

Màu chuẩn:

```text
Primary / Brand / CTA / Link / Logo: #2188FF
```

Quy tắc:

- Logo dùng màu đặc `#2188FF`, không gradient cyan.
- Nút primary, link, focus, active state và progress bình thường đều dùng primary.
- Có thể dùng cùng màu với opacity khác nhau như `bg-primary/10`, `border-primary/30`; đây vẫn là một màu thương hiệu.
- Không thay màu semantic đỏ/vàng/xanh lá bằng primary nếu màu đó đang truyền đạt lỗi, cảnh báo hoặc thành công.
- Không đổi màu logo chính thức của provider nếu đó là tài sản nhận diện của provider.

Các giá trị/cụm nên tìm để phát hiện cyan quay lại:

```bash
rg -n -i "cyan|#22d3ee|rgba\(34,\s*211,\s*238|#35adff|#64c5ff|#4cbaff|#8fd3ff|#1558c8|#1267e5|#67e8f9" src public
```

### 4.2. Logo dùng chung

File: `src/shared/components/BrandMark.js`

- Component nhận `size`: `sm`, `md`, `lg`, `xl`.
- Hình SVG chữ D được render bằng `currentColor`.
- Nền/viền/đổ bóng thực tế do class `.brand-mark` trong `src/app/globals.css` quản lý.
- Component được dùng ở các vị trí nhận diện thay vì lặp SVG riêng.

Các asset tĩnh:

- `public/favicon.svg`
- `public/icons/icon-192.svg`
- `public/icons/icon-512.svg`

### 4.3. Điểm hiển thị tên Duwn

- `src/shared/constants/config.js`: `APP_CONFIG.name = "Duwn"`.
- `src/app/layout.js`: title mặc định, title template và `applicationName` là Duwn.
- `src/app/manifest.js`: `name` và `short_name` là Duwn.
- `src/app/login/page.js`: nhận diện đăng nhập Duwn.
- `src/shared/components/Sidebar.js`: brand trên sidebar.
- `src/app/landing/page.js` và các component landing: nội dung trang chủ Duwn.
- `src/app/(dashboard)/dashboard/usage/components/ProviderTopology.js`: node trung tâm Duwn.
- `src/shared/components/Header.js`: các mô tả liên quan dùng tên Duwn.

### 4.4. Phạm vi UI đã chỉnh

- Không thay kiến trúc trang hoặc luồng điều hướng chính.
- Landing page được giản lược màu trang trí và đồng bộ CTA.
- Animated background, flow animation, cards, navigation, hero, how-it-works, get-started và footer dùng tone xanh da trời.
- Provider topology dùng node/beam/badge/pulse xanh Duwn.
- Avatar từng chọn cyan được chuyển sang blue.
- Thanh tiến trình Token Limit dùng primary khi bình thường và đỏ khi chạm/vượt hạn mức.

### 4.5. Tailwind source scan

Trong lần custom ở chat, import Tailwind trong `src/app/globals.css` đã được điều chỉnh thành:

```css
@import "tailwindcss" source(none);
@source "../";
```

Mục đích là giới hạn nguồn scan vào source ứng dụng và tránh scan nhầm phạm vi cha trên Windows.

## 5. Docker build độc lập repository gốc

### 5.1. Docker Compose

`docker-compose.yml` của nhánh `goc` dùng:

```yaml
services:
  9router:
    build:
      context: .
      dockerfile: Dockerfile
    image: 9router-custom:local
    pull_policy: build
```

Ý nghĩa:

- Image được build từ thư mục source hiện tại.
- Không pull image `decolua/9router:latest` để chạy thay cho mã custom.
- `pull_policy: build` buộc Compose ưu tiên build local.
- Dockerfile không có bước `git clone`, `git fetch` hoặc tải source upstream.

### 5.2. Image metadata

`Dockerfile` khai báo:

```dockerfile
LABEL org.opencontainers.image.title="Duwn"
LABEL org.opencontainers.image.description="Duwn-branded 9Router gateway"
LABEL org.opencontainers.image.source="https://github.com/leduwn/9Router-Custom"
```

### 5.3. Publish image

`.github/workflows/docker-publish.yml`:

- Chỉ publish `ghcr.io/leduwn/9router-custom`.
- Đã bỏ login và publish Docker Hub `decolua/9router`.
- Có tag semver và tag `latest`.
- Build multi-platform theo workflow hiện hữu.

### 5.4. Tài liệu Docker

`DOCKER.md` hướng người dùng clone repository custom và chạy:

```bash
docker compose up -d --build
```

Việc tài liệu hướng dẫn clone repository custom là bước lấy source của người dùng, không phải Docker build tự đi tìm repository gốc. Quy tắc bắt buộc là bên trong Dockerfile/Compose không lấy source upstream.

### 5.5. Tên kỹ thuật được giữ lại

Các tên dưới đây cố ý chưa đổi để tránh phá tương thích:

- service/container: `9router`
- package: `9router-app`
- data directory: `.9router`
- port mặc định: `20128`
- các định danh API/runtime nội bộ liên quan 9Router

Nếu muốn đổi các tên này về Duwn, cần làm một migration riêng cho volume, config, API key prefix, tài liệu và đường dẫn dữ liệu; không nên trộn vào lần cập nhật upstream thông thường.

## 6. Tính năng Token Limit

### 6.1. Database schema

Bảng `apiKeys` có:

```text
tokenLimit INTEGER NULL
usedTokens INTEGER NOT NULL DEFAULT 0
dailyTokenLimit INTEGER NULL
dailyResetTime TEXT NOT NULL DEFAULT '00:00'
hourlyTokenLimit INTEGER NULL
hourlyResetMinute INTEGER NOT NULL DEFAULT 0
```

Quy ước:

- `tokenLimit = NULL`: không giới hạn.
- `tokenLimit = 0`: khóa bị chặn ngay khi xác thực.
- `usedTokens`: tổng token prompt + completion đã ghi nhận cho khóa.
- `dailyTokenLimit`/`hourlyTokenLimit = NULL`: không áp dụng quota tương ứng.
- `dailyResetTime`: giờ/phút mở chu kỳ 24 giờ theo giờ Việt Nam.
- `hourlyResetMinute`: phút mở chu kỳ 60 phút trong mỗi giờ Việt Nam.

Schema được nâng lên version 2 trong commit Token Limit, version 3 bởi Allowed Models và version 4 bởi quota ngày/giờ.

Các migration 002 và 004 kiểm tra `PRAGMA table_info(apiKeys)` trước khi `ALTER TABLE`, nên có thể chạy an toàn khi cột đã tồn tại. Migration 004 cũng tạo index `idx_uh_api_key_ts` trên `usageHistory(apiKey, timestamp)`.

### 6.2. Validation

File: `src/lib/apiKeyLimits.js`

Hàm `parseTokenLimit(value)` xử lý:

- `undefined` → giữ nguyên `undefined`, phù hợp PATCH/PUT không cập nhật field.
- `null` hoặc chuỗi rỗng → `null`, nghĩa là unlimited.
- Chấp nhận số nguyên an toàn, lớn hơn hoặc bằng 0.
- Từ chối boolean, số âm, số thập phân, NaN và số vượt safe integer bằng `TypeError`.

File `src/lib/apiKeyTimeLimits.js` xác thực `dailyResetTime` theo `HH:mm`, `hourlyResetMinute` trong khoảng 0–59 và tính cửa sổ bằng UTC+7 cố định để không lệ thuộc timezone máy chủ.

### 6.3. Repository layer

File: `src/lib/db/repos/apiKeysRepo.js`

Các thay đổi chính:

- Row mapper trả đầy đủ hạn mức tổng/ngày/giờ, lịch reset, usage cửa sổ và `allowedModels`.
- `getApiKeyByKey(key)` trả metadata đầy đủ để auth kiểm tra.
- `createApiKey(...)` nhận hạn mức và khởi tạo `usedTokens = 0`.
- `updateApiKey(...)` lưu hạn mức nhưng không tự reset usage.
- `incrementUsedTokensWithAdapter(...)` và `incrementUsedTokens(...)` cộng dồn usage.
- Usage ngày/giờ được cộng từ các record `usageHistory` nằm trong cửa sổ hiện tại; không có counter ngày/giờ riêng.
- Export được nối qua `src/lib/db/index.js` và `src/lib/localDb.js`.
- Luồng export/import DB và migration dữ liệu cũ được cập nhật để giữ hai trường giới hạn/usage.

### 6.4. Cách cộng token

File: `src/lib/db/repos/usageRepo.js`

- Số token cộng vào key là `promptTokens + completionTokens`.
- Counter chỉ tăng sau khi một record `usageHistory` mới được insert thành công.
- Insert usage và increment API key chạy trong cùng transaction/adapter.
- Mỗi chat request tạo một `usageDedupeKey` riêng và truyền qua mọi đường streaming/non-streaming/SSE→JSON; chỉ các lần ghi có cùng khóa này mới được xem là trùng.
- Không suy luận trùng lặp từ timestamp/token vì nhiều request hợp lệ có thể hoàn tất trong cùng một mili-giây với cùng số token.
- Streaming, non-streaming và embeddings dùng luồng persistence usage tập trung hiện có.
- Request local/no-key hoặc không tìm thấy API key tương ứng không làm tăng counter.

### 6.5. Auth và chặn request

File trung tâm: `src/sse/services/auth.js`

Hàm `getApiKeyAccess(apiKey, requestedModel)` trả metadata quyền truy cập:

- Thiếu key, key sai hoặc inactive → HTTP 401.
- `tokenLimit != null && usedTokens >= tokenLimit` → HTTP 429, message `Token limit exceeded`.
- Chạm `dailyTokenLimit` hoặc `hourlyTokenLimit` → HTTP 429 với reason riêng và `resetAt`.
- Model không được phép → HTTP 403.
- Hợp lệ → trả `keyInfo` để handler tiếp tục.

Các handler đã chuyển sang dùng metadata access:

- chat
- embeddings
- fetch
- image generation
- search
- speech-to-text
- text-to-speech
- video generation
- Gemini native `/v1beta/models/...`

Việc kiểm tra diễn ra trước khi route sang provider nếu `requireApiKey` đang bật.

### 6.6. API quản lý key

- `POST /api/keys` nhận hạn mức tổng/ngày/giờ, lịch reset Việt Nam và tạo key với `usedTokens = 0`.
- `PUT /api/keys/[id]` cập nhật các field quota; input sai trả HTTP 400.
- Để bỏ giới hạn, frontend gửi `null` từ ô nhập trống.

### 6.7. Frontend

File: `src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.js`

- Modal Create/Edit Key có input hạn mức tổng, ngày, giờ và lịch reset Việt Nam.
- Ô trống nghĩa là Unlimited.
- Modal Edit API Key cho phép đổi hạn mức.
- Đổi hạn mức không reset `usedTokens`.
- Mỗi key hiển thị `used / limit` hoặc `used - Unlimited`.
- Progress width được chặn tối đa 100%.
- Khi `usedTokens >= tokenLimit`, progress chuyển đỏ và hiển thị `Limit reached`.
- Quota ngày/giờ hiển thị usage, progress và thời điểm reset tiếp theo theo `Asia/Ho_Chi_Minh`.
- Lỗi parse được hiển thị ngay trong form.

### 6.8. Hành vi cần hiểu đúng

- Hạn mức được kiểm tra trước request. Nếu key còn dưới hạn mức, một request lớn có thể làm tổng usage vượt hạn mức; request kế tiếp mới bị chặn.
- Hiện chưa có cơ chế reservation/ước lượng token trước request.
- Counter phụ thuộc vào usage mà provider hoặc translator trả về; request không có usage chính xác có thể không được cộng như mong đợi.
- Không reset usage khi tăng/giảm limit là chủ ý hiện tại.

## 7. Tính năng Allowed Models

### 7.1. Database

Bảng `apiKeys` có thêm:

```text
allowedModels TEXT NULL
```

Migration: `src/lib/db/migrations/003-add-api-key-allowed-models.js`, schema version 3.

- `NULL` hoặc chuỗi rỗng: cho phép tất cả model.
- Có giá trị: danh sách model phân tách bởi dấu phẩy.

### 7.2. API và data layer

- `createApiKey(name, machineId, tokenLimit, allowedModels)` lưu danh sách model.
- `updateApiKey` cập nhật `allowedModels` cùng các field khác.
- `POST /api/keys` và `PUT /api/keys/[id]` nhận `allowedModels`.
- Response tạo key trả `allowedModels`.

### 7.3. Enforcement

Trong `getApiKeyAccess(apiKey, requestedModel)`:

1. Tách chuỗi bằng dấu phẩy.
2. Trim khoảng trắng và loại phần tử rỗng.
3. So sánh exact match bằng `models.includes(requestedModel)`.
4. Không khớp → HTTP 403, reason `model_not_allowed`.

Lưu ý:

- So sánh hiện tại phân biệt hoa/thường.
- Không hỗ trợ wildcard.
- Không tự chuẩn hóa alias model.
- Với Gemini native TTS, model được kiểm tra ở dạng `gemini/<modelId>`.
- Admin phải nhập đúng chuỗi model mà handler nhận được, gồm cả provider prefix nếu route sử dụng prefix.

### 7.4. Frontend

- Create Key có input `Allowed Models (optional, comma-separated)`.
- Edit API Key có cùng input.
- Placeholder ví dụ: `gpt-4, claude-3-5-sonnet`.
- Để trống nghĩa là cho phép tất cả model.

### 7.5. Khoảng trống kiểm thử

Trong diff 4 commit của nhánh `goc` chưa thấy test riêng cho Allowed Models. Khi tiếp tục phát triển nên thêm ít nhất các trường hợp:

- blank/null cho phép tất cả;
- exact model được phép;
- model ngoài danh sách trả 403;
- model có provider prefix;
- Gemini native model;
- khoảng trắng và nhiều dấu phẩy;
- xác nhận cách xử lý chữ hoa/thường.

## 8. Danh sách đầy đủ 58 file khác bản gốc `v0.5.45`

### Build, Docker và tài liệu

- `.github/workflows/docker-publish.yml`
- `DOCKER.md`
- `Dockerfile`
- `docker-compose.yml`
- `package.json`
- `vitest.config.mjs` — thêm mới

### Asset thương hiệu

- `public/favicon.svg`
- `public/icons/icon-192.svg`
- `public/icons/icon-512.svg`

### App shell, branding và landing

- `src/app/globals.css`
- `src/app/layout.js`
- `src/app/login/page.js`
- `src/app/manifest.js`
- `src/app/landing/page.js`
- `src/app/landing/components/AnimatedBackground.js`
- `src/app/landing/components/Features.js`
- `src/app/landing/components/FlowAnimation.js`
- `src/app/landing/components/Footer.js`
- `src/app/landing/components/GetStarted.js`
- `src/app/landing/components/HeroSection.js`
- `src/app/landing/components/HowItWorks.js`
- `src/app/landing/components/Navigation.js`
- `src/shared/components/Avatar.js`
- `src/shared/components/BrandMark.js` — thêm mới
- `src/shared/components/DonateModal.js` — xóa trong snapshot cuối
- `src/shared/components/Header.js`
- `src/shared/components/Sidebar.js`
- `src/shared/constants/config.js`
- `src/app/(dashboard)/dashboard/cli-tools/components/AntigravityToolCard.js`
- `src/app/(dashboard)/dashboard/usage/components/ProviderTopology.js`

### API key UI và API routes

- `src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.js`
- `src/app/api/keys/route.js`
- `src/app/api/keys/[id]/route.js`
- `src/app/api/v1beta/models/[...path]/route.js`

### Database và validation

- `src/lib/apiKeyLimits.js` — thêm mới
- `src/lib/apiKeyTimeLimits.js` — thêm mới
- `src/lib/db/index.js`
- `src/lib/db/migrate.js`
- `src/lib/db/migrations/002-add-api-key-limits.js` — thêm mới
- `src/lib/db/migrations/003-add-api-key-allowed-models.js` — thêm mới
- `src/lib/db/migrations/004-add-api-key-time-limits.js` — thêm mới
- `src/lib/db/migrations/index.js`
- `src/lib/db/repos/apiKeysRepo.js`
- `src/lib/db/repos/usageRepo.js`
- `src/lib/db/schema.js`
- `src/lib/localDb.js`

### Auth và request handlers

- `src/sse/services/auth.js`
- `src/sse/handlers/chat.js`
- `src/sse/handlers/embeddings.js`
- `src/sse/handlers/fetch.js`
- `src/sse/handlers/imageGeneration.js`
- `src/sse/handlers/search.js`
- `src/sse/handlers/stt.js`
- `src/sse/handlers/tts.js`
- `src/sse/handlers/videoGeneration.js`

### Tests

- `tests/unit/api-key-token-limit.test.js` — thêm mới
- `tests/unit/embedding-usage-persistence.test.js`
- `tests/unit/fetch-success-clears-account.test.js`
- `tests/unit/gemini-native-endpoint.test.js`
- `tests/unit/xai-video-handler.test.js`

## 9. Kiểm thử đã thực hiện trong đoạn chat

Các kết quả dưới đây là kết quả tại thời điểm triển khai trong chat, không phải lời khẳng định rằng snapshot GitHub hiện tại vừa được chạy lại toàn bộ test.

### Đã thành công

- `npm install --no-package-lock` hoàn tất.
- Tailwind standalone/PostCSS compile thành công sau khi chỉnh source scan.
- Dev smoke cho `/login`, `/landing`, `/`, `/dashboard` và `/manifest.webmanifest` trả kết quả mong đợi.
- Favicon, manifest, tên Duwn và màu brand được kiểm tra trên dev server.
- ESLint cho nhóm file branding/landing và backend Token Limit đã qua.
- YAML parse cho Docker Compose và GitHub workflow đã qua.
- Kiểm tra cấu hình xác nhận Compose build source local và workflow chỉ publish GHCR custom.
- Tìm kiếm xác nhận không còn các mã cyan đã liệt kê trong `src` và `public` tại thời điểm đó.
- Token Limit target suite: 6 file, 37 test pass.
- API smoke Token Limit:
  - tạo limit 25 → HTTP 201, used 0;
  - list giữ limit 25;
  - update lên 40 thành công;
  - limit âm → HTTP 400.
- Auth smoke với limit 0 và `requireApiKey` bật → HTTP 429 trước khi gọi provider.
- `git diff --check` sạch tại các mốc kiểm tra.

### Chưa xác nhận hoàn toàn

- Docker CLI không có trong môi trường lúc triển khai, nên chưa chạy image build thực tế.
- Full Next production build trên Windows từng lỗi EPERM khi file tracer quét các junction được bảo vệ trong `C:\Users\duwn` như `Application Data` và BleachBit. Đây là lỗi môi trường/file tracer quan sát được, không phải lỗi compile UI được chứng minh.
- Full lint có một số lỗi React Hooks tồn tại sẵn ở các file upstream, gồm `AntigravityToolCard`, `EndpointPageClient`, `ProviderTopology`, `DonateModal` tại thời điểm kiểm tra.
- Allowed Models chưa có test chuyên biệt được nhìn thấy trên nhánh `goc`.
- Snapshot `origin/goc` mới nhất có commit sửa production build, nhưng tài liệu này không chạy lại full build/test của snapshot đó.

## 10. Quy trình cập nhật custom từ bản gốc

Mục tiêu của mỗi lần update là nhận toàn bộ bugfix, provider, routing, security, schema, API và UI logic mới từ 9Router gốc, đồng thời không làm mất các invariant của Duwn. “Giữ custom” không có nghĩa là giữ nguyên file cũ; phải đặt custom lên cấu trúc logic mới của upstream.

### 10.1. Chiến lược Git mặc định

Nhánh `goc` đã được publish nên chiến lược an toàn mặc định là:

1. Đồng bộ remote.
2. Tạo branch update từ `origin/goc`.
3. Merge commit/tag upstream mới vào branch update.
4. Resolve conflict theo từng subsystem.
5. Kiểm thử cả logic upstream lẫn custom.
6. Push branch update và merge qua review vào `goc`.

Cách này không rewrite lịch sử đã publish và giữ được quan hệ với upstream. Chỉ dùng rebase/cherry-pick để dựng lại custom trên base mới khi chủ repository chủ động chấp nhận đổi lịch sử.

Việc `git fetch upstream` chỉ thuộc quy trình bảo trì source. Dockerfile và Docker Compose vẫn tuyệt đối không được fetch/clone upstream khi build hoặc chạy container.

### 10.2. Bước 0 — Chuẩn bị và mở nhật ký

Trước khi đụng code:

- Xác nhận working tree đang sạch. Nếu có thay đổi riêng, commit chúng vào branch phù hợp trước; không trộn vào update upstream.
- Mở Mục 16, copy mẫu đợt update mới và điền các mốc đã biết.
- Đặt trạng thái tổng là `ĐANG PHÂN TÍCH`.
- Tạo một backup branch chỉ trỏ tới commit hiện tại; không sửa nội dung backup branch.

```bash
git status --short
git switch goc
git pull --ff-only origin goc
git branch backup/goc-before-<upstream-version> origin/goc
git switch -c update/upstream-<upstream-version>
```

Ghi ngay vào nhật ký:

- custom start commit;
- upstream base cũ;
- upstream target mới;
- tên backup branch;
- tên update branch;
- người thực hiện và ngày bắt đầu.

### 10.3. Bước 1 — Lấy và xác minh bản gốc mới

Kiểm tra remote trước:

```bash
git remote -v
git remote get-url origin
git remote get-url upstream
```

Nếu chưa có `upstream`, thêm đúng repository gốc một lần:

```bash
git remote add upstream https://github.com/decolua/9router.git
```

Sau đó fetch:

```bash
git fetch --prune origin
git fetch --prune upstream --tags
```

Không chọn target chỉ dựa vào tên “latest”. Phải ghi commit hash cụ thể:

```bash
git rev-parse origin/goc
git rev-parse upstream/master
git tag --list --sort=-version:refname
```

Nếu update theo release, target là commit của tag release. Nếu update theo `upstream/master`, ghi rõ rằng đây là snapshot chưa release.

### 10.4. Bước 2 — Phân tích logic upstream trước khi merge

Xác định hai mốc:

- `OLD_UPSTREAM`: base gốc mà bản custom hiện tại đang dựa trên.
- `NEW_UPSTREAM`: tag/commit gốc muốn cập nhật tới.

```bash
git log --oneline <OLD_UPSTREAM>..<NEW_UPSTREAM>
git diff --stat <OLD_UPSTREAM>..<NEW_UPSTREAM>
git diff --name-status <OLD_UPSTREAM>..<NEW_UPSTREAM>
git diff <OLD_UPSTREAM>..<NEW_UPSTREAM> -- src/lib src/sse src/app/api
```

Phải đọc thay đổi upstream theo nhóm, không chỉ xem danh sách conflict:

1. Database/migration và import/export dữ liệu.
2. Auth, API key, session và security.
3. Usage accounting, streaming và response translators.
4. Provider registry, model routing và credential fallback.
5. API routes, đặc biệt Gemini/OpenAI/Anthropic compatible endpoints.
6. Dashboard Endpoint và các component đã custom.
7. Next.js/build/runtime/Docker.
8. Test mới hoặc test upstream bị đổi.

Trong nhật ký, ghi các thay đổi upstream có ảnh hưởng trực tiếp đến custom. File upstream đổi nhưng không tác động custom vẫn có thể ghi ngắn gọn là “nhận nguyên trạng”.

### 10.5. Bước 3 — Merge upstream vào branch update

Khi đã xác định đúng target:

```bash
git merge --no-commit <NEW_UPSTREAM>
git diff --name-only --diff-filter=U
git status --short
```

Đổi trạng thái nhật ký sang `ĐANG MERGE` hoặc `ĐANG SỬA CONFLICT`.

Nguyên tắc resolve:

- File logic upstream thay đổi đáng kể: lấy kiến trúc/luồng mới của upstream làm nền, sau đó cài lại custom vào đúng điểm mở rộng mới.
- File chỉ khác branding: giữ logic upstream, chỉ tái áp dụng tên Duwn, logo và primary color.
- Không chọn toàn bộ “ours” cho một file backend quan trọng vì có thể làm mất bugfix upstream.
- Không chọn toàn bộ “theirs” cho file custom quan trọng vì có thể làm mất Token Limit, Allowed Models hoặc Docker custom.
- Sau mỗi file conflict, ghi lựa chọn và lý do vào nhật ký thay vì đợi đến cuối mới nhớ lại.

### 10.6. Ma trận xử lý theo subsystem

| Khu vực | Ưu tiên nhận từ upstream | Custom phải giữ/tái áp dụng | Kiểm tra tối thiểu |
|---|---|---|---|
| Schema/migrations | schema và cơ chế migrate mới | `tokenLimit`, `usedTokens`, `allowedModels` | hai đường nâng DB |
| API key repository | mapper/query/transaction mới | create/update/access/increment cho 3 field custom | CRUD và persistence |
| Usage | cách parse usage, dedupe, transaction mới | cộng prompt + completion đúng một lần | stream, non-stream, embedding |
| Auth | security/session/key validation mới | 429 Token Limit, 403 Allowed Models | chặn trước provider |
| Handlers | routing/model extraction/fallback mới | gọi access check với model chuẩn hóa | tất cả endpoint có key |
| Gemini native | protocol/fetch/stream fixes mới | key validation và `gemini/<modelId>` | TTS + generate/stream |
| Endpoint UI | cấu trúc/state/API mới | form limit/models, usage, progress | create/edit/reload |
| App shell | component và navigation mới | tên Duwn, BrandMark, bỏ Donate nếu vẫn là chủ ý | desktop/mobile |
| CSS/landing | layout/accessibility mới | `#2188FF`, không cyan branding | light/dark/responsive |
| Docker/build | runtime/standalone/dependency fixes mới | local source build, custom labels/GHCR | image build + boot |
| Tests | test và mock contract mới | test custom và regression | toàn bộ target suite |

### 10.7. Quy tắc đặc biệt cho database migration

Đây là khu vực rủi ro nhất vì upstream mới có thể đã dùng cùng version `2` hoặc `3`.

Không được chỉ sửa `SCHEMA_VERSION` cho hết conflict. Thực hiện theo thứ tự:

1. Liệt kê toàn bộ migration upstream mới và migration custom đã từng được phát hành.
2. Xác định version cao nhất ở target upstream.
3. Giữ migration đã chạy trên người dùng cũ ở trạng thái tương thích; không đổi ý nghĩa một version đã phát hành.
4. Nếu trùng số version, đưa thay đổi custom chưa có ở upstream sang version mới lớn hơn version cao nhất.
5. Migration custom phải tiếp tục idempotent bằng kiểm tra cột trước khi thêm.
6. Bảo đảm schema khai báo cuối cùng chứa cả field upstream và custom.
7. Kiểm tra import/export/backup/restore để không làm rơi field custom.

Bắt buộc thử hai đường nâng cấp bằng bản sao dữ liệu, không dùng DB production trực tiếp:

```text
Đường A: DB upstream cũ/chưa custom → bản custom mới
Đường B: DB Duwn hiện tại có token usage/model rules → bản custom mới
```

Tiêu chí thành công:

- ứng dụng boot được;
- dữ liệu key cũ còn nguyên;
- `usedTokens` không reset;
- `tokenLimit` và `allowedModels` không mất;
- migration chạy lại không báo duplicate column;
- backup trước migration vẫn hoạt động.

### 10.8. Quy tắc cập nhật logic backend

- Nếu upstream đổi chữ ký auth, không cố giữ nguyên `getApiKeyAccess` cũ; tích hợp ba kết quả custom vào API mới của upstream.
- Nếu upstream đổi nơi ghi usage, chuyển increment token tới điểm commit/deduplicate mới; không giữ hook cũ nếu nó làm cộng hai lần.
- Nếu upstream thêm endpoint tiêu thụ model/provider, endpoint đó phải được kiểm tra API key, Token Limit và Allowed Models khi `requireApiKey` bật.
- Nếu upstream đổi cách biểu diễn model, định nghĩa một canonical requested model nhất quán trước khi so `allowedModels`.
- Giữ thứ tự chặn rõ ràng: xác thực key → trạng thái active → Token Limit → Allowed Models → route provider.
- Lỗi custom phải giữ contract: 401 cho key không hợp lệ, 429 cho hết token, 403 cho model bị cấm.

### 10.9. Quy tắc cập nhật frontend và branding

Đối với component upstream thay đổi nhiều, quy trình là:

1. Giữ component mới của upstream.
2. Xác định API/state mới.
3. Tái thêm UI Token Limit và Allowed Models vào luồng mới.
4. Tái áp dụng BrandMark, tên Duwn và `#2188FF` sau cùng.
5. Không mang toàn bộ component cũ sang chỉ để giữ vài class màu.

Sau update phải kiểm tra:

- create/edit key có dữ liệu mới của upstream lẫn custom;
- reload trang không mất giá trị;
- progress không chia cho 0 sai;
- limit 0 hiển thị reached;
- mobile modal/sidebar không vỡ;
- light/dark mode không xuất hiện cyan branding;
- accessibility/focus state mới từ upstream không bị xóa.

### 10.10. Quy tắc cập nhật Docker/build

Nhận các thay đổi upstream cần thiết cho Next.js standalone, dependency, runtime, healthcheck, port hoặc asset copy. Sau đó bảo đảm:

- build context vẫn là source local `.`;
- Dockerfile không clone/fetch upstream;
- Compose không quay lại `decolua/9router:latest`;
- label image trỏ repository custom;
- CI chỉ publish GHCR custom;
- volume và `DATA_DIR` vẫn tương thích dữ liệu hiện có.

Phải test build trong Linux/Docker CI vì lỗi file tracer trên Windows không đủ để kết luận image production hỏng.

### 10.11. Bước 4 — Kiểm thử theo tầng

Không chờ đến cuối mới chạy tất cả. Chạy theo thứ tự:

1. Static checks: syntax, lint file đổi, `git diff --check`.
2. Migration tests và DB upgrade smoke.
3. Unit test auth/repository/usage.
4. Handler tests cho chat, embedding, media, Gemini native.
5. API smoke create/edit/list key.
6. UI smoke trang login, landing, endpoint, manifest và assets.
7. Production build.
8. Docker image build, container boot và persistence smoke.

Mỗi kết quả trong nhật ký phải có:

- lệnh hoặc test suite;
- trạng thái pass/fail;
- môi trường;
- lỗi còn lại và kết luận lỗi do upstream, custom hay môi trường.

Không dùng câu “test ổn” nếu không ghi test nào đã chạy.

### 10.12. Bước 5 — Hoàn tất merge và cập nhật tài liệu

Trước commit:

```bash
git diff --check
git status --short
git diff --cached --stat
```

Sau khi test đủ, hoàn tất merge commit, rồi cập nhật lại file này trong cùng branch:

1. Điền đầy đủ bản ghi Mục 16.
2. Đổi snapshot ở Mục 0 và Mục 15 sang base/custom commit mới.
3. Cập nhật danh sách file custom nếu file mới được thêm/xóa/đổi vị trí.
4. Cập nhật mô tả kiến trúc nếu upstream làm thay đổi cách Token Limit hoặc Allowed Models hoạt động.
5. Ghi test thực tế, known issues và việc hoãn sang lần sau.
6. Tăng phiên bản tài liệu, ví dụ `1.1` → `1.2`.

Sau review:

```bash
git push -u origin update/upstream-<upstream-version>
```

Merge branch update vào `goc` qua pull request hoặc review tương đương. Sau khi merge, ghi commit cuối của `goc` vào nhật ký và bảng trạng thái tài liệu.

### 10.13. Phương án cherry-pick/rebuild khi cần lịch sử sạch

Nếu chủ repository quyết định dựng lại custom trên base mới, tạo branch mới từ target upstream và áp dụng bốn lớp custom theo thứ tự:

```bash
git switch -c rebuild/goc-<upstream-version> <NEW_UPSTREAM>
git cherry-pick caf4b9b8
git cherry-pick b11d67ac
git cherry-pick 370112b5
git cherry-pick 79d704c9
```

Các hash trên chỉ đúng cho lớp custom ban đầu. Sau mỗi lần update, hãy dùng các commit custom mới được ghi trong Mục 16 thay vì giả định bốn hash cũ luôn cherry-pick được.

Không force-push `goc` chỉ vì rebuild đã pass. So sánh, review và xin quyết định rõ ràng trước khi thay lịch sử branch đã publish.

## 11. Checklist nghiệm thu sau mỗi lần nâng upstream

### Branding

- [ ] Tất cả vị trí nhận diện người dùng hiển thị Duwn.
- [ ] Logo chữ D hiển thị ở app, favicon và PWA icons.
- [ ] Primary chính xác `#2188FF` ở light/dark mode.
- [ ] Không còn cyan làm màu thương hiệu.
- [ ] UI gốc không bị thay bố cục ngoài phạm vi cần thiết.

### Docker

- [ ] `docker compose config` hợp lệ.
- [ ] Compose có `build.context: .` và không dùng image upstream để thay source custom.
- [ ] Dockerfile không clone/fetch upstream.
- [ ] Image local build được.
- [ ] CI chỉ publish `ghcr.io/leduwn/9router-custom`.
- [ ] Container khởi động và giữ dữ liệu qua volume `.9router`.

### Token Limit

- [ ] Migration từ DB cũ giữ dữ liệu.
- [ ] Key unlimited hoạt động.
- [ ] Limit 0 bị chặn 429.
- [ ] Used token tăng đúng prompt + completion.
- [ ] Usage duplicate không tăng hai lần.
- [ ] Đổi limit không reset used token.
- [ ] Daily quota reset đúng giờ/phút đã chọn theo UTC+7.
- [ ] Hourly quota reset đúng phút đã chọn trong mỗi giờ UTC+7.
- [ ] Usage cửa sổ chỉ tính record trong chu kỳ hiện tại và trả đúng `resetAt`.
- [ ] Progress UI và trạng thái đỏ đúng.
- [ ] Chat, embedding, media và Gemini native đều kiểm tra limit.

### Allowed Models

- [ ] Blank/null cho phép tất cả.
- [ ] Model hợp lệ đi qua.
- [ ] Model không hợp lệ trả 403 trước provider.
- [ ] Provider prefix được xử lý nhất quán.
- [ ] Gemini native kiểm tra `gemini/<modelId>`.
- [ ] UI create/edit lưu và đọc lại đúng danh sách.

### Chất lượng

- [ ] Unit tests mục tiêu pass.
- [ ] API smoke pass.
- [ ] `git diff --check` sạch.
- [ ] Không có duplicate import/function sau resolve conflict.
- [ ] Production build pass trong Linux/Docker CI, ngay cả khi Windows local gặp junction EPERM.

## 12. Các lệnh kiểm tra hồi quy hữu ích

```bash
# Kiểm tra màu cyan cũ
rg -n -i "cyan|#22d3ee|rgba\(34,\s*211,\s*238|#35adff|#64c5ff|#4cbaff|#8fd3ff|#1558c8|#1267e5|#67e8f9" src public

# Kiểm tra còn tham chiếu image/repository upstream trong cấu hình build
rg -n -i "decolua/9router|dockerhub_image|git clone|git fetch" Dockerfile docker-compose.yml .github DOCKER.md

# Kiểm tra các field API key tồn tại xuyên suốt
rg -n "tokenLimit|usedTokens|dailyTokenLimit|dailyResetTime|hourlyTokenLimit|hourlyResetMinute|allowedModels|getApiKeyAccess|incrementUsedTokens" src tests

# Kiểm tra tên brand còn sót ở vùng giao diện
rg -n '9Router Proxy|9Router - AI Infrastructure|short_name.*9Router' src public

# Kiểm tra diff
git diff --check
```

Không phải mọi kết quả chứa `9router` đều cần đổi. Các tên package, protocol, data directory, container/service và tài liệu kỹ thuật có thể được giữ vì tương thích. Chỉ đổi khi đó là nhận diện hiển thị hoặc tham chiếu build/publish không còn phù hợp.

## 13. Các quyết định nên giữ khi tiếp tục phát triển

- Ưu tiên thay đổi nhỏ, có thể truy nguyên trực tiếp về yêu cầu custom.
- Không refactor code upstream chỉ để “đẹp hơn” trong lúc rebase custom.
- Không thêm hệ thống theme phức tạp; một primary `#2188FF` là đủ.
- Không reset `usedTokens` ngầm khi sửa limit.
- Không đếm token ở nhiều lớp khác nhau; giữ một điểm persistence tập trung để tránh cộng hai lần.
- Không chỉ bảo vệ chat; mọi endpoint tiêu thụ provider phải dùng cùng auth access check.
- Không thay source custom bằng image upstream trong Docker Compose.
- Không đưa lại Donate UI trừ khi chủ dự án muốn khôi phục rõ ràng.
- Không bỏ commit sửa production build nếu tái dùng commit Allowed Models.

## 14. Trạng thái Git và phạm vi bàn giao

- Năm commit ở Mục 3 là các mốc custom ban đầu; các merge upstream và bản vá tiếp theo được ghi đầy đủ tại Mục 16.
- Snapshot nguồn sự thật hiện tại là `origin/goc` / `013dfd62`; working tree sạch tại thời điểm xác minh.
- Tài liệu không kết luận các thay đổi local ngoài lịch sử đã ghi là do custom Duwn.
- Không có API key, mật khẩu, token truy cập hoặc secret nào được ghi vào tài liệu.

## 15. Mốc tham chiếu nhanh

```text
Base upstream/tag:  39e36d3d  v0.5.86
Branding/Docker:    caf4b9b8
Token Limit:        b11d67ac
Allowed Models:     370112b5
Production fix:     79d704c9
Time limits:        522740d2
Upstream v0.5.50:   d4fa2d73
Upstream v0.5.55:   3ef1d44d
Upstream v0.5.69:   013dfd62
VPS safe update:    f88330f8
Upstream v0.5.75:   84a07999
Upstream v0.5.86:   be3c654f
Remote goc:         origin/goc @ be3c654f
Remote master:      origin/master @ 76d24f9c
Brand:              Duwn
Primary color:      #2188FF
Docker image local: 9router-custom:local
Published image:    ghcr.io/leduwn/9router-custom
Schema version:     4
```

## 16. Nhật ký update

Đây là phần phải được cập nhật trong lúc làm việc, không chỉ sau khi code xong. Bản ghi mới nhất đặt trên cùng. Khi một đợt hoàn thành, giữ nguyên bản ghi đó và tạo bản ghi mới phía trên cho lần tiếp theo.

### UPD-007 — Update lên upstream `v0.5.111`

| Trường | Giá trị |
|---|---|
| Trạng thái | `ĐANG KIỂM THỬ` |
| Ngày bắt đầu | 2026-10-27 |
| Upstream base cũ | `v0.5.104` / `87a74e1b` |
| Upstream target | `v0.5.111` / `3a978a631ad65529c06e48ce495092d5bba29f46` |
| Custom start | `04e2d8071c516b785ef1336dc0a9667c6b867b7c` |
| Branch làm việc | `update/upstream-v0.5.111` |
| Backup | `backup/goc-before-v0.5.111` |

Phạm vi upstream: 298 file, gồm provider web, định tuyến combo, audio và cập nhật database; cần bảo toàn branding, quota và Docker custom. 
| Pha | Trạng thái | Kết quả |
|---|---|---|
| Database | ĐANG KIỂM THỬ | Nhận database upstream; kiểm tra migration/quota đang chạy. |
| Backend | ĐANG KIỂM THỬ | Nhận handlers upstream; STT hợp nhất `getApiKeyAccess` và `clearAccountError`. |
| Frontend | ĐANG KIỂM THỬ | Merge tự động; giữ Endpoint custom. |
| Branding | ĐANG KIỂM THỬ | Giữ description Duwn; scan các khu vực nhận diện chính không thấy cyan. |
| Docker | ĐANG KIỂM THỬ | Giữ bind mount dữ liệu và build local; Headroom bind localhost theo upstream; không thêm volume không dùng. Docker CLI không có. |
| Test | ĐANG KIỂM THỬ | 76/76 test cốt lõi và 113/113 test upstream pass; hai suite STT pass 9/9 sau khi bổ sung ffmpeg tạm cho PATH. Docker CLI không có. Lần build đầu bị hủy vì dependency được cài đồng thời; build sạch thất bại do Node.js hết heap ~4 GB; production build chưa xác minh. |

Conflict: `docker-compose.yml` giữ dữ liệu `./data` hiện có; `package.json` nhận version 0.5.111, giữ description Duwn; `src/sse/handlers/stt.js` giữ quota và thêm `clearAccountError`.

### 16.1. UPD-006 — Update lên upstream `v0.5.104`

| Trường | Giá trị |
|---|---|
| Trạng thái | `HOÀN THÀNH` |
| Người thực hiện | Codex |
| Ngày bắt đầu | 2026-10-16 |
| Ngày hoàn thành | 2026-10-16 |
| Custom start commit | `origin/goc` / `be3c654f` |
| Upstream base cũ | `v0.5.86` / `39e36d3d` |
| Upstream target mới | `v0.5.104` / `87a74e1b` |
| Nguồn upstream | Thư mục local `D:\Projects\custom\9router` |
| Update branch | `update/upstream-v0.5.104` |
| Backup branch | `backup/goc-before-v0.5.104` / `be3c654f` |
| Custom result commit | `origin/goc` / `04e2d8071c516b785ef1336dc0a9667c6b867b7c` |

#### Mục tiêu đợt này

- [x] Nhận toàn bộ thay đổi upstream từ `v0.5.86` đến `v0.5.104`.
- [x] Giữ branding Duwn, primary `#2188FF` và Docker build từ source custom.
- [x] Giữ Token Limit tổng, quota ngày/giờ Việt Nam, Allowed Models và API key access hiện tại.
- [x] Giữ schema/migration custom, usage dedupe và an toàn dữ liệu hiện có.
- [x] Giữ bind mount `./data:/app/data` và quy trình `update.sh` an toàn cho VPS.
- [x] Chạy test trọng tâm, baseline, production build và standalone smoke.
- [x] Fast-forward `goc` và push lên `origin/goc` sau khi đạt kiểm tra.

#### Tiến độ theo pha

| Pha | Trạng thái | File/commit đã xử lý | Ghi chú |
|---|---|---|---|
| Chuẩn bị branch/backup | `HOÀN THÀNH` | `update/upstream-v0.5.104`, `backup/goc-before-v0.5.104` | Hai working tree sạch; fetch source local/tag `v0.5.104`; merge-base đúng `39e36d3d`. |
| Phân tích upstream | `HOÀN THÀNH` | `v0.5.86..v0.5.104` | 146 commit, 424 file, +29623/-1998; 28 file giao với custom đã rà. |
| Merge và conflict | `HOÀN THÀNH` | 10 file conflict | Hợp nhất quota custom với access control upstream; giữ Duwn. |
| Database/repository | `HOÀN THÀNH` | schema, apiKeysRepo, DB export/import | Schema backup version 5; giữ toàn bộ cột quota và thêm accessRestricted/accessAllow. Test nâng schema 4, sửa access/quota và backup restore đều pass. |
| Auth/handlers/usage | `HOÀN THÀNH` | auth, modality handlers, chatCore, usageRepo | Giữ quota UTC+7 và usage dedupe; nhận access gates upstream trước provider lookup. |
| API/frontend | `HOÀN THÀNH` | key route, Gemini native, EndpointPageClient | Giữ editor quota và thêm KeyAccessControls; native Gemini kiểm tra cả quota và access. |
| Branding/Docker/VPS script | `HOÀN THÀNH` | Header, Sidebar, package; Docker/Compose/update.sh | Duwn #2188FF giữ nguyên; không phục hồi Donate. Docker files không đổi, bind mount và backup-before-build giữ nguyên. Chưa triển khai VPS. |
| Tests/build/review | `HOÀN THÀNH` | test mục tiêu, baseline, production build, standalone HTTP | 125 test custom/access/migration/handlers pass sau sửa fixture upstream thiếu usageHistory; 256 test bổ sung pass. Provider/alias/OAuth baseline pass. Next 16.4.2 build 150/150 pages pass khi cô lập HOME/TEMP. HTTP health/login/manifest pass, Duwn #2188ff. Lint còn đúng 5 lỗi React sẵn có upstream (đã đối chiếu cùng file ở 87a74e1b); không phát sinh lỗi mới ở các file kiểm tra. Docker CLI không có trên local; chưa deploy VPS. Build có cảnh báo bỏ qua Tailscale Windows executable ngoài tracing root. |
| Release/push | `HOÀN THÀNH` | `04e2d807` | Fast-forward goc, push origin goc thành công; ls-remote xác nhận SHA trùng local; working tree sạch. Chưa cập nhật container trên VPS. |

#### Phân tích giao nhau ban đầu

- Custom hiện chạm 70 file so với `v0.5.86`; upstream mới chạm 424 file; có 28 file giao nhau.
- Nhóm rủi ro cao gồm `chatCore` và usage dedupe, auth/handlers cho mọi modality, schema/API key repo, endpoint quản lý key, Gemini native route, layout/header/sidebar branding.
- Upstream đã thêm API-key access control riêng cho combos/models; cần hợp nhất với Token Limit tổng, quota ngày/giờ UTC+7 và Allowed Models custom thay vì chọn một bên.
- Dockerfile/Compose/update script không nằm trong phần upstream thay đổi nhưng vẫn phải kiểm tra lại invariant local-source, bind mount và backup-before-recreate sau merge.

### 16.2. UPD-005 — Update lên upstream `v0.5.86`

| Trường | Giá trị |
|---|---|
| Trạng thái | `HOÀN THÀNH` |
| Người thực hiện | Antigravity |
| Ngày bắt đầu | 2026-09-24 |
| Ngày hoàn thành | 2026-09-24 |
| Custom start commit | `origin/goc` / `84a07999` (chứa merge `v0.5.75` / `17c4cc76`) |
| Upstream base cũ | `v0.5.75` / `17c4cc76` |
| Upstream target mới | `v0.5.86` / `39e36d3d` |
| Nguồn upstream | Thư mục local `D:\Projects\custom\9router` |
| Update branch | `update/upstream-v0.5.86` |
| Backup branch | `backup/goc-before-v0.5.86` / `84a07999` |
| Custom result commit | `origin/goc` / `be3c654f` |

#### Mục tiêu đợt này

- [x] Nhận toàn bộ thay đổi upstream từ `v0.5.75` đến `v0.5.86` (72 commit, 220 file).
- [x] Giữ branding Duwn, primary `#2188FF` và Docker build từ source custom.
- [x] Giữ Token Limit tổng, quota ngày/giờ Việt Nam (UTC+7) và Allowed Models.
- [x] Tích hợp API key access check (`getApiKeyAccess`) cho endpoint mới `systemone` (`/v1/systemone`).
- [x] Giữ `usageDedupeKey` và transaction ghi usage + increment token.
- [x] Giữ migration schema 4 và an toàn dữ liệu API key hiện có.
- [x] Chạy unit test trọng tâm, kiểm tra baseline và production build.
- [x] Fast-forward `goc` tới `be3c654f` và push lên `origin/goc`.
- [x] Đồng bộ nhánh chính `origin/master` (@ `76d24f9c`) mang trọn vẹn source của `goc`.

#### Tiến độ theo pha

| Pha | Trạng thái | File/commit đã xử lý | Ghi chú |
|---|---|---|---|
| Chuẩn bị branch/backup | `HOÀN THÀNH` | `update/upstream-v0.5.86`, `backup/goc-before-v0.5.86` | Backup tạo tại `84a07999`; switch sang `update/upstream-v0.5.86`. Nguồn upstream local `9router` đã fetch tags tới `v0.5.86`. Merge-base là `17c4cc76`. |
| Phân tích upstream | `HOÀN THÀNH` | `17c4cc76..39e36d3d` | 72 commit, 220 file, +14040/-1331. 11 file giao với custom. DB schema không đổi (vẫn version 1 upstream). Thêm route `/v1/systemone` cần gắn `getApiKeyAccess`. |
| Merge và conflict | `HOÀN THÀNH` | merge commit `be3c654f`; 5 conflict: `package.json`, `sseToJsonHandler.js`, `Dockerfile`, `docker-publish.yml`, `DOCKER.md` | Giữ version `0.5.86` và description Duwn; giữ cả `usageDedupeKey` và `toolNameMap`; giữ Duwn labels trong Dockerfile; giữ GHCR custom publish; clean conflict markers. |
| Database/repository | `HOÀN THÀNH` | schema 4; `apiKeysRepo.js`, `usageRepo.js` | Schema 4 giữ nguyên, nhận tính năng chart requests/All-Time của upstream và giữ nguyên atomic transaction increment usedTokens + dedupeKey. |
| Auth/handlers/usage | `HOÀN THÀNH` | `auth.js`, `chatCore.js`, `systemone.js` | Gắn `getApiKeyAccess` vào `src/sse/handlers/systemone.js`; giữ token limit, daily/hourly quota và model access check trên mọi endpoint. |
| API/frontend | `HOÀN THÀNH` | Combos presets, CLI tools settings, MiMo auth/sessions, analytics charts | Nhận toàn bộ routes, API và UI mới của upstream; 148 route tĩnh và động được sinh hoàn chỉnh. |
| Branding/Docker | `HOÀN THÀNH` | `docker-compose.yml`, `Dockerfile`, `.github/workflows/docker-publish.yml` | Static scan xác nhận không có màu cyan cấm, Docker build từ local source `9router-custom:local`, publish GHCR custom. |
| Tests/build/review | `HOÀN THÀNH` | 13 custom quota/migration tests, 39 handlers/db-concurrent tests, 152 upstream tests, baseline verify, production build, standalone HTTP smoke | 100% test mục tiêu pass; Next.js 16.1.6 production build 148/148 routes pass; standalone server HTTP smoke test trả 200 cho `/api/health` và manifest Duwn `#2188ff`. |
| Release/push | `HOÀN THÀNH` | `goc` (`be3c654f`), `master` (`76d24f9c`) | Đã fast-forward và push `origin/goc`; đã hợp nhất và push `origin/master` đồng bộ 100% mã nguồn với `goc`. |

#### Kết quả kiểm thử và review

| Kiểm tra | Kết quả | Ghi chú |
|---|---|---|
| Migration chain & Token Limit | `PASS` — 13/13 test | `api-key-token-limit.test.js` và `db-migration-chain.test.js` pass hoàn toàn. |
| Custom handlers & Concurrency | `PASS` — 39/39 test | Bao gồm Gemini native, embedding usage persistence, xAI video, fetch account clear, và DB concurrency 200 parallel saves. |
| Upstream unit test suite (mới) | `PASS` — 152/152 test | Bao gồm capabilities, combo presets, opencode fingerprint/session, qoder billing/replay, zed completions. |
| Baseline verify (alias & OAuth) | `PASS` | `verify-alias.mjs` (117 tokens) và `verify-oauth-urls.mjs` khớp byte-for-byte. |
| Production build | `PASS` | Next.js 16.1.6 compile/static generation 148/148 routes pass; standalone assets được copy đầy đủ. |
| Standalone HTTP smoke | `PASS` | Chạy `custom-server.js`: `/api/health` trả 200 `ok: true`, `/manifest.webmanifest` trả 200 với tên Duwn và `#2188ff`. |
| Static brand & Docker scan | `PASS` | Không có mã màu cyan cấm; Dockerfile/Compose giữ local-source `9router-custom:local` và volume bind mount. | |

### 16.3. OPS-001 — VPS Compose bind mount và quy trình update an toàn

| Trường | Giá trị |
|---|---|
| Trạng thái | `HOÀN THÀNH` |
| Ngày thực hiện | 2026-09-07 |
| VPS/repository | Ubuntu; `/opt/9router` |
| Commit bắt đầu | `013dfd62` |
| Commit kết quả | `origin/goc` / `f88330f8` |
| Docker image/container | `9router-custom:local`; `9router` |
| Database chính | `/opt/9router/data/db/data.sqlite` |

#### Thay đổi source và cách vận hành

- `docker-compose.yml` dùng bind mount `./data:/app/data`; đã bỏ khai báo named volume ở cuối file.
- Giữ port `20128:20128`, `DATA_DIR=/app/data`, `restart: always`, service `headroom` và `HEADROOM_URL=http://headroom:8787`.
- Thêm executable `update.sh`; script khóa chống chạy song song, xác minh mount/Compose/headroom/DB, bắt buộc SQLite `.backup` + integrity trước fetch/build/recreate, rồi kiểm tra health và counts sau update.
- Bước recreate dùng `--no-build` vì image đã được build riêng; tránh Compose build hai lần do `pull_policy: build`.

#### Snapshot và backup trước chuyển đổi

- Container thủ công cũ dùng bind `/opt/9router/data:/app/data`, `restart=unless-stopped`, network mặc định `bridge` và chưa có `HEADROOM_URL`.
- DB bind chính: 180224 byte, schema 4, `apiKeys=1`, `providerConnections=0`, `providerNodes=0`, `settings=1`, integrity `ok`.
- Named volume `9router-data` không có container sử dụng nhưng chứa DB 4870144 byte với `apiKeys=3`, `providerConnections=6`, `providerNodes=0`, `settings=1`; giữ nguyên, không xóa hoặc phục hồi đè lên DB bind.
- Backup đã xác minh: `pre-compose-bind-20260907T042237Z.sqlite`, `pre-compose-named-volume-20260907T042237Z.sqlite`, `pre-recreate-bind-20260907T043134Z.sqlite` và backup thử script `data-20260907T043404Z.sqlite`, đều ở `/opt/9router/data/backups` với mode 600.

#### Kết quả chuyển đổi và kiểm tra

- Container cũ không bị xóa; được giữ stopped dưới tên `9router-pre-compose-20260907T043134Z` để rollback.
- `9router` mới do Compose project `9router` quản lý, mount bind đúng, chạy trên `9router_default` cùng `headroom`; DNS `headroom` resolve thành công và headroom healthy.
- `/api/health` trả `{"ok":true}`; `/api/version` xác nhận `0.5.69`; image, port và restart policy đúng cấu hình.
- DB sau recreate integrity `ok`, schema 4 và counts không giảm. Hash của dump logic từng bảng `apiKeys`, `providerConnections`, `providerNodes`, `settings` khớp tuyệt đối với backup trước recreate.
- `update.sh` đã chạy end-to-end thành công tại commit `980cf8fb`; tối ưu `--no-build` được thêm ở commit cuối `f88330f8` và đã pull lên VPS.
- Working tree VPS/local sạch; local HEAD, tracking ref, GitHub và VPS đều trỏ `f88330f843e4469093247a91a332a949287192ed`.

#### Lệnh update định kỳ

```bash
cd /opt/9router
./update.sh
```

Không dùng `docker pull decolua/9router:latest`; script luôn build `9router-custom:local` từ source branch `goc`.

### 16.4. UPD-004 — Update lên upstream `v0.5.69`

| Trường | Giá trị |
|---|---|
| Trạng thái | `HOÀN THÀNH` |
| Người thực hiện | Codex |
| Ngày bắt đầu | 2026-09-07 |
| Ngày hoàn thành | 2026-09-07 |
| Custom start commit | `origin/goc` / `3ef1d44d` |
| Upstream base cũ | `v0.5.55` / `699edac3` |
| Upstream target mới | `v0.5.69` / `eb712ca8` |
| Nguồn upstream | Thư mục local `D:\Projects\custom\9router` |
| Update branch | `update/upstream-v0.5.69` |
| Backup branch | `backup/goc-before-v0.5.69` / `3ef1d44d` |
| Custom result commit | `origin/goc` / `013dfd62` |

#### Mục tiêu đợt này

- [x] Nhận toàn bộ thay đổi upstream từ `v0.5.55` đến `v0.5.69`.
- [x] Giữ branding Duwn, primary `#2188FF` và Docker build từ source custom.
- [x] Giữ Token Limit tổng, quota ngày/giờ Việt Nam và Allowed Models.
- [x] Giữ migration an toàn và dữ liệu API key hiện có.
- [x] Chạy test trọng yếu, kiểm tra regression phù hợp baseline và production build.
- [x] Fast-forward `goc` và push lên `origin/goc` sau khi đạt kiểm tra.

#### Tiến độ theo pha

| Pha | Trạng thái | File/commit đã xử lý | Ghi chú |
|---|---|---|---|
| Chuẩn bị branch/backup | `HOÀN THÀNH` | `update/upstream-v0.5.69`, `backup/goc-before-v0.5.69` | Hai working tree sạch; nguồn local đã được fetch vào `local-upstream/master`; merge-base đúng `699edac3`. |
| Phân tích upstream | `HOÀN THÀNH` | `v0.5.55..v0.5.69` | 91 commit, 222 file, +12235/-2868; 12 file giao với custom cần rà kỹ. |
| Merge và conflict | `HOÀN THÀNH` | merge commit `013dfd62`; `package.json` | Một conflict: nhận version/dependency/script `0.5.69`, giữ description Duwn; không còn marker hoặc unmerged path. |
| Database/repository | `HOÀN THÀNH` | schema 4; API key repo/migrations | Schema không tăng; boot/smoke chạy đủ migration 1→4 và các test migration/quota pass. |
| Auth/handlers/usage | `HOÀN THÀNH` | `auth.js`, app handlers, `chatCore` | Nhận quota Antigravity và usage/provider mới; giữ access check tổng/ngày/giờ/model cùng `usageDedupeKey` custom. |
| API/frontend | `HOÀN THÀNH` | model catalog, Grok CLI import, CLI presets, provider/quota UI | Nhận toàn bộ route và UI upstream mới; production build tạo đủ 137 route. |
| Branding/Docker | `HOÀN THÀNH` | layout, global CSS, Dockerfile/package | Static scan giữ Duwn, `#2188FF`, local-source Docker và không có clone/fetch/image runtime upstream. |
| Tests/build/review | `HOÀN THÀNH` | 44 suite trọng tâm; 3 baseline gate; web + CLI build; standalone smoke | 417/417 test pass; provider/alias/OAuth baseline pass; hai build exit 0; health/login/manifest/models đều pass. |
| Release/push | `HOÀN THÀNH` | `goc`, `origin/goc` | Fast-forward và push tới `013dfd62`; `ls-remote`, tracking ref và local HEAD khớp tuyệt đối. |

#### Phân tích giao nhau ban đầu

- Phần custom từ base `v0.5.55` chạm 67 file; upstream mới chạm 222 file.
- 12 file giao nhau: `Dockerfile`, `package.json`, `src/app/globals.css`, `src/app/layout.js`, `src/sse/services/auth.js`, ba handler app-side, ba file `chatCore` và một test fetch.
- Ưu tiên giữ metadata/branding Duwn và Docker local-source; nhận kiến trúc, provider, security và dependency mới của upstream.
- Với auth/usage, giữ thứ tự kiểm tra API key và quota tổng/ngày/giờ trước khi route provider; chỉ tái áp dụng custom tại vị trí mới nếu upstream đã đổi cấu trúc.

#### Kết quả kiểm thử và review

| Kiểm tra | Kết quả | Ghi chú |
|---|---|---|
| 12 suite custom/security/migration | `PASS` — 125/125 test | Bao phủ quota API key, schema 1→4, dashboard/auth, SSRF, redaction, usage dedupe, embedding/image/Gemini và GitHub lock. |
| 32 suite upstream mới/thay đổi | `PASS` — 292/292 test | Bao phủ Antigravity Gemini 3.8, Claude tools, Codex, CommandCode, OpenCode Go, usage providers, Ollama/Xquik, translator và model lookup. |
| Baseline provider/alias/OAuth | `PASS` | 81 provider, 117 alias token và OAuth URL khớp baseline đã version hóa. |
| Production web build | `PASS` | Next.js 16.3.4 compile/TypeScript/static generation 137/137; postbuild copy đủ asset standalone. |
| CLI package build | `PASS` | App nhúng, SQLite runtime, MITM bundle và asset được dựng hoàn chỉnh. |
| Standalone HTTP smoke | `PASS` | `/api/health`, `/login`, `/manifest.webmanifest`, `/v1/models` đều 200; brand Duwn và schema 4 được xác nhận. |
| Git/Docker static checks | `PASS` | `git diff --check` sạch; Docker không tải/chạy upstream; local/remote `goc` cùng hash. |

#### Thay đổi upstream đáng chú ý đã nhận

- Bổ sung quota/routing Antigravity cho Gemini 3.8, model catalog sync và API model lookup mới.
- Bổ sung OpenCode Go session/usage, Grok CLI bulk import, Xquik Search và Ollama Web Fetch.
- Mở rộng usage cho GLM, Groq, Zed và Codex; cải thiện CommandCode, Claude tools, Kiro image và Responses API.
- Tăng cường SSRF guard, system injection, tool-call/thinking translation, thought signature và cache/stream handling.

#### Vấn đề còn lại

- Next file tracing trên Windows cảnh báo không thể dựng đường dẫn lồng `C:\Program Files\Tailscale` cho route tunnel; cả web/CLI build vẫn exit 0 và standalone smoke pass. Cần kiểm tra riêng tính năng Tailscale trong môi trường có cài Tailscale nếu dùng route này.
- CLI build kết thúc thành công nhưng lệnh thống kê kích thước `du` không có trên Windows; không ảnh hưởng artifact.
- `npm install` báo 2 lỗ hổng mức moderate trong dependency tree; chưa tự nâng ngoài phiên bản upstream để tránh lệch source.
- Máy hiện tại không có Docker CLI, nên chưa chạy image/container smoke.
- Không chạy lại toàn bộ Vitest thô vì baseline dự án đã ghi nhận nhiều lỗi phụ thuộc Windows/live-network; thay vào đó đã chạy 417 test trọng yếu và ba gate baseline độc lập.

#### Kết luận đợt update

- Merge commit `013dfd62` có hai parent: custom cũ `3ef1d44d` và upstream `eb712ca8` (`v0.5.69`).
- Branding Duwn, Docker local-source, Token Limit tổng, quota ngày/giờ Việt Nam, Allowed Models và schema 4 đều được giữ.
- Local `goc`, tracking `origin/goc` và ref GitHub đều trỏ `013dfd62d185be7beb2c7a11df033c4bca5eaa96`; working tree sạch sau push.

### 16.5. UPD-003 — Update lên upstream `v0.5.55`

| Trường | Giá trị |
|---|---|
| Trạng thái | `HOÀN THÀNH` |
| Người thực hiện | Claude Code |
| Ngày bắt đầu | 2026-08-15 |
| Ngày hoàn thành | 2026-08-15 |
| Custom start commit | `origin/goc` / `522740d2` |
| Upstream base cũ | `v0.5.50` / `15223724` |
| Upstream target mới | `v0.5.55^{}` / `699edac3` (tag object `2b5ac208`) |
| Update branch | `update/upstream-v0.5.55` |
| Backup branch | `backup/goc-before-v0.5.55` / `522740d2` |
| Custom result commit | `3ef1d44d` — `chore(upstream): merge 9Router v0.5.55` |
| Pull request/release | Đã push trực tiếp `origin/goc`; chưa tạo release |

#### Mục tiêu đợt này

- [x] Nhận toàn bộ logic, provider, routing và security upstream tới `v0.5.55`.
- [x] Giữ branding Duwn và primary `#2188FF`.
- [x] Giữ Docker local-source build và GHCR custom.
- [x] Giữ Token Limit tổng, Allowed Models và quota ngày/giờ UTC+7.
- [x] Giữ usage dedupe và auth access check trên mọi endpoint.
- [x] Kiểm thử migration, security, routing, build và runtime trước review.

#### Phân tích ban đầu

- Upstream `v0.5.50..v0.5.55`: 103 file, +9164/-420.
- Custom `v0.5.50..522740d2`: 67 file, +1794/-671.
- Sáu path được cả upstream và custom sửa: `Dockerfile`, `package.json`, `open-sse/handlers/chatCore.js`, `open-sse/handlers/chatCore/requestDetail.js`, `src/app/login/page.js`, `src/shared/components/Header.js`.
- Thay đổi upstream không được mất: trusted-peer/custom-server, remote default-password block, search SSRF guard, request-detail redaction, SAML 2.0, OpenCode-Go transport mới, Kiro/translator, Gemini usage và Docker `sql.js` WASM.
- Custom không được mất: schema v4, API-key quota/model policy, per-request usage dedupe, branding Duwn, bỏ Donate và Docker/GHCR custom.

#### Tiến độ theo pha

| Pha | Trạng thái | File/khu vực | Kết quả |
|---|---|---|---|
| Chuẩn bị branch/backup | `HOÀN THÀNH` | `update/upstream-v0.5.55`, `backup/goc-before-v0.5.55` | Working tree sạch trước merge; refs đã fetch; tag `v0.5.55` peel đúng `699edac3`. |
| Phân tích upstream | `HOÀN THÀNH` | `v0.5.50..v0.5.55` | Đã rà sáu file giao nhau và invariant security/custom. Không phát hiện regression semantic do merge. |
| Merge và conflict | `HOÀN THÀNH` | 103 file; `package.json` | Merge commit `3ef1d44d`; một conflict. Giữ version/dependency/script upstream và description Duwn. Không còn unmerged path. |
| Database/repository | `HOÀN THÀNH` | schema v4, migration 002–004, API-key repos, usage repo | Giữ toàn bộ policy field/import-export/legacy migration. Usage insert, daily aggregate và `usedTokens` increment nằm cùng transaction; dedupe theo key riêng từng request. |
| Auth/handlers/usage | `HOÀN THÀNH` | trusted peer, login hardening, SSRF, redaction, SAML, provider handlers | Giữ peer-token proof, chặn remote default password, SSRF guard, payload redaction, SAML và `getApiKeyAccess(apiKey, requestedModel)` ở endpoint tiêu thụ provider. |
| API/frontend/branding | `HOÀN THÀNH` | login, Header, endpoint UI, assets | Giữ BrandMark, Duwn, `#2188FF`, PWA assets và bỏ Donate; nhận đầy đủ SAML/OIDC UI upstream. |
| Docker/build/runtime | `HOÀN THÀNH CÓ GIỚI HẠN` | Dockerfile, Compose, standalone, CLI | Next production build PASS; CLI build PASS; standalone smoke PASS cho `/api/health`, `/login` (Duwn), `/manifest.webmanifest`, `/v1/models`. Docker CLI không có nên image/container smoke `CHƯA CHẠY`. Dockerfile vẫn copy toàn `sql.js`, gồm WASM ở image build. |
| Tests/review | `HOÀN THÀNH CÓ GHI CHÚ` | custom, security, routing, full Vitest | Custom: 51/51 PASS. Security/routing: 110/110 PASS. Hai full-run cô lập cùng môi trường đều đỏ: upstream sạch `v0.5.55` có khoảng 93 assertion fail, custom có khoảng 95; tập lỗi dao động do concurrency, Windows file lock, snapshot và live/network tests. Các lỗi khác biệt đáng chú ý chạy lại riêng còn 3: 1 lỗi cleanup DB `EPERM` trên Windows và 2 lỗi fixture mock thiếu `formatHeadroomSizeLog`; không phải runtime regression. Raw baseline gate còn giả định path `/app/`, nên không dùng trực tiếp trên Windows. |

#### Ghi chú kiểm thử và vấn đề còn lại

- `tests/auth/saml.test.js` dùng `node:test`, không phải Vitest; full run xác nhận 4/4 PASS.
- `git diff --check` báo 37 whitespace issue có sẵn trong phần upstream merge ở ba README i18n, `open-sse/executors/antigravity.js` và trang profile. Không sửa để tránh mở rộng diff ngoài yêu cầu.
- Full suite tự cập nhật snapshot khi chạy; toàn bộ snapshot và artifact tạm đã được restore/xóa. Clone upstream `D:\Projects\custom\9router` trở lại sạch. Dependency local đã được cài ở cả hai repo chỉ để đối chiếu; `node_modules` đều bị ignore, không tạo lockfile tracked.
- `npm install` báo 2 moderate vulnerabilities; chưa chạy `npm audit fix --force` vì có thể đổi dependency ngoài phạm vi update.
- Merge commit `3ef1d44d` có hai parent: custom cũ `522740d2` và upstream `699edac3` (peeled commit của annotated tag `v0.5.55`; tag object `2b5ac208`).
- `goc` và `origin/goc` đã fast-forward/push tới `3ef1d44d`; backup `backup/goc-before-v0.5.55` vẫn giữ `522740d2`.
- Chưa deploy hoặc tạo release.

### 16.6. UPD-002 — Hạn mức token theo ngày/giờ Việt Nam

| Trường | Giá trị |
|---|---|
| Trạng thái | `HOÀN THÀNH` |
| Người thực hiện | Codex |
| Ngày bắt đầu | 2026-08-10 |
| Ngày hoàn thành | 2026-08-10 |
| Custom start commit | `origin/goc` / `d4fa2d73` |
| Upstream base cũ | `v0.5.50` / `15223724` |
| Loại thay đổi | Custom feature, không đổi upstream base |
| Update branch | `feature/api-key-time-limits` |
| Backup branch | `backup/goc-before-time-limits` |
| Custom result commit | `origin/goc` / `522740d2` |
| Pull request/release | Push trực tiếp nhánh `goc`; chưa tạo release/tag custom |

#### Mục tiêu đợt này

- [x] Thêm hạn mức token theo ngày cho từng API key.
- [x] Cho chọn giờ reset hằng ngày cụ thể theo `Asia/Ho_Chi_Minh` (UTC+7).
- [x] Thêm hạn mức token theo giờ và cho chọn phút reset trong mỗi giờ.
- [x] Giữ nguyên Token Limit tổng và Allowed Models hiện tại.
- [x] Migration an toàn từ schema 3, không làm mất key hoặc usage cũ.
- [x] Hiển thị usage/trạng thái quota ngày và giờ trên trang Endpoint.

#### Quyết định ban đầu

- Daily window là chu kỳ 24 giờ bắt đầu tại giờ/phút reset do người dùng chọn theo giờ Việt Nam.
- Hourly window là chu kỳ 60 phút bắt đầu tại phút reset do người dùng chọn trong mỗi giờ Việt Nam.
- Usage cửa sổ được tính từ `usageHistory` theo timestamp UTC; không duy trì thêm counter dễ lệch dữ liệu.
- Múi giờ cố định `Asia/Ho_Chi_Minh`/UTC+7, không phụ thuộc timezone của trình duyệt hoặc máy chủ.

#### Tiến độ và kết quả

| Pha | Trạng thái | File/khu vực | Kết quả |
|---|---|---|---|
| Chuẩn bị branch/backup | `HOÀN THÀNH` | `feature/api-key-time-limits`, `backup/goc-before-time-limits` | Bắt đầu từ `d4fa2d73`; không có conflict. |
| Database/repository | `HOÀN THÀNH` | schema 4, migration 004, API key repo, export/import, legacy migration | Giữ dữ liệu schema 1/3, thêm index usage theo key/timestamp. |
| Auth/API | `HOÀN THÀNH` | `auth.js`, API `/api/keys` | Trả 429 và `resetAt` khi chạm quota ngày/giờ; validation sai trả 400. |
| Frontend | `HOÀN THÀNH` | `EndpointPageClient.js` | Tạo/sửa quota, chọn lịch UTC+7, xem progress và reset tiếp theo. |
| Tests/build | `HOÀN THÀNH` | 2 suite trọng tâm; production build | 13/13 test pass; Next production build 131 route pass. |
| Review/release | `HOÀN THÀNH` | `goc`, `origin/goc` | Fast-forward và push thành công tới `522740d2`. |

#### Kiểm thử thực tế

| Ngày | Kiểm tra | Kết quả | Ghi chú |
|---|---|---|---|
| 2026-08-10 | `api-key-token-limit` + `db-migration-chain` | `PASS` — 13/13 test | Bao gồm ranh giới UTC+7, 429 ngày/giờ, schema 1→4, boot lặp, legacy JSON và export/import. |
| 2026-08-10 | ESLint cho backend, migration và test đã đổi | `PASS` | File Endpoint còn 5 lỗi/2 warning React hook có sẵn từ trước; production compiler vẫn pass. |
| 2026-08-10 | `next build --webpack` với output/HOME tách biệt | `PASS` | Compile, TypeScript, tạo 131 route, trace và postbuild đều hoàn tất. |
| 2026-08-10 | `git diff --check`, commit/push/remote hash | `PASS` | Local `goc` và `origin/goc` cùng trỏ `522740d2aa3e9b6a3da261917b9fb65838a2f4f3`. |

#### Kết luận

- Quota ngày/giờ Việt Nam đã hoạt động song song với Token Limit tổng và Allowed Models.
- Database được backup/nâng tự động lên schema 4; backup/restore và dữ liệu legacy giữ đủ cấu hình mới.
- Nhánh chính thức `goc` đã được push và xác minh tại `origin/goc` / `522740d2`.

### 16.7. UPD-001 — Update lên upstream `v0.5.50`

| Trường | Giá trị |
|---|---|
| Trạng thái | `HOÀN THÀNH` |
| Người thực hiện | Codex |
| Ngày bắt đầu | 2026-08-07 |
| Ngày hoàn thành | 2026-08-08 |
| Custom start commit | `79d704c9` |
| Upstream base cũ | `v0.5.45` / `6fcd2733` |
| Upstream target mới | `v0.5.50` / `15223724` |
| Update branch | `update/upstream-v0.5.50` |
| Backup branch | `backup/goc-before-v0.5.50` |
| Custom result commit | `origin/goc` / `d4fa2d73` |
| Pull request/release | Push trực tiếp nhánh `goc`; chưa tạo release/tag custom |

#### Mục tiêu đợt này

- [x] Nhận toàn bộ logic/bugfix upstream tới target đã chọn.
- [x] Giữ branding Duwn và primary `#2188FF`.
- [x] Giữ Docker local-source build và GHCR custom.
- [x] Giữ/migrate an toàn Token Limit.
- [x] Giữ/migrate an toàn Allowed Models.
- [x] Cập nhật tài liệu này thành mốc cho lần sau.

#### Phân tích thay đổi upstream

| Khu vực upstream | Thay đổi quan trọng | Tác động custom | Quyết định |
|---|---|---|---|
| Database/migrations | Không thêm schema/migration; chỉ đổi `requestDetailsRepo` và `settingsRepo`. Upstream vẫn schema version 1. | Không xung đột migration 2/3 của Duwn; cần giữ schema version 3 và ba field API key. | Nhận thay đổi repository upstream; giữ nguyên migration và persistence custom, rồi chạy cả hai đường nâng DB. |
| Auth/API key | Redirect session đang active khỏi login; sửa OAuth/Antigravity/Qoder; khóa GitHub hết monthly usage tới kỳ reset. | `src/sse/services/auth.js` cùng thay đổi; phải hợp nhất với `getApiKeyAccess`, HTTP 429 Token Limit và 403 Allowed Models. | Dùng logic fallback/session mới của upstream và giữ thứ tự kiểm tra API key custom trước khi route provider. |
| Usage/streaming | Giữ cached tokens khi ép SSE → JSON; thêm/cập nhật usage cho CodeBuddy, Grok CLI và Ollama. | `usageRepo` và điểm cộng `usedTokens` không bị upstream sửa trực tiếp. | Nhận nguyên trạng upstream; giữ một điểm increment custom sau insert/dedupe. |
| Providers/routing | Thêm TokenRouter, self-hosted OpenAI-compatible STT/TTS/embedding, Xiaomi MiMo TTS; bỏ Qwen; thêm capacity + vision/audio adapter cho combo; cập nhật Codex/GitHub/Ollama. | `chat.js` và `tts.js` cùng thay đổi; mọi request vẫn phải qua Token Limit/Allowed Models. | Hợp nhất kiến trúc handler mới với `getApiKeyAccess`; giữ model đầu vào làm canonical rule hiện tại. |
| API routes | Sửa auth status, OAuth register/session và provider validate/models/test; không thêm public model endpoint mới ngoài các handler hiện có. | Gemini native và media auth custom không bị upstream sửa trực tiếp. | Nhận route upstream; giữ auth custom ở các endpoint tiêu thụ provider hiện có. |
| Frontend | Tự tạo `Default Key` lần đầu; thêm UI capacity/vision adapter, OpenDesign và cập nhật provider/quota. | `EndpointPageClient`, login và sidebar cùng thay đổi; cần giữ form/usage Token Limit, Allowed Models và branding Duwn. | Giữ component upstream mới, hợp nhất auto-provision vào UI quản lý key custom, tái áp dụng branding sau cùng. |
| Build/Docker | Thêm postbuild copy assets, script standalone và cập nhật `next.config.mjs`; không đổi Docker/Compose trong khoảng release. | `package.json` xung đột version/description; Docker custom không bị chạm. | Nhận version `0.5.50` và postbuild upstream, giữ description Duwn cùng local-source Docker/GHCR. |

#### Tiến độ theo pha

| Pha | Trạng thái | File/commit đã xử lý | Ghi chú |
|---|---|---|---|
| Chuẩn bị branch và backup | `HOÀN THÀNH` | `79d704c9`, `backup/goc-before-v0.5.50`, `update/upstream-v0.5.50` | Working tree sạch; đã fetch `origin` và `upstream`; target là release `v0.5.50`. |
| Phân tích upstream | `HOÀN THÀNH` | `v0.5.45..v0.5.50` | 42 commit, 180 file, +5391/-1370; 7 file giao nhau với custom. |
| Merge và resolve conflict | `HOÀN THÀNH` | merge `v0.5.50`; `package.json`; `EndpointPageClient.js` | 2 conflict nội dung đã resolve; không còn marker hoặc unmerged path; `git diff --check` sạch. |
| Database/repository | `HOÀN THÀNH` | schema version 3; migrations 002/003; API key/usage repos | Hai đường nâng DB, lặp migration và export/import đều pass; đã bổ sung `allowedModels` còn thiếu trong export/import và legacy JSON migration. |
| Auth/handlers/usage | `HOÀN THÀNH` | `auth.js`, `chat.js`, `tts.js`; chatCore; `usageRepo.js`; các handler media/Gemini custom | Đã hợp nhất GitHub monthly lock, capacity adapter và MiMo TTS với `getApiKeyAccess`; chống trùng usage bằng khóa request riêng để không mất số đếm đồng thời. |
| API/frontend | `HOÀN THÀNH` | API keys; `EndpointPageClient.js`; login/sidebar/provider UI | Giữ Token Limit/Allowed Models; nhận auto-provision Default Key và redirect session upstream. |
| Branding/UI | `HOÀN THÀNH` | custom delta so với `v0.5.50` | Static scan không phát hiện cyan cấm hoặc mất branding Duwn; primary `#2188FF` được giữ. |
| Docker/build | `HOÀN THÀNH` | `package.json`, `next.config.mjs`, `scripts/copy-standalone-assets.mjs`; Docker custom | Static scan xác nhận local-source/GHCR; Next 16.1.6 production build và standalone smoke đều pass khi cô lập HOME/APPDATA/TEMP vào workspace. Docker CLI vẫn không có để chạy image smoke. |
| Tests/smoke | `HOÀN THÀNH` | 12 suite trọng yếu; full suite; production/standalone/static checks | 74/74 test trọng yếu pass; production artifact chạy thật và trả health/login/manifest đúng; full suite còn các failure upstream/harness/môi trường đã ghi riêng. |
| Review/release | `HOÀN THÀNH` | `origin/goc` → `d4fa2d73` | Đã fast-forward nhánh local và push thành công lên GitHub; chưa tạo release/tag custom. |
| Cập nhật tài liệu | `HOÀN THÀNH` | `CUSTOMIZATION_HANDOFF.md` | Đã ghi phân tích, conflict, migration, test, known issues, commit kết quả và trạng thái push remote. |

#### Conflict và quyết định

| File/khu vực | Conflict hoặc thay đổi upstream | Cách resolve | Lý do | Trạng thái |
|---|---|---|---|---|
| `package.json` | Upstream tăng version lên `0.5.50`, thêm postbuild nhưng khôi phục description gốc. | Giữ version/postbuild upstream và description `Duwn-branded 9Router web dashboard`. | Nhận fix standalone mà không mất branding package. | `ĐÃ XỬ LÝ` |
| `src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.js` | Upstream auto-provision Default Key và làm nút show/copy luôn hiện; custom đã cấu trúc lại danh sách key để thêm limit/models. | Giữ cấu trúc custom, nhận auto-provision và visibility UX upstream; giữ Edit/Delete đúng hành vi. | Không thay toàn bộ component cũ hoặc mới; bảo toàn cả logic upstream và quản lý key custom. | `ĐÃ XỬ LÝ` |
| Export/import DB và legacy JSON | Luồng persistence hiện hữu chỉ giữ `tokenLimit`/`usedTokens`, bỏ sót `allowedModels`. | Bổ sung `allowedModels` vào cả export/import SQLite và migration từ `db.json`; thêm test round-trip. | Tránh mất chính sách model khi backup/restore hoặc nâng từ dữ liệu cũ. | `ĐÃ XỬ LÝ` |
| `src/lib/db/repos/usageRepo.js` và chatCore | Dedupe upstream dùng timestamp + provider/model/token; request đồng thời giống nhau trong cùng mili-giây bị gộp nhầm, làm thiếu usage và `usedTokens`. | Dedupe chỉ khi có `usageDedupeKey` riêng của request; truyền cùng khóa qua streaming, non-streaming và SSE→JSON; request khác luôn được ghi độc lập. | Bảo toàn chống ghi trùng cho một request mà không làm sai quota khi tải đồng thời. | `ĐÃ XỬ LÝ` |

#### Migration dữ liệu

| Đường nâng cấp | Kết quả | Ghi chú |
|---|---|---|
| Upstream DB cũ → custom mới | `PASS` | DB schema 1 được backup tự động rồi nâng lên schema 3, giữ key cũ và thêm đủ ba field custom. |
| Duwn DB hiện tại → custom mới | `PASS` | DB schema 3 giữ nguyên `tokenLimit`, `usedTokens`, `allowedModels` qua nhiều lần boot. |
| Backup/restore | `PASS` | Export/import giữ đủ ba field; pre-schema backup và legacy JSON backup được tạo trong test. |
| Chạy migration lần hai | `PASS` | Migration idempotent; schema/index và dữ liệu không bị nhân đôi hoặc mất. |

#### Kiểm thử thực tế

| Ngày | Môi trường | Lệnh/suite | Kết quả | Ghi chú/lỗi |
|---|---|---|---|---|
| 2026-08-08 | Windows, Node.js, better-sqlite3 | 12 file unit trọng yếu | `PASS` — 74/74 test | Bao gồm Token Limit, Allowed Models, migration, export/import, 100 usage song song, Gemini native, auth, GitHub lock, Codex capacity, MiMo TTS và standalone assets. |
| 2026-08-08 | Windows, Node.js | Toàn bộ Vitest suite, 1 worker | `PARTIAL` — 147 file pass, 29 fail, 11 skip; 1660 test pass, 91 fail, 17 expected-fail, 59 skip | Lỗi còn lại tập trung ở test/harness upstream, snapshot/đường dẫn Windows, dependency test thiếu và test provider live; không dùng full-suite này để tuyên bố release xanh. |
| 2026-08-08 | Windows | `next build --webpack`, Next 16.1.6, output riêng `.next-validation` | `PASS` | Cô lập HOME/USERPROFILE/APPDATA/LOCALAPPDATA/TEMP/TMP vào workspace để tránh junction Windows; compile 131 route, TypeScript, page generation, trace và postbuild đều hoàn tất. Trace JSON không còn tham chiếu ổ ngoài; standalone có `server.js`, Next runtime, static assets và public assets. |
| 2026-08-08 | Windows | Chạy `.next-validation/standalone/server.js` và HTTP smoke | `PASS` | Server ready trên cổng tạm; `/api/health` trả 200 `{"ok":true}`; `/login` chứa Duwn; manifest trả 200 và chứa Duwn cùng `#2188ff`. |
| 2026-08-08 | Windows | Static brand/Docker scan + `git diff --check` | `PASS` | Không có cyan cấm; Dockerfile/Compose không clone/fetch upstream hoặc chạy image `decolua/9router`; diff không có whitespace error. |
| 2026-08-08 | Máy hiện tại | Docker Compose/image/container smoke | `CHƯA CHẠY` | Docker CLI không được cài; WSL không khả dụng trong môi trường này. |

#### Vấn đề còn lại

- Trên máy Windows này, `npm run build` với HOME/APPDATA/TEMP mặc định vẫn có thể bị Next file tracing vướng junction hồ sơ người dùng; build xác nhận dùng các thư mục build tạm nằm trong workspace và đã tạo artifact hợp lệ.
- Full Vitest suite chưa xanh: 29 file fail thuộc các nhóm upstream/harness/môi trường nêu trên; nếu quy trình release bắt buộc toàn bộ suite xanh thì cần một đợt triage riêng.
- Chưa có Docker image/container smoke test trên máy hiện tại.
- Nhánh local `goc` và `origin/goc` cùng trỏ tới `d4fa2d73` sau khi push; backup trước update vẫn ở `backup/goc-before-v0.5.50` / `79d704c9`.

#### Kết luận đợt update

- Mã nguồn đã merge tới upstream `v0.5.50`, giữ đầy đủ custom Duwn; nhánh `goc` local hiện ở merge commit `d4fa2d73`.
- Production build và standalone HTTP smoke đã pass; 74/74 test trọng yếu pass. Full suite và Docker smoke vẫn được giữ trong known issues để người duyệt quyết định tiêu chuẩn phát hành.
- Trạng thái `HOÀN THÀNH`; `origin/goc` / `d4fa2d73` là custom base chính thức cho lần update kế tiếp.
- Chưa tạo release/tag custom; các hạn chế full-suite và Docker smoke ở trên vẫn là known issues, không làm thay đổi commit base đã push.

### 16.8. BASE-001 — Custom ban đầu trên `v0.5.45`

| Trường | Giá trị |
|---|---|
| Trạng thái | `HOÀN THÀNH` |
| Thời gian | 2026-07-30 đến 2026-07-31 |
| Upstream base | `v0.5.45` / `6fcd2733` |
| Custom result | `origin/goc` / `79d704c9` |
| Số commit custom | 4 |
| Phạm vi | 58 file, +1007/-639 dòng |

Các mốc:

| Thời gian | Commit | Kết quả |
|---|---|---|
| 2026-07-30 22:47 +07:00 | `caf4b9b8` | Branding Duwn và Docker custom |
| 2026-07-31 15:02 +07:00 | `b11d67ac` | Token Limit và tests |
| 2026-07-31 16:07 +07:00 | `370112b5` | Allowed Models và UI quản lý key |
| 2026-07-31 16:34 +07:00 | `79d704c9` | Sửa production build sau conflict code |

Kết quả, test và hạn chế của đợt này được mô tả chi tiết tại Mục 3 đến Mục 9.

## 17. Cách duy trì file sau mỗi lần update

### Khi vừa bắt đầu

1. Tăng mã update: `UPD-001`, `UPD-002`, ...
2. Điền commit/tag và branch thật, không để “latest”.
3. Đổi trạng thái ở Mục 0 và bản ghi update thành `ĐANG PHÂN TÍCH`.
4. Commit lần đầu của tài liệu nếu muốn lưu mốc khởi động rõ ràng.

### Trong lúc làm

Sau mỗi nhóm thay đổi:

1. Cập nhật bảng tiến độ của bản ghi đang hoạt động.
2. Thêm conflict và quyết định vừa xử lý.
3. Ghi file/commit liên quan.
4. Ghi test đã chạy, kể cả test fail.
5. Nếu phát hiện custom mới hoặc thay đổi invariant, sửa luôn mục kiến trúc tương ứng ở phần trên; không chỉ ghi trong nhật ký.

Ví dụ: nếu upstream đã có cơ chế quota chính thức và Token Limit được chuyển sang dùng quota service, phải cập nhật Mục 6 để mô tả kiến trúc mới, đồng thời ghi quyết định migration trong nhật ký.

### Khi hoàn thành

1. Ghi `Custom result commit`, PR và release/tag nếu có.
2. Đổi tất cả pha hoàn tất thành `HOÀN THÀNH` hoặc ghi rõ pha bị hoãn.
3. Ghi đầy đủ test pass/fail và known issues.
4. Đổi trạng thái tổng thành `HOÀN THÀNH`.
5. Cập nhật snapshot tại Mục 0, Mục 1 và Mục 15.
6. Cập nhật danh sách file ở Mục 8 theo diff custom mới so với upstream base mới.
7. Di chuyển bản ghi hoàn thành xuống dưới placeholder của lần kế tiếp.
8. Tạo placeholder `UPD-00N` mới với base là custom result vừa hoàn thành.
9. Tăng phiên bản tài liệu và commit file cùng source.

### Tiêu chuẩn để tài liệu được coi là đã cập nhật

- Không còn trường “Chưa xác định” trong bản ghi đã đánh dấu hoàn thành.
- Hash upstream/custom có thể resolve bằng Git.
- Mỗi conflict quan trọng có quyết định và lý do.
- Mỗi tính năng custom có kết quả kiểm thử.
- Base cho lần sau trỏ đúng custom commit đã merge, không trỏ branch tạm.
- Phần kiến trúc mô tả code hiện tại, còn nhật ký mô tả lịch sử thay đổi; hai phần không mâu thuẫn.
