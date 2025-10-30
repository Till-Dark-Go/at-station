import logo from '../assets/LOGO.svg'
import sound_logo from '../assets/sound_settings.svg'
import todo_logo from '../assets/todo_logo.svg'
import passport_logo from '../assets/passport.svg'


export default function Navbar()
{
    return (
        <div className = 'nav'>
            <div className='app_logo'><img src={logo} alt="App Logo" /></div>
            <div className='nav_items'>
                <ul>
                    <li className='to-do'><img src={todo_logo} alt="To-do List" /></li>
                    <li className='passport'><img src={passport_logo} alt="Visited Stations Passport" /></li>
                    <li className='sound'><img src={sound_logo} alt="Soung Settings" /></li>
                </ul>
            </div>
        </div>
    )
}