# Seva Retail POS — Demo

Giao diện POS (điểm bán hàng) tại quầy cho **Seva Retail**, chuyên trang sức. Bản demo dựng bằng **HTML / CSS / JavaScript thuần**, không framework, không backend — mở thẳng `index.html` trên trình duyệt là chạy.

## Tính năng

- **Header 1 tầng compact:** search, tab nhiều giỏ, điểm bán/ca, trạng thái thiết bị (Scanner/Máy in/PAYOO), màn hình khách, user, khóa màn hình.
- **Multi-cart:** mở nhiều giỏ song song, mỗi giỏ có người bán riêng, badge số lượng, trạng thái đồng bộ.
- **Người bán:** mặc định theo nhân viên đăng nhập; đổi người bán qua popover nhỏ.
- **Khách hàng:** tra cứu theo SĐT/mã thành viên, gắn/gỡ/đổi khách, tạo khách nhanh; cảnh báo tài khoản tạm khóa.
- **Chọn biến thể sản phẩm:**
  - Thêm thẳng (1 biến thể).
  - Popover chọn size (1 thuộc tính).
  - Drawer nhiều thuộc tính (chất liệu / màu / size, tự khóa tổ hợp không hợp lệ).
  - Drawer chọn theo serial (từng món thực tế, chứng thư GIA).
  - Quét barcode/SKU/serial → thêm thẳng đúng sản phẩm.
- **Thanh toán:** tiền mặt (tính tiền thừa), QR/chuyển khoản, thẻ PAYOO, kết hợp.
- **Màn hình khách hàng:** cửa sổ riêng (`window.open`) đồng bộ giỏ, QR lớn, màn thành công.
- **Hóa đơn:** xem trước + in bằng `window.print()`.
- **Offline demo:** banner + trạng thái đồng bộ.

## Cách chạy

Mở trực tiếp:

```
mở index.html bằng trình duyệt
```

Hoặc chạy server tĩnh (khuyến nghị, để cửa sổ màn hình khách hoạt động tốt):

```bash
# Python
python3 -m http.server 8000
# rồi mở http://localhost:8000

# hoặc Node
npx serve
```

## Dữ liệu demo

Toàn bộ là mock trong `script.js` (sản phẩm, khách hàng, nhân viên, biến thể, serial). Barcode thử: `893000000001`, `NHA-AUR-12`, `SV001`.

## Cấu trúc

```
.
├── index.html    # khung giao diện
├── styles.css    # light theme (primary #07554B)
└── script.js     # toàn bộ logic + mock data
```

## Ghi chú

- Đây là demo giao diện, chưa nối backend/thanh toán thật.
- Tối ưu cho desktop và tablet ngang (1440×900, 1920×1080).
