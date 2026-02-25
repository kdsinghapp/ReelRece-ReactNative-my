 import axiosInstance from "@redux/Api/axiosInstance";
 import { User, PaginatedResponse } from "@types/api.types";

export const followUser = async (token: string, username: string) => {
 
    try {
        const res = await axiosInstance.post(
            '/follow',
            { username },
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );
         return res.data;
    } catch (error) {
         throw error;
    }
};

export const unfollowUser = async (token: string, username: string) => {
     try {
        const res = await axiosInstance.delete(
            '/follow',
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
                data: { username },
            }
        );
        return res.data;
    } catch (error) {
         throw error;
    }
};

// export const getFollowers = async (token: string, username?: string) => {
//     try {
//         const url = username ? `/followers?username=${username}` : `/followers`;
//         const res = await axiosInstance.get(url, {
//             headers: {
//                 Authorization: `Token ${token}`,
//             },
//         });
 
//         return res.data;
//     } catch (error) {
 //         throw error;
//     }
// };


// export const getFollowing = async (token: string, username?: string ,  query: string = '') => {
//     try {
//         const url = username ? `/following?username=${username}` : `/following`;
//         const res = await axiosInstance.get(url, {
//             headers: {
//                 Authorization: `Token ${token}`,
//             },
//         });
 //         return res.data;
//     } catch (error) {
 //         throw error;
//     }
// };

export const getFollowing = async (
  token: string,
  query: string = '',
  page: number = 1,
  pageSize: number = 15,
  username?: string
): Promise<PaginatedResponse<User>> => {
  try {
    const params = new URLSearchParams();
    if (username?.trim()) params.append('username', username.trim());
    if (query.trim()) params.append('query', query.trim());
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    const url = `/following?${params.toString()}`;

    const res = await axiosInstance.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};






export const getFollowers = async (
  token: string,
  query: string = '',
  page: number = 1,
  pageSize: number = 15,
  username?: string
): Promise<PaginatedResponse<User>> => {
  try {
    const params = new URLSearchParams();
    if (username?.trim()) params.append('username', username.trim());
    if (query.trim()) params.append('query', query.trim());
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    const url = `/followers?${params.toString()}`;

    const res = await axiosInstance.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};


export const getSuggestedFriends = async (
  token: string,
  query: string = '',
  page: number = 1,
  pageSize: number = 15
): Promise<PaginatedResponse<User>> => {
  try {
    const params = new URLSearchParams();
    if (query.trim()) params.append('query', query.trim());
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    const endpoint = `/suggest-friends?${params.toString()}`;

    const response = await axiosInstance.get(endpoint, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw error;
  }
};