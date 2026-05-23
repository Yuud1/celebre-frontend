import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { BuilderPublishProvider, useOptionalBuilderPublishHeader } from './contexts/BuilderPublishContext'
import { AuthProvider } from './contexts/AuthContext'
import { HomePage } from './pages/HomePage'
import { BuilderPage } from './pages/BuilderPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { DashboardPage } from './pages/DashboardPage'
import { PublicEventPage } from './pages/PublicEventPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { KycPage } from './pages/KycPage'
import './styles/app.css'
import './styles/auth.css'

function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const isBuilder = pathname.startsWith('/criar') && !pathname.startsWith('/criar-conta')
  const isBuilderMain = pathname === '/criar'
  const isAuth = pathname.startsWith('/login') || pathname.startsWith('/criar-conta') || pathname.startsWith('/verificacao') || pathname.startsWith('/dashboard')
  const publishHeader = useOptionalBuilderPublishHeader()

  if (isAuth) {
    return <>{children}</>
  }

  return (
    <div className="app-shell">
      <header className={'app-header' + (isBuilder ? ' app-header--builder' : '')}>
        <Link to="/" className="app-logo">
          cele<span>bre</span>
        </Link>
        {isBuilderMain ? (
          <button
            type="button"
            className="btn btn-primary app-header__publish"
            disabled={!publishHeader?.canPublish || !publishHeader.publish}
            onClick={() => publishHeader?.publish?.()}
          >
            Publicar
          </button>
        ) : !isBuilder ? (
          <nav className="app-header__nav">
            <Link to="/criar" className="btn btn-secondary">
              Criar evento
            </Link>
            <Link to="/dashboard" className="btn btn-ghost">
              Painel
            </Link>
          </nav>
        ) : null}
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BuilderPublishProvider>
          <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/criar-conta" element={<RegisterPage />} />
            <Route path="/verificacao" element={<KycPage />} />
            <Route path="/criar" element={<BuilderPage />} />
            <Route path="/criar/checkout" element={<CheckoutPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/p/:slug" element={<PublicEventPage />} />
          </Routes>
        </AppLayout>
        </BuilderPublishProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
