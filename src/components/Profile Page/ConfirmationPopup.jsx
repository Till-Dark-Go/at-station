import { useState, useEffect } from "react";

import opened_eye from "../../assets/images/opened_eye.svg";
import closed_eye from "../../assets/images/closed_eye.svg";

export default function ConfirmationPopup({ type, onConfirm, onCancel }) {
	const [password, setPassword] = useState(""); // Always required for reauthentication
	const [newValue, setNewValue] = useState(""); // New username, email, or password

	// Toggle the password"s eye button to show/hide it
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	useEffect(() => {
		setPassword("");
		setNewValue("");
	}, [type]);

	// Determine if password is needed
	const needsPassword =
		type === "username" ||
		type === "email" ||
		type === "password" ||
		type === "delete";
	// Determine if new input field is needed for this action
	const needsNewValue =
		type === "username" ||
		type === "email" ||
		type === "password" ||
		type === "username-provider";

	// Handle confirm click
	const handleConfirmClick = () => {
		const data = {
			password, // always reauthentication
			newPassword: type === "password" ? newValue : undefined,
			newUsername:
				type === "username" || type === "username-provider"
					? newValue
					: undefined,
			newEmail: type === "email" ? newValue : undefined,
		};
		onConfirm(data); // calls Profile.jsx function
		setPassword("");
		setNewValue("");
	};

	// Handle cancel click
	const handleCancelClick = () => {
		setPassword("");
		setNewValue("");
		onCancel(); // calls Profile.jsx function
	};

	return (
		<div className="confirmation-popup">
			<div className="main-container">
				<div className="conf-title">
					{type === "delete" || type === "delete-provider"
						? "Are you sure you want to delete your account? This is permanent."
						: type === "reset"
							? "Are you sure you want to reset your data? This is permanent."
							: type === "logout"
								? "Are you sure you want to log out?"
								: type === "username-provider"
									? "Change your username"
									: "Confirm your changes."}
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleConfirmClick();
					}}
				>
					<div className="inputs-holder">
						{/* Ask for current password */}
						{needsPassword && (
							<div className="entry-area">
								<input
									type={
										showCurrentPassword
											? "text"
											: "password"
									}
									id="password_input"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder=""
									required
								/>
								<label
									for="password_input"
									className="label-line"
								>
									Current password
								</label>
								<div className="show-hide-pass-icon">
									<img
										src={
											showCurrentPassword
												? opened_eye
												: closed_eye
										}
										alt={
											showCurrentPassword
												? "Opened eye icon"
												: "Closed eye icon"
										}
										onClick={() =>
											setShowCurrentPassword(
												!showCurrentPassword,
											)
										}
										role="button"
									/>
								</div>
							</div>
						)}

						{/* Ask for new values */}
						{needsNewValue && (
							<div className="entry-area">
								<input
									className="input-box"
									id="new_value_input"
									type={
										type === "password"
											? showNewPassword
												? "text"
												: "password"
											: "text"
									}
									value={newValue}
									onChange={(e) =>
										setNewValue(e.target.value)
									}
									placeholder=""
									required
								/>
								<label
									for="new_value_input"
									className="label-line"
								>
									{type === "username"
										? "New username"
										: type === "username-provider"
											? "New username"
											: type === "email"
												? "New email"
												: type === "password"
													? "New password"
													: ""}
								</label>
								<div className="show-hide-pass-icon">
									{type === "password" ? (
										<img
											src={
												showNewPassword
													? opened_eye
													: closed_eye
											}
											alt={
												showNewPassword
													? "Opened eye icon"
													: "Closed eye icon"
											}
											onClick={() =>
												setShowNewPassword(
													!showNewPassword,
												)
											}
											role="button"
										/>
									) : (
										""
									)}
								</div>
							</div>
						)}
					</div>
					<div className="popup-buttons">
						<button
							className="cancel-button"
							onClick={handleCancelClick}
						>
							Cancel
						</button>
						<button className="confirm-button">Confirm</button>
					</div>
				</form>
			</div>
		</div>
	);
}
