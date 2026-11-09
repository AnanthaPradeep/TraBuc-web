import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { ForgotPasswordPage, ResetPasswordPage, SignInPage, SignUpPage } from './features/auth/AuthPages'
import { TripsProvider } from './features/trips/TripsContext'
import { DestinationsProvider } from './features/destinations/DestinationsContext'
import { TripDetailPage, TripsPage } from './features/trips/TripsPage'
import { DiscoverPage } from './features/destinations/DiscoverPage'
import { DestinationDetailPage } from './features/destinations/DestinationDetailPage'
import { BookingDetailPage, BookingsPage, MyBookingsPage } from './features/bookings/BookingPages'
import { ToolsPage } from './features/tools/ToolsPage'
import { MemoriesPage, StoriesPage, StoryDetailPage } from './features/stories/StoryPages'
import { HomePage } from './features/site/HomePage'
import { AboutPage, HelpPage, NotFoundPage } from './features/site/StaticPages'
import { AccountPage } from './features/site/AccountPage'
import { PublicLayout } from './layouts/PublicLayout'
import { AccountLayout } from './layouts/AccountLayout'
import { ScrollToTop } from './components/ScrollToTop'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="discover/:slug" element={<DestinationDetailPage />} />
        <Route path="trip-planner" element={<TripsPage />} />
        <Route path="trip-planner/:id" element={<TripDetailPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="stories" element={<StoriesPage />} />
        <Route path="stories/:slug" element={<StoryDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="sign-in" element={<SignInPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="account" element={<ProtectedRoute />}>
        <Route element={<AccountLayout />}>
          <Route index element={<AccountPage />} />
          <Route path="trips" element={<TripsPage account />} />
          <Route path="trips/:id" element={<TripDetailPage account />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="memories" element={<MemoriesPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <DestinationsProvider>
          <TripsProvider>
            <AppRoutes />
          </TripsProvider>
        </DestinationsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
