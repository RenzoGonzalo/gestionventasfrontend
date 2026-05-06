import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import { AuthProvider } from './features/auth/auth.context'
import { queryClient } from './app/queryClient'
import { router } from './app/router'
import { ToastProvider } from './components/ui/toast'

const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </GoogleOAuthProvider>
        ) : (
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        )}
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
)
