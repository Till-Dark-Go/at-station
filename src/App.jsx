import Map from './components/Map'
import Navbar from './components/Navbar'
import UserProfile from './components/UserProfile'
import StationInfoLayout from './components/StationInfoLayout'


export default function App() {
  return (
    <div className = "App">
      <Map />
      <Navbar />
      <UserProfile />
      <StationInfoLayout />
    </div>
  )
}