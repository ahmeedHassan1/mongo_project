import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
	title: "MongoDB",
	description: "Complete MongoDB CRUD operations and relationships"
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning>
				{children}
				<Toaster position="top-right" />
			</body>
		</html>
	);
}
