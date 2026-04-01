# Tài liệu chức năng Frontend và yêu cầu Backend tích hợp

## 1. Mục tiêu tài liệu

Tài liệu này mô tả:
- Toàn bộ chức năng chính đang có trong folder frontend.
- Các yêu cầu backend cần xây dựng để tương thích với frontend hiện tại.
- Data contract và danh sách API đề xuất để có thể thay Firebase trực tiếp hoặc chạy song song trong giai đoạn chuyển đổi.

### 1.1 Quy ước thuật ngữ domain

- Dùng thuật ngữ chuẩn: `store` (cửa hàng) thay cho `restaurant` để hỗ trợ nhiều mô hình kinh doanh.
- Trong giai đoạn chuyển đổi, backend/database có thể vẫn dùng tên vật lý cũ (`restaurants`, `restaurant_id`) và map ở tầng API/service.

## 2. Tổng quan kiến trúc frontend hiện tại

- Framework: React 19 + TypeScript + Vite.
- Routing: React Router.
- UI: TailwindCSS + Lucide icons + Motion animations.
- Auth: Firebase Authentication (Google Sign In).
- Data: Firestore.
- File upload: Firebase Storage.
- Tạo QR: qrcode.react.

### 2.1 Cấu trúc màn hình chính

- Trang public:
  - Landing page: trang giới thiệu sản phẩm.
  - Public menu theo slug: đường dẫn dạng /m/:slug.
- Trang quản trị:
  - Login bằng Google.
  - Dashboard tổng quan.
  - Quản lý danh sách cửa hàng.
  - Quản lý từng cửa hàng: QR, menu, thông tin.

### 2.2 Luồng điều hướng chính

