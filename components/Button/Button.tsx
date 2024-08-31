"use client";
import "./button.scss";
import React, { FC, ReactNode, useState } from "react";

/**
 * btnType: Specifies the type of the button
 *  - 0: transparent
 *  - 1: normal
 *  - 2: alert
 *  - 3: disabled
 * Action: Specifies the action of the button
 *   -
 */
type ButtonProps = {
	children: ReactNode;
	btnType?: "transparent" | "disabled" | "alert" | "normal";
	size?: string;
	width?: string;
	height?: string;
	className?: string;
} & ({ action: true; onClick: () => void } | { action: false });

const Button: FC<ButtonProps> = (props) => {
	const [clicked, setClicked] = useState<boolean>(false);

	let classes: string = `${
		props.btnType == "disabled"
			? "disabled"
			: props.btnType == "alert"
				? "alert"
				: props.btnType == "transparent"
					? !clicked
						? "transparent"
						: ""
					: "normal"
	} ${props.height?? "h-[65px]"} ${props.width?? "w-[200px]"} button ${clicked ? "clicked" : ""}`;

	return (
		<button
			className={classes}
			onClick={() => {
				// ripple effect
				setClicked(true);
				setTimeout(() => {
					setClicked(false);
				}, 200);
				if (props.action) {
					props.onClick();
				}
			}}
		>
			{props.children}
		</button>
	);
};

export default Button;
