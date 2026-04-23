export function Footer() {
  return (
    <footer className="border-t bg-background py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EShop. All rights reserved.
      </div>
    </footer>
  )
}
