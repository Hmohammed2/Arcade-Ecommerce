// hooks/useAccountSettings.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/useAuth";
import {
  getAccountInfo,
  updateAccountInfo,
  changePassword,
  deleteAccount,
} from "@/library/accountSettings";
import { toast } from "react-hot-toast";
import router from "next/router";

export const useAccountSettings = () => {
  const { accessToken, fetchUser } = useAuth();
  const queryClient = useQueryClient();

  // helper to safely extract message from unknown error
  const getErrorMessage = (err: unknown, fallback = "An error occurred") =>
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : JSON.stringify(err) || fallback;

  // ✅ Fetch user info
  const { data: user, isLoading } = useQuery({
    queryKey: ["account-info"],
    queryFn: () => getAccountInfo(accessToken!),
    enabled: !!accessToken,
  });

  // ✅ Update profile info
  const updateMutation = useMutation({
    mutationFn: (payload: {
      first_name: string;
      last_name: string;
      email: string;
    }) => updateAccountInfo({ accessToken: accessToken!, payload }),
    onSuccess: async () => {
      toast.success("Account information updated ✅");
      await fetchUser(); // sync Zustand
      queryClient.invalidateQueries({ queryKey: ["account-info"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to update account info"));
    },
  });

  // ✅ Change password
  const passwordMutation = useMutation({
    mutationFn: (payload: { old_password: string; new_password: string }) =>
      changePassword({ accessToken: accessToken!, ...payload }),
    onSuccess: () => {
      toast.success("Password updated successfully 🔒");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to change password"));
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccount(accessToken!),
    onSuccess: async () => {
      toast.success("Account deleted successfully 🗑️");
      await fetchUser(); // reset user if needed
      queryClient.clear();
      router.push("/register"); // redirect user
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to delete account"));
    },
  });

  return {
    user,
    isLoading,
    updateAccount: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    changePassword: passwordMutation.mutateAsync,
    isChangingPassword: passwordMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeleting: deleteAccountMutation.isPending, // ✅ Added this line
  };
};
