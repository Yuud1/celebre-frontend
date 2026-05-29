import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { BuilderPublishProvider, useOptionalBuilderPublishHeader } from './contexts/BuilderPublishContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { HomePage } from './pages/HomePage'
import { BuilderPage } from './pages/BuilderPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { DashboardPage } from './pages/DashboardPage'
import { PublicEventPage } from './pages/PublicEventPage'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { RegisterPage } from './pages/RegisterPage'
import { KycPage } from './pages/KycPage'
import { AdminWithdrawalsPage } from './pages/AdminWithdrawalsPage'
import { InfoPage } from './pages/InfoPage'
import { AuthLogo } from './components/auth/AuthShared'
import './styles/app.css'
import './styles/auth.css'

function HeaderNavLinks({ user, onNavigate }: { user: ReturnType<typeof useAuth>['user']; onNavigate?: () => void }) {
  const close = onNavigate ?? (() => {})

  if (user) {
    return (
      <>
        <Link to="/criar" className="btn btn-primary app-header__cta" onClick={close}>
          Criar evento
        </Link>
        <Link to="/dashboard" className="btn btn-ghost" onClick={close}>
          Painel
        </Link>
      </>
    )
  }

  return (
    <>
      <Link to="/login" className="btn btn-ghost" onClick={close}>
        Login
      </Link>
      <Link to="/criar" className="btn btn-primary app-header__cta" onClick={close}>
        Criar evento
      </Link>
    </>
  )
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const isBuilder = pathname.startsWith('/criar') && !pathname.startsWith('/criar-conta')
  const isBuilderMain = pathname === '/criar'
  const isAuth = pathname.startsWith('/login') || pathname.startsWith('/esqueci-senha') || pathname.startsWith('/criar-conta') || pathname.startsWith('/verificacao') || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
  const publishHeader = useOptionalBuilderPublishHeader()
  const isPublicEvent = pathname.startsWith('/p/')

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  if (isAuth || isPublicEvent) {
    return <>{children}</>
  }

  return (
    <div className="app-shell">
      <header className={'app-header' + (isBuilder ? ' app-header--builder' : '')}>
        <Link to="/" className="app-logo" onClick={() => setMenuOpen(false)}>
          <AuthLogo size={17} />
          <span className="app-logo__word">
            cele<span>bre</span>
          </span>
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
          <>
            <nav className="app-header__nav app-header__nav--desktop" aria-label="Conta">
              <HeaderNavLinks user={user} />
            </nav>

            <button
              type="button"
              className={'app-header__toggle' + (menuOpen ? ' app-header__toggle--open' : '')}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="app-header-drawer"
              onClick={() => setMenuOpen(open => !open)}
            >
              <span className="app-header__toggle-bar" />
              <span className="app-header__toggle-bar" />
              <span className="app-header__toggle-bar" />
            </button>
          </>
        ) : null}
      </header>
      {!isBuilder && (
        <div
          className={'app-header__mobile' + (menuOpen ? ' app-header__mobile--open' : '')}
          id="app-header-drawer"
          aria-hidden={!menuOpen}
        >
          <button
            type="button"
            className="app-header__backdrop"
            aria-label="Fechar menu"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          />
          <nav className="app-header__drawer" aria-label="Menu">
            <HeaderNavLinks user={user} onNavigate={() => setMenuOpen(false)} />
          </nav>
        </div>
      )}
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
            <Route path="/sobre" element={<InfoPage kind="sobre" />} />
            <Route path="/diretrizes" element={<InfoPage kind="diretrizes" />} />
            <Route path="/politicas" element={<InfoPage kind="politicas" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            <Route path="/criar-conta" element={<RegisterPage />} />
            <Route path="/verificacao" element={<ProtectedRoute><KycPage /></ProtectedRoute>} />
            <Route path="/criar" element={<ProtectedRoute requireKyc><BuilderPage /></ProtectedRoute>} />
            <Route path="/criar/checkout" element={<ProtectedRoute requireKyc><CheckoutPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute requireKyc><DashboardPage /></ProtectedRoute>} />
            <Route path="/p/:slug" element={<PublicEventPage />} />
            <Route path="/admin/saques" element={<AdminRoute><AdminWithdrawalsPage /></AdminRoute>} />
          </Routes>
        </AppLayout>
        </BuilderPublishProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
