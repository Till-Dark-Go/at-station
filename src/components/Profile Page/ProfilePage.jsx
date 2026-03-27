import { useState, useEffect } from "react";
import { auth } from "../../api/firebase";
import clsx from "clsx";

// Custom functions to communicate with users collection and Authentication
import {
	doUpdateProfileUsername,
	doUpdateEmail,
	doUpdatePassword,
	doReauthenticate,
	doSignOut,
	doDeleteAuthAccount,
} from "../../firebase/auth";
import {
	getDisplayName,
	getEmail,
	resetUserData,
	deleteUserDocument,
	updateDisplayName,
	updateEmail,
} from "../../api/users";
import { useAuth } from "../../firebase/AuthContext";

// Popup page
import ConfirmationPopup from "./ConfirmationPopup";
import ErrorSuccessPopup from "./ErrorSucessPopup";
import user_pf_logo from "../../assets/images/user_profile.svg";
import edit_icon from "../../assets/images/edit_icon.svg";
import close_popup_button from "../../assets/images/cross_button.svg";
import "../../assets/styles/profile_page.css";

export default function ProfilePage(props) {
	const { currentUser } = useAuth(); // Provides current logged-in user from AuthContext

	// Cleans messages when new popup is opened
	const clearMessages = () => {
		setError("");
		setSuccess("");
	};

	const [username, setUsername] = useState(""); // Editable username input from users collection
	const [email, setEmail] = useState(""); // Editable email input from users collection

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

			setUsername(name || currentUser.displayName || "");
			setEmail(mail || currentUser.email || "");
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
				if (providerId !== "password") {
					setError(
						"Cannot update email: account managed by " + providerId,
					);
					return;
				}

				await doReauthenticate(data.password);
				await doUpdateProfileUsername(data.newUsername);
				await updateDisplayName(data.newUsername);
				setUsername(data.newUsername);
				setSuccess("Username updated.");
			}

			if (popupType === "username-provider") {
				await doUpdateProfileUsername(data.newUsername);
				await updateDisplayName(data.newUsername);
				setUsername(data.newUsername);
				setSuccess("Username updated.");
			}

			if (popupType === "email") {
				if (providerId !== "password") {
					setError(
						"Cannot update email: account managed by " + providerId,
					);
					return;
				}
				await doReauthenticate(data.password);
				await doUpdateEmail(data.newEmail);

				console.log(auth.currentUser.email);
				await updateEmail(data.newEmail);
				setEmail(data.newEmail);
				setSuccess("Email updated.");
			}

			if (popupType === "password") {
				if (providerId !== "password") {
					setError(
						"Cannot update password: account managed by " +
							providerId,
					);
					return;
				}
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

			if (popupType === "delete-provider") {
				await deleteUserDocument();
				await doDeleteAuthAccount();
			}
		} catch (error) {
			setError(error.message || "Update went wrong."); // if you want to see specific error change to error.message
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="profile-container">
			<div className="profile-window">
				<button
					className="popup-close-button"
					onClick={props.toggleProfilePageWindow}
				>
					<img
						src={close_popup_button}
						alt="Close profile icon"
						role="button"
					/>
				</button>

				<div className="profile-title">
					<div>Your profile</div>
					<img src={user_pf_logo} alt="User profile logo" />
				</div>

				<form id="profile-form" onSubmit={(e) => e.preventDefault()}>
					{/* Username Field */}
					<div
						className="full-field"
						onClick={
							providerId === "password"
								? () => openPopup("username")
								: () => openPopup("username-provider")
						}
						role="button"
					>
						<div className="input-field pf-username">
							<label>Username</label>
							<div>
								{username === "" ? <i>Loading...</i> : username}
							</div>
						</div>

						<div className="edit-icon">
							<img src={edit_icon} alt="Edit username" />
						</div>
					</div>

					{/* Email Field */}
					<div
						className="full-field"
						onClick={
							providerId === "password"
								? () => openPopup("email")
								: null
						}
						role="button"
					>
						<div className="input-field pf-email">
							<label>Email</label>
							<div>
								{email === "" ? <i>Loading...</i> : email}
							</div>
						</div>

						<div className="edit-icon">
							{providerId === "password" ? (
								<img src={edit_icon} alt="Edit email" />
							) : (
								<></>
							)}
						</div>
					</div>

					{/* Password Field */}
					{providerId === "password" ? (
						<div
							className="full-field"
							onClick={() => openPopup("password")}
							role="button"
						>
							<div className="input-field pf-password">
								<label>Password</label>
								<div>
									{username === "" ? (
										<i>Loading...</i>
									) : (
										"*******"
									)}
								</div>
							</div>
							<div className="edit-icon">
								<img src={edit_icon} alt="Edit password" />
							</div>
						</div>
					) : (
						<span>Signed in using {providerId}</span>
					)}
				</form>

				<div className="profile-logout-btn">
					<button
						onClick={() => openPopup("logout")}
						disabled={isLoading}
					>
						{isLoading ? "Processing" : "Log out"}{" "}
					</button>
				</div>

				<hr />

				<div className="pf-bottom-description">
					<div className="desc-title">Account Reset & Removal</div>
					<div className="desc-text">
						<p>
							<u>Resetting</u> data will remove all your recorded
							progress and collected stamps.
						</p>
						<p>
							<u>Deleting</u> the account will delete it
							permanently.
						</p>
					</div>
				</div>

				<div className="permanent-buttons">
					<button
						onClick={() => openPopup("reset")}
						disabled={isLoading}
					>
						{isLoading ? "Processing" : "Reset account"}
					</button>
					<button
						onClick={() =>
							openPopup(
								providerId === "password"
									? "delete"
									: "delete-provider",
							)
						}
						disabled={isLoading}
					>
						{isLoading ? "Processing" : "Delete account"}
					</button>
				</div>

				{showPopup && (
					<ConfirmationPopup
						type={popupType}
						onConfirm={handlePopupConfirm}
						onCancel={() => setShowPopup(false)}
					/>
				)}

				{error && (
					<ErrorSuccessPopup
						message={error}
						clearMessages={clearMessages}
					/>
				)}
				{success && (
					<ErrorSuccessPopup
						message={success}
						clearMessages={clearMessages}
					/>
				)}
			</div>
		</div>
	);
}
