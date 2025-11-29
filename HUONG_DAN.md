# Hướng Dẫn Chạy Code và Giải Thích Cấu Trúc Dự Án

## 🚀 Cách Chạy Code

### Frontend (React + TypeScript + Vite)

```bash
# Di chuyển vào thư mục frontend
cd motorbike-fe

# Cài đặt dependencies (chỉ cần chạy lần đầu)
npm install

# Chạy ứng dụng ở chế độ development
npm run dev

# Ứng dụng sẽ chạy tại: http://localhost:8456
```

**Các lệnh khác:**
- `npm run build` - Build ứng dụng cho production
- `npm run preview` - Xem preview bản build production
- `npm test` - Chạy tests

### Backend (Spring Boot + Java 21)

```bash
# Di chuyển vào thư mục backend
cd motorbike-be

# Chạy ứng dụng Spring Boot (cần Java 21)
./gradlew bootRun
# Hoặc trên Windows:
gradlew.bat bootRun

# Backend sẽ chạy tại: http://localhost:8345/api
```

**Lưu ý:**
- Cần cài đặt Java 21
- Cần MySQL database đã được cấu hình trong `application.properties`
- Backend sử dụng port 8345, API path là `/api`

---

## 📁 Giải Thích Cấu Trúc Thư Mục `src`

### Frontend (`motorbike-fe/src`)

#### **`app/`** - Quản lý State với Redux
- `store.ts` - Cấu hình Redux store
- `hook.ts` - Custom hooks cho Redux
- `reducer/` - Các reducer quản lý state
  - `business/` - State cho nghiệp vụ
  - `common/` - State chung (auth, common)

#### **`assets/`** - Tài nguyên tĩnh
- `css/` - Các file CSS/SCSS
- `fonts/` - Font chữ (NotoSansKR, Roboto)
- `images/` - Hình ảnh, icons
- `js/` - JavaScript utilities
- `style/` - SCSS variables và styles

#### **`component/`** - Các component tái sử dụng
- `common/` - Component dùng chung (button, input, table, modal, ...)
- `icon/` - Icon components

#### **`constants/`** - Hằng số
- `common.const.ts` - Hằng số chung
- `screen.const.ts` - Hằng số cho màn hình

#### **`layouts/`** - Layout templates
- `DefaultLayout.tsx` - Layout mặc định
- `components/` - Component cho layout (header, sidebar, footer)

#### **`locales/`** - Đa ngôn ngữ (i18n)
- `vi/`, `en/`, `ko/` - File ngôn ngữ cho tiếng Việt, Anh, Hàn

#### **`middleware/`** - Middleware
- `auth.ts` - Middleware xử lý authentication
- `log.ts` - Middleware logging

#### **`model/`** - TypeScript models/interfaces
- `business/` - Models cho nghiệp vụ
- `common/` - Models chung
- `TemplateModel.ts` - Model template

#### **`plugins/`** - Plugins và cấu hình
- `global.tsx` - Cấu hình global
- `i18n.ts` - Cấu hình đa ngôn ngữ

#### **`router/`** - Định tuyến
- `index.tsx` - Router chính
- `router.ts` - Cấu hình routes
- `screen.ts` - Định nghĩa các màn hình

#### **`service/`** - API services
- `business/` - Services cho nghiệp vụ (contract, motorbike, customer, ...)
- `common/` - Services chung (auth, file)

#### **`utils/`** - Tiện ích
- `common.ts` - Hàm tiện ích chung
- `formUtils.ts` - Tiện ích cho form
- `http.ts` - Cấu hình HTTP client (axios)
- `storage.ts` - Quản lý localStorage/sessionStorage
- `token.ts` - Xử lý JWT token

#### **`views/`** - Các trang/màn hình
- `branch/` - Quản lý chi nhánh
- `contract/` - Quản lý hợp đồng
- `customer/` - Quản lý khách hàng
- `dashboard/` - Trang dashboard
- `employee/` - Quản lý nhân viên
- `motorbike/` - Quản lý xe máy
- `motorbikeModel/` - Quản lý model xe máy
- `revenueReport/` - Báo cáo doanh thu
- `carAvailableReport/` - Báo cáo xe có sẵn
- `surcharge/` - Quản lý phụ phí
- `LoginView.tsx` - Trang đăng nhập
- `NotFound.tsx` - Trang 404
- `InternalError.tsx` - Trang lỗi

