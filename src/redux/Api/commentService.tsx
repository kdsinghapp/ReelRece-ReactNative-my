import axiosInstance from "./axiosInstance"
export const getCommentsByMovie = async (
  token: string,
  imdb_id: string,
  page: number = 1,
  page_size: number = 20
) => {
  try {
    const res = await axiosInstance.get(`/comments`, {
      headers: {
        Authorization: `Token ${token}`,
      },
      params: {
        imdb_id,
        page,
        page_size,
      },
    });

    return res.data;
  } catch (error) {
     throw error;
  }
};


export const postComment = async (token: string, imdb_id: string, comment: string) => {
  try {
    const response = await axiosInstance.post(
      `/comment`,
      {
        imdb_id: imdb_id,
        comment: comment,
      },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    )
    return response.data
  } catch (error) {
    throw error;
  }
}

export const updateComment = async (token: string, imdb_id: string, comment: string) => {
  try {
    const response = await axiosInstance.put(
      `/comment`,
      { imdb_id, comment },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    )
    return response.data

  } catch (error) {
     throw error;
  };
};

export const deleteComment = async (token: string, imdb_id: string) => {
  try {
    const response = await axiosInstance.delete(`/comment`, {
      headers: {
        Authorization: `Token ${token}`,
      },
      data: {
        imdb_id: imdb_id
      },
    });
    return response.data
  } catch (error) {
    throw error;
  }
}