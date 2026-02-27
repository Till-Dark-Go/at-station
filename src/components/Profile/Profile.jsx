import { useState, useEffect } from "react";
import { auth } from "../../api/firebase"; 

// Custom functions to communicate with users collection and Authentication 
import { doUpdateProfileUsername, doUpdateEmail, doUpdatePassword, doReauthenticate, doSignOut, doDeleteAuthAccount } from "../../firebase/auth";
import { getDisplayName, getEmail, resetUserData, deleteUserDocument, updateDisplayName, updateEmail } from "../../api/users";
import { useAuth } from "../../firebase/AuthContext";

// Styles and assets
import '../AccountManagement/signup_and_login.css'; // need to be customized 
import './profile.css' // need to be customized 
import editIcon from "../../assets/images/edit.svg";

// Popup page
import ConfirmationPopup from "./ConfirmationPopup";


export default function Profile() {

  // function toggleConfirmation() {
  //   setConfirmation(prev => !prev);
  // }
  // Toggle confirmation popup window
  // const [confirmation, setConfirmation] = useState(false);

  const { currentUser } = useAuth(); // Provides current logged-in user from AuthContext
  
  // Cleans messages when new popup is opened 
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Local states
  const [username, setUsername] = useState("");  // Editable username input from users collection
  const [email, setEmail] = useState("");        // Editable email input from users collection
  // Mechanism to disable button when in process of changing to prevent double clicking
  const [isLoading, setIsLoading] = useState(false);
  // Popups for getting information from user like new password
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null); // chooses which action like delete, reset, email (change), etc.
  // Message on top (popup action failed/succeeded)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
 
  // Detect provider type (eg. "password", "google.com", "github.com"), we can chnge password and email only with "password"
  const providerId = currentUser?.providerData[0]?.providerId || "";

  // Load current user info from users to display in profile
  // users doesn't store password, so it should be dispalyed as "********", nobody should have access to password
  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) return;

      const name = await getDisplayName();
      const mail = await getEmail();

      setUsername(name || "");
      setEmail(mail || "");
    }

    loadUserData();
  }, [currentUser]); //rerender when currectUser changes

  // Helper function oppening popup
  function openPopup(type) {
    setPopupType(type);
    setShowPopup(true);
  }

  // One function handling all actions and calling functions from users firestore and authentication
  // which action depends on popup type
  const handlePopupConfirm = async (data) => {
    // clean old popups and
    setShowPopup(false);
    clearMessages();

    try {
      setIsLoading(true); // loading functionality prevents double clicking

      if (popupType === "username") {
        await doReauthenticate(data.password);
        await doUpdateProfileUsername(data.newUsername);  
        await updateDisplayName(data.newUsername);
        setUsername(data.newUsername); 
        setSuccess("Username updated.");
      }

      if (popupType === "email") {
        if (providerId !== "password") {
          setError("Cannot update email: account managed by " + providerId);
          return;
        }
        await doReauthenticate(data.password);
        await doUpdateEmail(data.newEmail);

        console.log(auth.currentUser.email);
        await updateEmail(data.newEmail);
        setEmail(data.newEmail)
        //wait auth.currentUser.reload();  
        setSuccess("Email updated.");
      }

      if (popupType === "password") {
        await doReauthenticate(data.password);
        await doUpdatePassword(data.newPassword);
        setSuccess("Password changed.");
      }

      if (popupType === "logout") {
        await doSignOut();
        setSuccess("Signed out.");
      }

      if (popupType === "reset") {
        await resetUserData();
        setSuccess("Account data reset.");
      }

      if (popupType === "delete") {
        await doReauthenticate(data.password);
        await deleteUserDocument();
        await doDeleteAuthAccount();
      }
      
    } catch (error) {
      setError(error.message || "Update went wrong."); // if you want to see specific error change to error.message
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="main-block">
      {error && <div className="error-message" role="alert">{error}</div>}
      {success && <div className="success-message" role="alert">{success}</div>}
      <div className="title">Edit Profile</div>

      <form id="profile-form" onSubmit={e => e.preventDefault()}>
        <div className="inputs-holder">

          {/* Username Field */}
          <div className="entry-area">
            <input
              type="text"
              placeholder=""
              value={username}
  
              onChange={e => setUsername(e.target.value)}
            />
            <label className="label-line">Username</label>
          </div>
          <div className="show-hide-edit-icon">
              {/*<button type="button" onClick={() => openPopup("username")}>Save</button>*/}
            <img src={editIcon} alt="Edit username" onClick={() => openPopup("username")} role="button" />
          </div>

          {/* Email Field */}
          <div className="entry-area">
            <input
              type="text"
              placeholder=""
              value={email}
              disabled={providerId !== "password"} // Only editable if provider is password
              onChange={e => setEmail(e.target.value)}
            />
            <label className="label-line">Email</label>
          </div>
          {/*<img src={editIcon} alt="Edit email" onClick={() => setIsEditingEmail(true)} role="button" />
          <button type="button" onClick={() => openPopup("email")}>Save</button>*/}
          <div className="show-hide-edit-icon">
            {providerId === "password" ? (
                <img src={editIcon} alt="Edit email" onClick={() => openPopup("email")} role="button" />
            ) : (
              <span className="oauth-info">Managed by {providerId}</span>
            )}
            </div>

          {/* Password Field */}
          <div className="entry-area">
             <input
              type="password"
              placeholder=""
              value="********"
              disabled={providerId !== "password"} // Only editable if provider is password
              onChange={e => setEmail(e.target.value)}
            /> 
            <label className="label-line">Password</label>
          </div>
          <div className="show-hide-edit-icon">
              {providerId === "password" ? (
                  <img src={editIcon} alt="Edit password" onClick={() => openPopup("password")} role="button" />
              ) : (
                <span className="oauth-info">Managed by {providerId}</span>
              )}
            </div>
        </div>
      </form>

      <div className="buttons-holder">
          <button className="action-button" onClick={() => openPopup("logout")} disabled={isLoading}>{isLoading ? "Processing" : "Log Out"} </button> 
          {/*action button is disabled when loading to prevent double clicks*/}
      </div>

      <div className="enter-via">
        <div className="line" aria-hidden="true" />
        <div className="text">Pernament changes</div>
        <div className="line right" aria-hidden="true" />
      </div>

     <div className="buttons-holder">
        <button className="action-button" onClick={() => openPopup("reset")} disabled={isLoading}>{isLoading ? "Processing" : "Reset"}</button>
        <button className="action-button" onClick={() => openPopup("delete")} disabled={isLoading}>{isLoading ? "Processing" : "Delete"}</button>
      </div>

      {showPopup && (
        <ConfirmationPopup
          type={popupType}
          onConfirm={handlePopupConfirm}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>

    // <div className="profile_div" onClick={toggleConfirmation}>
    //   {confirmation && <ConfirmationPopup />}
    //     <button>Change password</button>
    // </div>
  )
}