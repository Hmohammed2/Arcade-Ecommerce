import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Reset Password
        </h1>
        <p className="text-gray-500 mb-6">
          Enter your new password below to reset your account.
        </p>
        <ResetPasswordClient />
      </div>
    </main>
  );
}
