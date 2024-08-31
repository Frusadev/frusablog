"use client";

import React, { FC, useContext } from "react";
import "./sidebar.scss";
import Image from "next/image";
import Button from "../Button/Button";
import { useRouter } from "next/navigation";
import { PageRouteContext } from "@/contexts/PageRoute";

type MenuButton = {
	text: string;
	onClick: () => void;
	active?: boolean;
	route: string;
};

const SideBar: FC = () => {
	const router = useRouter();

	const menuButtons: MenuButton[] = [
		{
			text: "Home",
			onClick: () => {
				setPageRoute("/");
				router.push("/");
			},
			route: "/",
		},
		{
			text: "Recent",
			onClick: () => {
				setPageRoute("/recent");
				router.push("/recent");
			},
			route: "/recent",
		},
		{
			text: "Posts",
			onClick: () => {
				setPageRoute("/posts");
				router.push("/posts");
			},
			route: "/posts",
		},
	];

	const handleLogout = () => {};

	const { pageRoute, setPageRoute } = useContext(PageRouteContext);

	return (
		<div className="h-screen flex flex-col justify-center mb-auto mt-auto">
			<div className="hidden sm:flex sm:w-[20rem] lg:w-[1/4] flex-col justify-between ml-12 h-[90vh] rounded-[2rem] sidebar ">
				{/* Header */}
				<div className="flex items-center">
					<Image src={"/Logo.png"} width={163} height={163} alt="Blog logo" />
					<span className="font-bold text-[24px]">Frusablog</span>
				</div>
				{/* Content */}
				<div className="flex flex-col items-center h-full">
					{menuButtons.map((btn: MenuButton) => {
						return (
							<Button
								btnType={pageRoute === btn.route ? "normal" : "transparent"}
								action={true}
								onClick={btn.onClick}
								className={"menu-btn"}
								width={"w-[250px]"}
							>
								{btn.text}
							</Button>
						);
					})}
				</div>
				{/* Footer */}
				<div className="justify-center items-center flex h-[300px]">
					<Button
						className="logout-menu-btn"
						action={true}
						btnType="transparent"
						onClick={handleLogout}
						width="w-[250px]"
					>
						Logout
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SideBar;
