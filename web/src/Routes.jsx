// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route, Set, Private, PrivateSet } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import { useAuth } from './auth'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Route 
        path="/login" 
        page={LoginPage} 
        name="login" 
      />
      
      <PrivateSet unauthenticated="login">
        <Route path="/" page={DashboardPage} name="home" />
        <Route path="/form" page={FormPage} name="form" />
        <Route path="/asset-tracker" page={AssetTrackerPage} name="assetTracker" />
        <Route path="/project-tracker" page={ProjectTrackerPage} name="projectTracker" />
        
        <Set wrap={ScaffoldLayout} title="Bookings" titleTo="bookings" buttonLabel="New Booking" buttonTo="newBooking">
          <Route path="/bookings/new" page={BookingNewBookingPage} name="newBooking" />
          <Route path="/bookings/{id:Int}/edit" page={BookingEditBookingPage} name="editBooking" />
          <Route path="/bookings/{id:Int}" page={BookingBookingPage} name="booking" />
          <Route path="/bookings" page={BookingBookingsPage} name="bookings" />
        </Set>
        
        <Set wrap={ScaffoldLayout} title="Users" titleTo="users" buttonLabel="New User" buttonTo="newUser">
          <Route path="/users/new" page={UserNewUserPage} name="newUser" />
          <Route path="/users/{id:Int}/edit" page={UserEditUserPage} name="editUser" />
          <Route path="/users/{id:Int}" page={UserUserPage} name="user" />
          <Route path="/users" page={UserUsersPage} name="users" />
        </Set>
      </PrivateSet>

      <PrivateSet unauthenticated="login" roles={['ADMIN']}>
        <Route path="/admin-panel" page={AdminPanelPage} name="adminPanel" />
      </PrivateSet>

      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
