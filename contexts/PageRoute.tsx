"use client";

import { usePathname, useRouter } from "next/navigation";
import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useState,
} from "react";

type PageRouteType = {
	pageRoute: string;
	setPageRoute: Dispatch<SetStateAction<string>>;
};

const defaultPageRouteState = {
	pageRoute: "/",
	setPageRoute: () => {},
} as PageRouteType;

export const PageRouteContext = createContext<PageRouteType>(
	defaultPageRouteState,
);

export const PageRouteProvider = ({ children }: { children: ReactNode }) => {
	let currentRoute: string = usePathname();
	const [pageRoute, setPageRoute] = useState<string>(currentRoute);
	const defaultState: PageRouteType = {
		pageRoute: pageRoute,
		setPageRoute: setPageRoute,
	};
	return (
		<PageRouteContext.Provider value={defaultState}>
			{children}
		</PageRouteContext.Provider>
	);
};
