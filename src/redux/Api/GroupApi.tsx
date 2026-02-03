 import axiosInstance from '@redux/Api/axiosInstance';
import { User, Group, Movie, PaginatedResponse, Activity } from '@types/api.types';
import { 
  validatePage, 
  validatePageSize, 
  validateSearchQuery,
  createSafeParams,
  throwValidationError 
} from '@utils/apiInputValidator';



// selectfriend
export const getAllFriends = async (token: string, page = 1, page_size = 20): Promise<PaginatedResponse<User>> => {
  try {
    // Validate inputs
    const pageValidation = validatePage(page);
    const pageSizeValidation = validatePageSize(page_size);
    
    if (!pageValidation.isValid) {
     }
    if (!pageSizeValidation.isValid) {
     }

    const response = await axiosInstance.get('/group/friends', {
      headers: { Authorization: `Token ${token}` },
      params: createSafeParams({ 
        page: pageValidation.value, 
        page_size: pageSizeValidation.value 
      }),
    });
     
    return response.data; // { results: [...], next: '...', previous: '...', count: n }
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};


/// 🔹 2. Search Friends (for group search input)
export const searchFriends = async (token: string, query: string, page = 1, page_size = 20): Promise<PaginatedResponse<User>> => {
  try {
    // Validate inputs
    const queryValidation = validateSearchQuery(query);
    const pageValidation = validatePage(page);
    const pageSizeValidation = validatePageSize(page_size);
    
    if (!queryValidation.isValid) {
      throwValidationError('Search query', queryValidation.error);
    }

    const response = await axiosInstance.get('/group/search-friends', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams({ 
        query: queryValidation.sanitized, 
        page: pageValidation.value, 
        page_size: pageSizeValidation.value 
      }),
    });
     return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};




export const createGroup = async (
  token: string,
  groupName: string,
  members: string[]
): Promise<{ data: Group }> => {
  try {
    const response = await axiosInstance.post(
      '/group/create',
      {
        group_name: groupName,
        members: members,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
     return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};
// need_Change
/// 🔹 4. Get Group Members
export const getGroupMembers = async (token: string, groupId: string): Promise<{ members: User[]; count: number }> => {
  try {
    // Validate group ID
    const { validateGroupId } = await import('../../utils/apiInputValidator');
    const groupIdValidation = validateGroupId(groupId);
    
    if (!groupIdValidation.isValid) {
      throwValidationError('Group ID', groupIdValidation.error);
    }

    const response = await axiosInstance.get('/group/members', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams({ group_id: groupIdValidation.sanitized }),
    });
     return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};


/// 🔹 5. List My Groups
export const getAllGroups = async (token: string) => {
  try {
    const response = await axiosInstance.get('/group/list-groups', {
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


/// 🔹 6. Add Members to a Group
export const addMembersToGroup = async (
  token: string,
  groupId: string,
  addmembers: string[]
) => {
  try {
    const response = await axiosInstance.post(
      '/group/add-members',
      {
        group_id: groupId,
        members: addmembers,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
     return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};


export const recordPreference = async (
  token: string,
  groupId: string,
  imdbId: string,
  preference: "like" | "dislike"
) => {
  try {
    const response = await axiosInstance.post(
      '/group/record-preference',
      {
        group_id: groupId,
        imdb_id: imdbId,
        preference: preference,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};

// 8. Leave Group
export const leaveGroup = async (token: string, groupId: string) => {
  try {
 
    const response = await axiosInstance.delete('/group/leave', {
       data: {
        group_id: groupId,
      },
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


// 9.1 All Activities in Group
export const getGroupActivities = async (token: string, groupId: string) => {
 
  try {
    // Validate group ID
    const { validateGroupId } = await import('../../utils/apiInputValidator');
    const groupIdValidation = validateGroupId(groupId);
    
    if (!groupIdValidation.isValid) {
      throwValidationError('Group ID', groupIdValidation.error);
    }

    const response = await axiosInstance.get('/group/activities', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams({ group_id: groupIdValidation.sanitized }),
    });
     return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};


// 9.2 Activities for Specific Movie
export const getGroupActivitiesByMovie = async (
  token: string,
  groupId: string,
  imdbId: string
) => {
  try {
    // Validate inputs
    const { validateGroupId, validateImdbId } = await import('../../utils/apiInputValidator');
    const groupIdValidation = validateGroupId(groupId);
    const imdbIdValidation = validateImdbId(imdbId);
    
    if (!groupIdValidation.isValid) {
      throwValidationError('Group ID', groupIdValidation.error);
    }
    if (!imdbIdValidation.isValid) {
      throwValidationError('IMDB ID', imdbIdValidation.error);
    }

    const response = await axiosInstance.get('/group/activities', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams({ 
        group_id: groupIdValidation.sanitized,
        imdb_id: imdbIdValidation.sanitized
      }),
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};



// 10.
export const getGroupRecommendedMovies = async (token: string, groupId: string) => {
   try {
    // Validate group ID
    const { validateGroupId } = await import('../../utils/apiInputValidator');
    const groupIdValidation = validateGroupId(groupId);
    
    if (!groupIdValidation.isValid) {
      throwValidationError('Group ID', groupIdValidation.error);
    }

    const response = await axiosInstance.get('/group/recommend-movies', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams({ group_id: groupIdValidation.sanitized }),
    })
     return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};

// 11.
export const getSearchGroup = async (query: string, token: string) => {
  try {
     const response = await axiosInstance.get(`/group/search`, {
      headers: { Authorization: `Token ${token}` },
      params: { query }, // ✅ Axios handles URL encoding
    });
     return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};

// 12.
export const getGroupSearchMovies = async (
  token: string,
  group_id: string,
  query: string
): Promise<Movie[]> => {
  try {
    // Validate inputs
    const { validateGroupId } = await import('../../utils/apiInputValidator');
    const groupIdValidation = validateGroupId(group_id);
    const queryValidation = validateSearchQuery(query);
    
    if (!groupIdValidation.isValid) {
       return [];
    }
    if (!queryValidation.isValid) {
       return [];
    }

    const response = await axiosInstance.get('/group/search-movies', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams({ 
        group_id: groupIdValidation.sanitized,
        query: queryValidation.sanitized
      }),
    });
     return response.data?.results || [];
  } catch (error: unknown) {
    const err = error as { message?: string };
      return [];
  }
};

// 13. Record Preference
export const recordGroupPreference = async (
  token: string,
  groupId: string,
  imdbId: string,
  preference: 'like' | 'dislike'
) => {
   try {
    const response = await axiosInstance.post(
      '/group/record-preference',
      {
        group_id: groupId,
        imdb_id: imdbId,
        preference: preference,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
     return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
     throw error;
  }
};



export const getGroupActivitiesAction = async (
  token: string,
  groupId: string,
  imdbId?: string
): Promise<PaginatedResponse<Activity>> => {
   try {
    // Validate inputs
    const { validateGroupId, validateImdbId } = await import('../../utils/apiInputValidator');
    const groupIdValidation = validateGroupId(groupId);
    
    if (!groupIdValidation.isValid) {
       return { current_page: 1, total_pages: 0, results: [] };
    }

    // Build params object
    const params: Record<string, string> = { group_id: groupIdValidation.sanitized };
    
    if (imdbId) {
      const imdbIdValidation = validateImdbId(imdbId);
      if (imdbIdValidation.isValid) {
        params.imdb_id = imdbIdValidation.sanitized;
      } else {
       }
    }

    const response = await axiosInstance.get('/group/activities', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams(params),
    });
     return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string };
     return { current_page: 1, total_pages: 0, results: [] };
  }
};


 export const getFilteredGroupMovies = async (
  token: string,
  groupId: string,
  n_members?: number,
  members?: string[]) => {
 
  try {
    // Validate inputs
    const { validateGroupId, validateStringArray } = await import('../../utils/apiInputValidator');
    const groupIdValidation = validateGroupId(groupId);
    
    if (!groupIdValidation.isValid) {
       return null;
    }

    // Build params object
    const params: Record<string> = { group_id: groupIdValidation.sanitized };
    
    if (members && members.length > 0) {
      const membersValidation = validateStringArray(members, {
        fieldName: 'Members',
        maxItems: 50,
      });
      if (membersValidation.isValid) {
        params.members = membersValidation.sanitized.join(',');
      } else {
       }
    }
    
    if (n_members !== undefined && n_members !== null) {
      const nMembersValidation = validatePage(n_members); // Use validatePage for positive integers
      if (nMembersValidation.isValid) {
        params.n_members = nMembersValidation.value;
      } else {
       }
    }

    const response = await axiosInstance.get('/group/filter-movies', {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: createSafeParams(params),
    });

 
    return response.data;
  } catch (err) {
     return null;
  }
};


// export const getMoviePlatforms = async ({
//   token,
//   imdb_id,
//   country,
//   watch_type
// }: {
//   token: string;
//   imdb_id: string;
//   country?: string;
//   watch_type?: string;
// }) => {
//   Alert.alert("helo")
 //   imdb_id,
//   country,
//   watch_type , "helo api________ ------------")
//   try {
//     let url = `/platforms?imdb_id=${imdb_id}`;
//     if (watch_type) {
//       url += `${watch_type}`
//     }
//     // if (country) url += `&country=${country}`;
//     // if (watch_type) url += `&watch_type=${watch_type}`;
//     const response = await axiosInstance.get(url, {
//       headers: {
//         Authorization: `Token ${token}`,
//       },
//     });
//     // if (!response.ok) throw new Error('API Error');
//     // const data = await response.json();
 //     return response;
//   } catch (error: unknown) {
 //     return [];
//   }
// };






// export const getMoviePlatforms = async ({
//   token,
//   imdb_id,
//   country,
//   watch_type,
  
// }) => {
//   try {
//     let url = `/platforms?imdb_id=${imdb_id}`;
//     if (country) url += `&country=${country}`;
//     if (watch_type) url += `&watch_type=${watch_type}`;
//  
//     const response = await axiosInstance.get(url, {
//       headers: {
//         Authorization: `Token ${token}`,
//       },
//     });
 //     return response;
//   } catch (error: unknown) {
 //     return [];
//   }
// };


export const getMembersScores =  async (token:string , group_id:string ,imdb_id:string) => {
   
  try {
    // Validate inputs
    const { validateGroupId, validateImdbId } = await import('../../utils/apiInputValidator');
    const groupIdValidation = validateGroupId(group_id);
    const imdbIdValidation = validateImdbId(imdb_id);
    
    if (!groupIdValidation.isValid) {
      throwValidationError('Group ID', groupIdValidation.error);
    }
    if (!imdbIdValidation.isValid) {
      throwValidationError('IMDB ID', imdbIdValidation.error);
    }

    const response = await axiosInstance.get('/group/members-scores', {
      headers: {
        Authorization : `Token ${token}`,
      },
      params: createSafeParams({ 
        group_id: groupIdValidation.sanitized,
        imdb_id: imdbIdValidation.sanitized
      }),
    })
     return response.data
  } catch (error ) {
     throw error
  }
}



export const  renameGroup = async (token:string , group_id:string ,group_name:string)=> {
   try{
    const response = await axiosInstance.put(`/group/rename`, 
      {
        group_id:group_id,
        group_name:group_name,
      },
     { headers:{
        Authorization: `Token ${token}`
      }}
    )
      return response.data
  } catch (error: unknown) {
     throw error;
  }
}

// 47. 


// 49.


// 52. Group Notification On/Off


export const toggleGroupNotification = async (
  token: string,
  groupId: string,
  status: 'on' | 'off'
) => {
  try {
    const response = await axiosInstance.put(
      '/group/notification-settings',
      {
        group_id: groupId,
        notification: status,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
     return response.data;
  } catch (error: unknown) {
     throw error;
  }
};


// No.	Function Name	Description
// 1	getAllFriends	Get friend list for group creation
// 2	searchFriends	Search friends for group
// 3	createGroup	Create a new group
// 4	getGroupMembers	Get members of a group
// 5	listGroups	List all groups
// 6	addMembersToGroup	Add new members to group
// 7	recordPreference	Record like/dislike for a movie in a group
// 8	leaveGroup	Leave a group
// 9.1	getGroupActivities	Get group activities
// 9.2	getGroupActivitiesByMovie	Get activities for specific movie
// 13. 