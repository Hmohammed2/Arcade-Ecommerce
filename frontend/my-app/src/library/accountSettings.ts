// lib/api/account.ts
export const getAccountInfo = async (accessToken: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/auth/user/`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch user account info");
  return res.json();
};

export const updateAccountInfo = async ({
  accessToken,
  payload,
}: {
  accessToken: string;
  payload: {
    first_name: string;
    last_name: string;
    email: string;
  };
}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/auth/user/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Failed to update account info");
  return res.json();
};

export const changePassword = async ({
  accessToken,
  old_password,
  new_password,
}: {
  accessToken: string;
  old_password: string;
  new_password: string;
}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/auth/password-change/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ old_password, new_password }),
    }
  );

  if (!res.ok) throw new Error("Failed to change password");
  return res.json();
};

// lib/api/account.ts
// (existing imports + functions remain)

export const deleteAccount = async (accessToken: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/auth/user/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (res.status === 204) return true; // success (no content)
  if (!res.ok) throw new Error("Failed to delete account");
  return res.json();
};