#### **File quan trọng khác:**
- `App.tsx` - Component gốc của ứng dụng
- `main.tsx` - Entry point của ứng dụng
- `vite-env.d.ts` - Type definitions cho Vite

---

### Backend (`motorbike-be/src/main/java/com/motorbikebe`)

#### **`business/`** - Logic nghiệp vụ
- `admin/` - Quản lý admin
  - `branchMng/` - Quản lý chi nhánh
  - `carMng/` - Quản lý xe máy
  - `contractMng/` - Quản lý hợp đồng
  - `customerMng/` - Quản lý khách hàng
  - `dashboard/` - Dashboard
  - `surchargeTypeMng/` - Quản lý loại phụ phí
  - `userMng/` - Quản lý người dùng
  - Mỗi module có cấu trúc:
    - `web/` - Controller (REST API endpoints)
    - `service/` - Interface service
    - `impl/` - Implementation của service
    - `excel/` - Xử lý Excel (nếu có)

- `common/` - Logic chung
  - `authenticate/` - Xác thực đăng nhập
  - `codeMng/` - Quản lý mã code
  - `fileMng/` - Quản lý file upload
  - `forgotPassword/` - Quên mật khẩu
  - `menu/` - Quản lý menu
  - `singUp/` - Đăng ký

#### **`config/`** - Cấu hình
- `security/` - Cấu hình bảo mật (JWT, OAuth2)
- `cloudinary/` - Cấu hình Cloudinary (upload ảnh)
- `mail/` - Cấu hình email
- `webmvc/` - Cấu hình Web MVC
- `webSocket/` - Cấu hình WebSocket
- `exception/` - Xử lý exception global
- `aop/` - Aspect-Oriented Programming (logging)
- `async/` - Cấu hình async processing
- `job/` - Scheduled jobs (cron jobs)

#### **`constant/`** - Hằng số
- `classconstant/` - Class constants (ActorConstants, CarConstants, ...)
- `enumconstant/` - Enums (CarStatus, ContractStatus, Role, ...)

#### **`dto/`** - Data Transfer Objects
- `business/` - DTOs cho nghiệp vụ
  - `admin/` - DTOs cho admin
- `common/` - DTOs chung (authenticate, user, ...)
- `system/` - DTOs cho hệ thống

#### **`entity/`** - Database entities (JPA)
- `base/` - Base entities (AuditEntity, PrimaryEntity)
- `domain/` - Entities nghiệp vụ
  - `BranchEntity`, `CarEntity`, `ContractEntity`, `CustomerEntity`, `UserEntity`, ...
- `system/` - Entities hệ thống (MenuEntity, RoleEntity, ...)
- `common/` - Entities chung

#### **`repository/`** - Data access layer (Spring Data JPA)
- `business/` - Repositories cho nghiệp vụ
- `common/` - Repositories chung
- `system/` - Repositories hệ thống
- `projection/` - Custom projections cho queries

#### **`util/`** - Tiện ích
- `CloudinaryUtils.java` - Tiện ích upload Cloudinary
- `Utils.java` - Hàm tiện ích chung
- `RandomStringGenerator.java` - Tạo chuỗi ngẫu nhiên
- `GenerateSecretKey.java` - Tạo secret key

#### **`common/`** - Classes chung
- `ApiResponse.java` - Response wrapper
- `ApiStatus.java` - Status codes
- `PageableObject.java` - Phân trang
- `Constants.java` - Constants chung

#### **File quan trọng:**
- `MotorbikeBeApplication.java` - Main class, entry point của ứng dụng Spring Boot

---

## 🔧 Cấu Hình Quan Trọng

### Frontend
- **Port:** 8456 (theo package.json)
- **Build tool:** Vite
- **Framework:** React 18 + TypeScript
- **State management:** Redux Toolkit
- **UI Library:** Ant Design
- **HTTP Client:** Axios

### Backend
- **Port:** 8345
- **API Path:** `/api`
- **Framework:** Spring Boot 3.5.5
- **Java Version:** 21
- **Database:** MySQL
- **Build tool:** Gradle
- **Security:** JWT + OAuth2

---

## 📝 Lưu Ý

1. **Database:** Cần MySQL đã được cấu hình và chạy trước khi start backend
2. **Environment:** Kiểm tra file `application.properties` để cấu hình database, email, cloudinary, ...
3. **CORS:** Backend đã cấu hình CORS cho frontend tại port 8456
4. **Authentication:** Hệ thống sử dụng JWT token cho authentication

