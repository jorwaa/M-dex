import './style/Nav.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid, regular, brands } from '@fortawesome/fontawesome-svg-core/import.macro'
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMagnifyingGlass, faGears } from '@fortawesome/free-solid-svg-icons';
function Nav() {
    library.add(faMagnifyingGlass);
    library.add(faGears);

    return (
        <div className="NavBar">
            <div className="HomeDiv">
             <a href="/">
                <img className='Logo' src={require("./../res/logo.png")} alt="Home" />
             </a>
            </div>
            <div className='searchDiv'>
            <form id='searchForm'>
                <input className='searchInp' type='text'></input>
                <button id='searchSubmit' type='submit'>
                <FontAwesomeIcon icon="magnifying-glass" size="2x"/>
                </button>
            </form>
            </div>
            <div className="SettingsDiv">
                <a href="/settings"> 
                <FontAwesomeIcon icon="gears" size='3x' style={{"color": "gray"}}></FontAwesomeIcon>
                </a>
                <a style={{display: "none"}} href="https://www.flaticon.com/free-icons/settings" title="settings icons">Settings icons created by Pixel perfect - Flaticon</a>
            </div>
        </div>
    )
}

export default Nav