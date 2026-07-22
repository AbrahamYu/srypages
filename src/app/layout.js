import './globals.css'

export const metadata = {
  title: 'Abraham Yoo | Tech Magazine',
  description: 'Backend Software Engineer Portfolio & Blog',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <header className="header">
          <div className="container header-inner">
            <a href="/" className="logo">
              Ncmaz<span>.</span>
            </a>
            <nav className="nav-links">
              <a href="/" className="nav-link">Home</a>
              <a href="/articles" className="nav-link">Articles</a>
              <a href="/projects" className="nav-link">Projects</a>
              <a href="/about" className="nav-link">About</a>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