- /: Landing page.
- /login: Đăng nhập Google.
- /dashboard/*: Khu vực quản trị (bắt buộc đăng nhập).
- /m/:slug: Menu công khai cho khách quét QR.

## 3. Chức năng chi tiết của frontend

## 3.1 Xác thực và người dùng

### 3.1.1 Đăng nhập Google

- Người dùng đăng nhập bằng popup Google.
- Sau khi đăng nhập thành công:
  - Kiểm tra users/{uid} có tồn tại chưa.
  - Nếu chưa có thì tạo profile mới với role mặc định là user.
- Nếu đăng nhập lỗi: hiển thị thông báo thất bại.

### 3.1.2 Quản lý phiên đăng nhập

- App lắng nghe onAuthStateChanged.
- Có user thì truy vấn profile trong collection users.
- Không có user thì điều hướng về login khi truy cập dashboard.

### 3.1.3 Đăng xuất

- Gọi signOut.
- Điều hướng về trang chủ.

## 3.2 Dashboard quản trị

### 3.2.1 Tổng quan hệ thống

Hiển thị thống kê theo user hiện tại:
- Tổng số cửa hàng.
- Tổng số danh mục.
- Tổng số sản phẩm.

Lưu ý hiện tại có giới hạn truy vấn Firestore in tối đa 10 store id trong một lần tổng hợp.

### 3.2.2 Danh sách cửa hàng

- Liệt kê tất cả store theo ownerId của user đăng nhập.
- Tạo cửa hàng mới:
  - Sinh slug tự động từ tên + hậu tố ngẫu nhiên.
  - Tạo document store với dữ liệu tối thiểu.
  - Điều hướng vào trang quản lý cửa hàng vừa tạo.
- Xóa cửa hàng.

## 3.3 Quản lý cửa hàng

Mỗi cửa hàng có 3 tab chính:

### 3.3.1 Tab QR / Overview

- Sinh URL menu public: /m/{slug}.
- Render QR code từ URL menu.
- Cho tải QR dưới dạng PNG.
- Link mở nhanh menu public.
- Hiển thị số danh mục và sản phẩm của cửa hàng.

### 3.3.2 Tab Quản lý menu

#### Quản lý danh mục

- Danh sách danh mục theo storeId.
- Sắp xếp theo trường order.
- Thêm danh mục.
- Sửa tên danh mục.
- Xóa danh mục.

#### Quản lý sản phẩm

- Danh sách sản phẩm theo storeId.
- Lọc theo category đang chọn.
- Thêm sản phẩm (tên, giá, mô tả, ảnh).
- Sửa sản phẩm.
- Xóa sản phẩm.
- Upload ảnh sản phẩm lên storage và lưu imageUrl.

### 3.3.3 Tab Thông tin cửa hàng

- Cập nhật dữ liệu nhà hàng:
  - name, slug, bio, address, phone, logoUrl, coverUrl, themeColor.
- Kiểm tra trùng slug trước khi lưu.
- Upload logo/cover lên storage.
- Hiển thị thông báo lưu thành công/thất bại.

## 3.4 Menu public cho khách

- Truy vấn store theo slug.
- Truy vấn category theo storeId, sắp xếp order tăng dần.
- Truy vấn products theo storeId.
- Cho khách:
  - Chọn category.
  - Xem danh sách món theo category.
  - Xem chi tiết món trong modal.
- Theme màu theo store.themeColor.

## 3.5 Dữ liệu và collection hiện dùng

### 3.5.1 users

Trường chính:
- uid
- email
- displayName
- role
- createdAt

### 3.5.2 stores

Trường chính:
- id
- name
- bio
- address
- logoUrl
- coverUrl
- slug
- ownerId
- phone
- themeColor
- createdAt
- updatedAt

### 3.5.3 categories

Trường chính:
- id
- name
- order
- storeId
- createdAt

### 3.5.4 products

Trường chính:
- id
- name
- description
- price
- imageUrl
- categoryId
- storeId
- createdAt
- updatedAt

## 4. Yêu cầu backend để adapt với frontend hiện tại

## 4.1 Nguyên tắc tương thích

Backend cần đảm bảo:
- Payload trả về giữ đúng các field frontend đang dùng.
- Response time ổn định cho mobile.
- Có cơ chế auth tương đương Firebase Auth hiện tại.
- Có upload file và trả URL public/secured.
- Có cơ chế realtime hoặc near-realtime cho màn hình quản trị.

## 4.2 Yêu cầu xác thực và phân quyền

### 4.2.1 Auth

Cần hỗ trợ:
- Đăng nhập Google OAuth2.
- Trả access token (JWT) và refresh token.
- API đọc profile user hiện tại.

### 4.2.2 Authorization

Role tối thiểu:
- admin
- user

Ràng buộc:
- User chỉ quản lý dữ liệu thuộc ownerId của mình.
- Public menu được phép đọc không cần đăng nhập.
- Admin có thể quản lý mọi tài nguyên.

## 4.3 API contract đề xuất

## 4.3.1 Auth & User

- POST /api/v1/auth/google
  - Input: idToken từ Google.
  - Output: accessToken, refreshToken, userProfile.
- GET /api/v1/me
  - Output: userProfile.
- POST /api/v1/auth/logout

## 4.3.2 Store

- GET /api/v1/stores
  - Query: ownerOnly=true (mặc định theo user).
- POST /api/v1/stores
- GET /api/v1/stores/{id}
- PATCH /api/v1/stores/{id}
- DELETE /api/v1/stores/{id}
- GET /api/v1/stores/slug/{slug}
  - Dùng cho menu public.

## 4.3.3 Category

- GET /api/v1/stores/{storeId}/categories
  - Sort theo order asc.
- POST /api/v1/stores/{storeId}/categories
- PATCH /api/v1/categories/{categoryId}
- DELETE /api/v1/categories/{categoryId}

## 4.3.4 Product

- GET /api/v1/stores/{storeId}/products
- POST /api/v1/stores/{storeId}/products
- PATCH /api/v1/products/{productId}
- DELETE /api/v1/products/{productId}

## 4.3.5 Public menu aggregate

Nên có API tổng hợp để giảm số request:
- GET /api/v1/public/menus/{slug}
  - Output đề xuất:
    - store
    - categories
    - products

API này giúp thay thế luồng hiện tại đang query 3 nguồn riêng lẻ ở frontend.

## 4.3.6 Upload media

- POST /api/v1/uploads/image
  - Input: multipart/form-data.
  - Output: url, path, mimeType, size.

Có thể bổ sung presigned URL để upload trực tiếp object storage.

### 4.3.7 Upload/download ảnh qua Cloudinary (bắt buộc nếu chọn Cloudinary)

Nếu backend dùng Cloudinary thay Firebase Storage, cần chuẩn hóa rõ 2 luồng:

- Luồng 1 (khuyến nghị): frontend upload qua backend proxy.
  - Frontend gửi file đến backend.
  - Backend kiểm tra quyền + validate file.
  - Backend upload lên Cloudinary bằng API secret (không expose secret cho frontend).
- Luồng 2: frontend upload trực tiếp Cloudinary bằng signed upload.
  - Backend cấp chữ ký ngắn hạn (timestamp + signature).
  - Frontend upload trực tiếp với chữ ký đã cấp.

Contract dữ liệu ảnh nên thống nhất:

- imageUrl: URL delivery để hiển thị.
- imagePublicId: public_id của Cloudinary để quản lý/xóa/biến đổi ảnh.
- imageVersion: version (nếu dùng invalidate cache theo version).
- imageMeta: width, height, format, bytes (tùy chọn).

Endpoint đề xuất khi tích hợp Cloudinary:

- POST /api/v1/media/sign-upload
  - Input: folder, resourceType=image, contentType.
  - Output: cloudName, apiKey, timestamp, signature, folder.
- POST /api/v1/media/upload
  - Dùng cho mô hình backend proxy upload.
- DELETE /api/v1/media/assets/{publicId}
  - Xóa ảnh trên Cloudinary và đồng bộ reference trong DB.

Yêu cầu delivery/download:

- Backend trả URL đã chuẩn hóa transformation cho web/mobile:
  - Thumbnail: dùng cho card/list.
  - Medium: dùng cho modal/detail.
  - Original: chỉ dùng khi thực sự cần.
- Bật tối ưu tự động: f_auto, q_auto (hoặc chiến lược tương đương).
- Nếu cần tải file gốc, backend cung cấp endpoint download có kiểm soát quyền thay vì để public link tràn lan.

## 4.4 Data validation bắt buộc

Backend cần enforce validation tương đương hoặc chặt hơn frontend:

- store.name: bắt buộc, độ dài hợp lệ.
- store.slug: unique, lowercase, không chứa ký tự không hợp lệ.
- category.name: bắt buộc.
- product.name: bắt buộc.
- product.price: number và >= 0.
- Các quan hệ khóa ngoại:
  - category.storeId phải tồn tại.
  - product.storeId phải tồn tại.
  - product.categoryId phải thuộc đúng store.

## 4.5 Realtime hoặc đồng bộ dữ liệu

Frontend hiện sử dụng onSnapshot ở nhiều màn hình.
Để trải nghiệm không đổi, backend nên có một trong các cơ chế:

- WebSocket channel theo storeId.
- Server-Sent Events cho danh sách categories/products.
- Nếu chưa có realtime: frontend fallback polling ngắn hạn (5-15 giây).

Khuyến nghị:
- Giai đoạn 1: dùng polling.
- Giai đoạn 2: nâng cấp WebSocket.

## 4.6 Yêu cầu hiệu năng

- P95 cho API đọc menu public <= 500ms.
- P95 cho API dashboard list <= 700ms.
- Hỗ trợ phân trang khi số sản phẩm lớn.
- Có cache cho endpoint public theo slug.

## 4.7 Yêu cầu bảo mật

- JWT có thời hạn ngắn + refresh token rotate.
- Rate limit cho endpoint auth và public menu.
- Validate MIME type và kích thước file upload.
- Chặn upload file thực thi.
- Escape/sanitize dữ liệu text trước khi render ở client.

Ràng buộc bảo mật riêng cho Cloudinary:

- Tuyệt đối không để Cloudinary API secret ở frontend.
- Nếu dùng direct upload, bắt buộc signed upload; không dùng unsigned upload cho tenant production.
- Giới hạn thư mục upload theo ownerId/storeId (ví dụ: stores/{ownerId}/{storeId}/...).
- Giới hạn MIME (jpg, png, webp), giới hạn dung lượng, và quét extension bất thường.
- Chỉ cho phép xóa asset khi user sở hữu store liên quan.
- Bật cơ chế chống lạm dụng upload (rate limit + quota theo user/store).

## 4.8 Mapping nhanh từ Firebase sang Backend API

- collection stores -> bảng stores hoặc service stores.
- collection categories -> bảng categories.
- collection products -> bảng products.
- collection users -> bảng users.
- Firebase Storage -> object storage (S3 compatible, GCS, Azure Blob).

Nếu dùng Cloudinary:

- logoUrl/coverUrl/imageUrl có thể là delivery URL từ Cloudinary.
- Bổ sung cột/field lưu cloudinary public_id để backend có thể xóa/cập nhật ảnh đúng asset.
- Khi thay ảnh mới, backend cần policy xóa ảnh cũ (ngay lập tức hoặc qua job dọn rác định kỳ).

Ghi chú tương thích:
- Neu DB vat ly hien tai van la `restaurants`/`restaurant_id`, backend can map:
  - `store.id` <-> `restaurants.id`
  - `category.storeId` <-> `categories.restaurant_id`
  - `product.storeId` <-> `products.restaurant_id`

## 4.9 Danh sách việc backend cần build (checklist)

- [ ] Google OAuth login + token issuance.
- [ ] CRUD users profile cơ bản.
- [ ] CRUD stores, có unique slug.
- [ ] CRUD categories theo store.
- [ ] CRUD products theo store/category.
- [ ] Upload ảnh trả URL.
- [ ] Tích hợp Cloudinary: upload flow (proxy hoặc signed), lưu public_id, xóa ảnh an toàn.
- [ ] Endpoint public menu theo slug.
- [ ] Authorization theo owner/admin.
- [ ] Validation schema và error format thống nhất.
- [ ] Logging, monitoring, rate limiting.
- [ ] Cơ chế sync realtime hoặc polling endpoint.

## 5. Khuyến nghị triển khai để chuyển đổi an toàn

- Bước 1: Giữ UI hiện tại, tạo lớp API service ở frontend để tách dần khỏi Firebase SDK.
- Bước 2: Triển khai backend API song song, bật cờ môi trường để chuyển từng module.
- Bước 3: Chuyển Public Menu trước (ít rủi ro), sau đó chuyển Dashboard quản trị.
- Bước 4: Khi ổn định thì tắt luồng Firebase direct write.

## 6. Ghi chú kỹ thuật quan trọng

- Cần index dữ liệu cho truy vấn:
  - stores(ownerId)
  - stores(slug unique)
  - categories(storeId, order)
  - products(storeId)
  - products(categoryId)
- Trường createdAt/updatedAt nên chuẩn ISO8601 UTC hoặc timestamp thống nhất toàn hệ thống.
- Nên chuẩn hóa error response:
  - code
  - message
  - details

---

Tài liệu này phản ánh trạng thái frontend hiện tại và có thể dùng làm đầu bài cho team backend triển khai API tương thích.
