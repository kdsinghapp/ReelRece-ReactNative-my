import imageIndex from "@assets/imageIndex";

 
 export const genres = [
  'Science Fiction',
  'Action',
  'Asian',
  'Comedy',
  'Crime',
  'Documentary',
  'Hollywood',
  'K-Drama',
  'Music',
  'Dance',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
  'Western',
  'Biography',
  'Family',
  'History',
  'Sport',
  'Reality TV',
];
// export const sortByData = [
//   { id: 1, label: "Rec Score" },
//   { id: 2, label: "Release Date" },
//   { id: 3, label: "Alphabetical" },
// ];

export const sortByData = [
  { id: 1, label: "Rec Score", param: null }, // ❌ Don't send anything in API
  { id: 2, label: "Release Date", param: "release_date" },
  { id: 3, label: "Alphabetical", param: "alphabetical" },
];


// export const sortByData = [
//   { id: 1, label: "Rec Score" },
//   { id: 2, label: "release_date" },
//   { id: 3, label: "alphabetical" },
// ];

export const platformsData = [
  { id: '1', name: 'Netflix', icon: imageIndex.google},
  { id: '2', name: 'Disney Plus', icon: imageIndex.google},
  { id: '3', name: 'Amazon Prime Video', icon: imageIndex.amazon},
  { id: '4', name: 'Hulu', icon: imageIndex.google},
  { id: '5', name: 'Paramount Plus', icon: imageIndex.amazon },
  { id: '6', name: 'Fandango At Home', icon: imageIndex.amazon},
  { id: '7', name: 'YouTube Premium', icon: imageIndex.amazon},
  { id: '8', name: 'ABC', icon: imageIndex.amazon},


];

export const filters = [
  { id: '1', title: 'Recs for you',  },
  { id: '2', title: 'Trending' },
  { id: '3', title: 'Genre', img: imageIndex.downDown },
  { id: '4', title: 'Platform', img: imageIndex.downDown },
  { id: '5', title: 'Want to watch' },

];
export const contentType = [
  { id: 1, type: "All" , params : null},
  { id: 2, type: "Movie" , params :"movie" },
  { id: 3, type: "TV" ,params :"tv_series"}
];
export const DATA = [
   
 
  {
    id: '3',
    title: 'Kandahar',
    image: imageIndex.welcomePost1,
    rating: '9.3',
  },
  {
    id: '4',
    title: 'The Little Mermaid',
    image: imageIndex.moviesPoster,
    rating: '5.8',
  },
 
  {
    id: '6',
    title: 'The Little Mermaid',
    image: imageIndex.welcomePost1,
    rating: '3.8',
  },
 
  {
    id: '8',
    title: 'The Little Mermaid',
    image: imageIndex.welcomePost1,
    rating: '9.8',
  },
 
 
];
