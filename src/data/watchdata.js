import imageIndex from "@assets/imageIndex";

const watchTogetherGroups = [
    {
        groupId: "movieGrp001",
        groupName: "Movie Night Crew",

        groupuser: [
            {
                userId: "john",
                userInterest: {
                    action: true,
                    movieName: "The Dark Night",
                },
                userName: "Amit Trivedi",
                userChat: "Let’s start with The Conjuring?",
                isOnline: false,
                recentMessageTime: "2025-06-04T22:50:00Z",
                userImage: imageIndex.profile,
                userInterest: {
                    action: true,
                    movieName: "The Dark Night",
                    actionTime: "2025-06-05T10:12:00Z",
                },
            },
            {
                userId: "stark",
                userName: "Sneha Sharma",
                userChat: "I’m scared already 😱",
                isOnline: true,
                recentMessageTime: "2025-06-05T10:12:00Z",
                userImage: imageIndex.profile1,
                userInterest: {
                    action: false,
                    movieName: "The Run",
                    actionTime: "2025-06-05T10:12:00Z",
                },
            },
            {
                userId: "cena",
                userName: "Vinod Kumar",
                userChat: "Popcorn ready!",
                isOnline: true,
                recentMessageTime: "2025-06-05T10:15:00Z",
                userImage: imageIndex.profile
            },
            {
                userId: "Rock",
                userName: "Amit Trivedi",
                userChat: "Let’s start with The Conjuring?",
                isOnline: false,
                recentMessageTime: "2025-06-04T22:50:00Z",
                userImage: imageIndex.profile1
            },
            {
                userId: "Aj",
                userName: "Amit Trivedi",
                userChat: "Let’s start with The Conjuring?",
                isOnline: false,
                recentMessageTime: "2025-06-04T22:50:00Z",
                userImage: imageIndex.profile1
            },
        ]
    },
    {
        groupId: "movieGrp002",
        groupName: "Relaxed Viewers",
        groupuser: [
            {
                userId: "rhea",
                userName: "Rhea Kapoor",
                userChat: "Starting with Love Actually?",
                isOnline: false,
                recentMessageTime: "2025-06-05T08:30:00Z",
                userImage: imageIndex.profile2,
                userInterest: {
                    action: true,
                    movieName: "T-Rex",
                    actionTime: "2025-06-05T10:12:00Z",
                },
            },
            {
                userId: "mehta",
                userName: "Rahul Mehta",
                userChat: "Classic pick 😍",
                isOnline: true,
                recentMessageTime: "2025-06-05T08:35:00Z",
                userImage: imageIndex.profile1,
                userInterest: {
                    action: true,
                    movieName: "The Dark Night",
                    actionTime: "2025-06-05T10:12:00Z",
                },
            },
            {
                userId: "roman",
                userName: "Rahul Mehta",
                userChat: "Classic pick 😍",
                isOnline: true,
                recentMessageTime: "2025-06-05T08:35:00Z",
                userImage: imageIndex.profile1,
                userInterest: {
                    action: true,
                    movieName: "Impossible",
                    actionTime: "2025-06-05T10:12:00Z",
                },
            }
        ]
    },
    {
        groupId: "movieGrp003",
        groupName: "Marvel Rewatch",
        groupuser: [
            {
                userId: "mj",
                userName: "Meera Jain",
                userChat: "Iron Man or Captain first?",
                isOnline: false,
                recentMessageTime: "2025-06-05T07:20:00Z",
                userImage: imageIndex.profile2,
                userInterest: {
                    action: false,
                    movieName: "The Rock",
                    actionTime: "2025-06-05T10:12:00Z",
                },
            },
            {
                userId: "hero",
                userName: "Deepak Rao",
                userChat: "Already watching Endgame!",
                isOnline: true,
                recentMessageTime: "2025-06-05T07:25:00Z",
                userImage: imageIndex.profile,
                userInterest: {
                    action: true,
                    movieName: "The Run",
                    actionTime: "2025-06-05T1:12:00Z",
                },
            },
            {
                userId: "cordy",
                userName: "Rao",
                userChat: "Already watching Endgame!",
                isOnline: true,
                recentMessageTime: "2025-06-05T07:25:00Z",
                userImage: imageIndex.profile,
                userInterest: {
                    action: true,
                    movieName: "The Run",
                    actionTime: "2025-06-05T10:12:00Z",
                },
            },
            {
                userId: "hela",
                userName: "Deepak Rao",
                userChat: "Already watching Endgame!",
                isOnline: true,
                recentMessageTime: "2025-06-05T07:25:00Z",
                userImage: imageIndex.profile,
                userInterest: {
                    action: false,
                    movieName: "The Run",
                    actionTime: "2025-06-05T9:12:00Z",
                },
            }
        ]
    },
    {
        groupId: "movieGrp004",
        groupName: "Anime Binge",
        groupuser: [
            {
                userId: "sakura",
                userName: "Priya Nair",
                userChat: "Let’s start with Demon Slayer!",
                isOnline: true,
                recentMessageTime: "2025-06-05T11:40:00Z",
                userImage: imageIndex.profile1,
                userInterest: {
                    action: true,
                    movieName: "The Run",
                    actionTime: "2025-06-05T10:12:00Z",
                },
            },
            {
                userId: "naruto",
                userName: "Rohan Das",
                userChat: "Full power mode on 🔥",
                isOnline: false,
                recentMessageTime: "2025-06-05T11:30:00Z",
                userImage: imageIndex.profile,
                userInterest: {
                    action: true,
                    movieName: "The Run",
                    actionTime: "2025-06-05T10:4:00Z",
                },
            }
        ]
    },
    {
  groupId: "movieGrp004",
  groupName: "Anime Binge",
  groupuser: [
    {
      userId: "sakura",
      userName: "Priya Nair",
      userChat: "Let’s start with Demon Slayer!",
      isOnline: true,
      recentMessageTime: "2025-06-05T11:40:00Z",
      userImage: imageIndex.profile1,
      userInterest: {
        action: true,
        movieName: "The Run",
        actionTime: "2025-06-05T10:12:00Z",
      },
    },
    {
      userId: "naruto",
      userName: "Rohan Das",
      userChat: "Full power mode on 🔥",
      isOnline: false,
      recentMessageTime: "2025-06-05T11:30:00Z",
      userImage: imageIndex.profile,
      userInterest: {
        action: true,
        movieName: "The Run",
        actionTime: "2025-06-05T10:04:00Z", // fixed time format
      },
    },
  ],
},

    {
        groupId: "movieGrp005",
        groupName: "Sci-Fi Watchers",
        groupuser: [
            {
                userId: "neo",
                userName: "Anjali Mehta",
                userChat: "Matrix or Interstellar?",
                isOnline: true,
                recentMessageTime: "2025-06-05T00:10:00Z",
                userImage: imageIndex.profile2,
                userInterest: {
                    action: false,
                    movieName: "The Run",
                    actionTime: "2025-06-05T10:22:00Z",
                },
            },
            {
                userId: "marty",
                userName: "Amit Trivedi",
                userChat: "Time travel always wins 😄",
                isOnline: false,
                recentMessageTime: "2025-06-04T23:00:00Z",
                userImage: imageIndex.profile1,
                userInterest: {
                    action: true,
                    movieName: "The Run",
                    actionTime: "2025-06-05T6:12:00Z",
                },
            }
        ]
    },

    {
        groupId: "movieGrp006",
        groupName: "Popcorn Plz",
        groupuser: [
            {
                userId: "neog",
                userName: "Anjali Mehta",
                userChat: "Matrix or Interstellar?",
                isOnline: true,
                recentMessageTime: "2025-06-05T00:10:00Z",
                userImage: imageIndex.profile1,
                userInterest: {
                    action: false,
                    movieName: "The Run",
                    actionTime: "2025-06-05T11:12:0Z",
                },
            },

        ]
    }
];

export default watchTogetherGroups