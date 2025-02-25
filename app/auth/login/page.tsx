import { AuthForm } from "@/components/auth-form"

export default function LoginPage() {

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AuthForm isSignup={false} />
      </div>
    </div>
  )
}
