import { Account } from "@/app/types/accounts"
// import { UserData } from "../views/EditUser/EditUser"

export const loginAccount = async (
  name: string,
  password: string,
  userId: number
): Promise<Account> => {
  const res = await fetch('/api/accounts/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, userId }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || 'Ошибка входа в аккаунт')
  }

  return res.json()
}

export const createAccount = async (
  name: string,
  password: string,
  userId: number,
  isFirstAccount: boolean
): Promise<Account> => {
  const role = isFirstAccount ? 'admin' : 'user'

  const res = await fetch('/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, role, userId }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || 'Ошибка создания аккаунта')
  }

  return res.json()
}

export const fetchAccounts = async (userId: number): Promise<Account[]> => {
  const res = await fetch(`/api/accounts?userId=${userId}`)

  if (!res.ok) {
    throw new Error('Ошибка получения списка аккаунтов')
  }

  return res.json()
}


export interface UpdateProfileData {
  id: number;
  name: string;
  email?: string;
  telegram?: string;
  phone?: string;
}

export const updateProfile = async (profileData: UpdateProfileData) => {
  try {
    const response = await fetch('/api/user/edit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

export const uploadAvatar = async (accountId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('accountId', accountId.toString());

    const response = await fetch('/api/user/edit/avatar', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload avatar');
    }

    return await response.json();
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
};

export const deleteAvatar = async (accountId: number) => {
  try {
    const response = await fetch(`/api/user/edit/avatar?accountId=${accountId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete avatar');
    }

    return await response.json();
  } catch (error) {
    console.error('Avatar delete error:', error);
    throw error;
  }
};
