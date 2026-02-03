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

export const getFollowing = async (token: string, query: string = '') => {
  try {
    const url = query.trim()
      ? `/following?query=${encodeURIComponent(query.trim())}`
      : `/following`;

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






export const getFollowers = async (token: string, query: string = '') => {
  try {
    const url = query.trim()
      ? `/followers?query=${encodeURIComponent(query.trim())}`
      : `/followers`;

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
  query: string = ''
): Promise<PaginatedResponse<User>> => {
  try {
    const endpoint = query.trim()
      ? `/suggest-friends?query=${encodeURIComponent(query.trim())}`
      : `/suggest-friends`;

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