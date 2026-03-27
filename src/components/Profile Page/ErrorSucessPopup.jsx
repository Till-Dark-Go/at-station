import close_popup_button from "../../assets/images/cross_button.svg";

export default function ExportSuccessPopup(props) {
	return (
		<div role="alert" className="profile-operation-message">
			<div className="main-container">
				<div>{props.message}</div>
				<div className="popup-close-button">
					<img
						src={close_popup_button}
						alt="Cancel Message"
						onClick={props.clearMessages}
						role="button"
					/>
				</div>
			</div>
		</div>
	);
}
