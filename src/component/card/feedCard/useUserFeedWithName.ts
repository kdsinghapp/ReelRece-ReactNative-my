// import { useState, useEffect } from "react";
// import { getUserFeed } from '@redux/Api/FeedApi";

// const useUserFeedWithName = (token: string) => {
//   const [feedData, setFeedData] = useState([]);
//   const [page, setPage] = useState(1);            // ✅ current page
//   const [hasMore, setHasMore] = useState(true);   // ✅ aur data bacha hai ya nahi
//   const [loadingFeed, setLoadingFeed] = useState(false);

//   const fetchFeed = async (
//     type: "home" | "profile" | "otherprofile",
//     username?: string,
//     reset: boolean = false   // ✅ reset true → fresh load
//   ) => {
//     if (!token || loadingFeed) return;
//     if (!hasMore && !reset) return;

//     setLoadingFeed(true);
//    // ✅ username required check
//     if (!username) {
 //       return;
//     }
 
//     try {
//       // ✅ page parameter bhejna important hai
//       const res = await getUserFeed(token, type, username, reset ? 1 : page);

//       setFeedData((prev) =>
//         reset ? res.results : [...prev, ...res.results] // ✅ overwrite ya append
//       );

//       if (res.current_page >= res.total_pages) {
//         setHasMore(false);
//       } else {
//         setTimeout(() => {
//         setPage( page + 1); // ✅ next page set karo
          
//         }, 1200);
//       }
//     } catch (err) {
 //     } finally {
//       setLoadingFeed(false);
//     }
//   };
//   // ✅ Initial Load
// //   useEffect(() => {
// //     fetchFeed("profile",, true);
// //   }, [token]);

//   return {
//     feedData,
//     fetchFeed,
//     loadingFeed,
//     hasMore,
//   };
// };

// export default useUserFeedWithName;


// // import { useState } from 'react';
// // import { getUserFeed } from '@redux/Api/FeedApi';

// // const useUserFeed = (token: string) => {
// //   const [feedData, setFeedData] = useState([]);
// //   const [hasMore, setHasMore] = useState(true);
// //   const [loadingFeed, setLoadingFeed] = useState(false);
// //  const [page, setPage] = useState(1);         




// // const fetchFeed = async (
// //   type: "home" | "profile" | "otherprofile",
// //   username?: string,
// //   reset: boolean = false   // agar true hua to feed reset karega
// // ) => {
// //   if (!token || loadingFeed) return;
// //   if (!hasMore && !reset) return;

// //   setLoadingFeed(true);

// //   try {
// //     const res = await getUserFeed(token, type, username, reset ? 1 : page); 
// //     // 👆 API call me page number bhejna hoga (API agar support karti ho)

// //     setFeedData(prev =>
// //       reset ? res.results : [...prev, ...res.results]   // ✅ overwrite ya append
// //     );

// //     if (res.current_page >= res.total_pages) {
// //       setHasMore(false);
// //     } else {
// //       setPage(prev => reset ? 2 : prev + 1);   // ✅ next page ke liye ready
// //     }
// //   } catch (err) {
 // //   } finally {
// //     setLoadingFeed(false);
// //   }
// // };






// //   // const fetchFeed = async (
// //   //   type: "home" | "profile" | "otherprofile",
// //   //   username?: string
// //   // ) => {
// //   //   if (!token || !hasMore || loadingFeed) return;
// //   //   setLoadingFeed(true);
 // //   //   try {
// //   //     // const res = await getUserFeed(token, type, username);
// //   //     const res = await getUserFeed(token,'home', username);
// //   //     setFeedData(res.results);
 
// //   //     if (!res.next) setHasMore(false);
// //   //   } catch (err) {
 // //   //   } finally {
// //   //     setLoadingFeed(false);
// //   //   }
// //   // };

// //   return {
// //     feedData,
// //     fetchFeed,
// //     loadingFeed,
// //     hasMore,
// //   };
// // };

// // export default useUserFeed;




import { getUserFeed } from "@redux/Api/FeedApi";
import { useState, useEffect } from "react";
 
const useUserFeedWithName = (token: string) => {
  const [feedData, setFeedData] = useState<Array<unknown>>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const fetchFeed = async (
    type: "home" | "profile" | "otherprofile",
    username?: string,
    reset: boolean = false
  ) => {
    if (!token || loadingFeed) return;
    if (!username) {
       return;
    }
    if (!hasMore && !reset) return;

    setLoadingFeed(true);

    try {
      const res = await getUserFeed(token, type, username, reset ? 1 : page);
      setFeedData((prev) =>
        reset ? res?.results : [...prev, ...res.results]
      );
      // backend-driven pagination
      if (res.current_page < res.total_pages) {
        setPage(res.current_page + 1);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (err) {
     } finally {
      setLoadingFeed(false);
    }
  };

  return {
    feedData,
    fetchFeed,
    loadingFeed,
    hasMore,
  };
};

export default useUserFeedWithName;
