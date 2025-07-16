// src/Routes.js
import { Router, Route, Private, Set, Redirect } from '@redwoodjs/router'
import { useAuth } from 'src/auth'

// Layouts
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'



const Routes = () => {
  return (
    <Router useAuth={useAuth}>

      {/** Public Routes */}
      <Route path="/login"          page={LoginPage}          name="login" />
      <Route path="/signup"         page={SignupPage}         name="signup" />
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
      <Route path="/reset-password"  page={ResetPasswordPage}  name="resetPassword" />
      <Route path="/auth-redirect"   page={AuthRedirectPage}   name="authRedirect" />

      <Route path="/form"        page={FormPage}       name="form" />
      <Route path="/admin-panel" page={AdminPanelPage} name="adminPanel" />

      {/** Scaffolded Sections */}
      <Set wrap={ScaffoldLayout} title="Bookings" titleTo="bookings" buttonLabel="New Booking" buttonTo="newBooking">
        <Route path="/bookings/new"           page={BookingNewBookingPage}  name="newBooking" />
        <Route path="/bookings/{id:Int}/edit" page={BookingEditBookingPage} name="editBooking" />
        <Route path="/bookings/{id:Int}"      page={BookingBookingPage}     name="booking" />
        <Route path="/bookings"               page={BookingBookingsPage}    name="bookings" />
      </Set>

      <Set wrap={ScaffoldLayout} title="Users" titleTo="users" buttonLabel="New User" buttonTo="newUser">
        <Route path="/users/new"           page={UserNewUserPage}  name="newUser" />
        <Route path="/users/{id:Int}/edit" page={UserEditUserPage} name="editUser" />
        <Route path="/users/{id:Int}"      page={UserUserPage}     name="user" />
        <Route path="/users"               page={UserUsersPage}    name="users" />
      </Set>

      {/** Protected Routes: only visible when logged in */}
      <Private unauthenticated="login">
        <Route path="/" page={DashboardPage} name="home" />
      </Private>

      {/** 404 */}
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
