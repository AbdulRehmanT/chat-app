import AuthContextProvider from "@/lib/authContext";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}
