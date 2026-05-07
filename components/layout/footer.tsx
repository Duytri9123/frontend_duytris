import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-3 text-base font-bold text-white">EShop</h3>
            <p className="text-sm leading-relaxed">
              Cửa hàng thương mại điện tử uy tín, chất lượng sản phẩm đảm bảo, giao hàng nhanh chóng.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Mua sắm</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">Tất cả sản phẩm</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-white transition-colors">Hàng mới về</Link></li>
              <li><Link href="/products?sort=popular" className="hover:text-white transition-colors">Bán chạy nhất</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Giỏ hàng</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/support" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><Link href="/posts" className="hover:text-white transition-colors">Tin tức</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Theo dõi đơn hàng</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Tài khoản</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Đăng nhập</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Đăng ký</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Hồ sơ</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs">
          © {new Date().getFullYear()} EShop. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
