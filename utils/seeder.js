require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');

// Sample users data
const sampleUsers = [
  {
    name: 'Alice Smith',
    username: 'alice',
    email: 'alice@example.com',
    password: 'password123',
    bio: 'Software engineer and tech enthusiast. I love JavaScript and building web apps!',
    profilePicture: '/uploads/profiles/default.png'
  },
  {
    name: 'Bob Johnson',
    username: 'bob',
    email: 'bob@example.com',
    password: 'password123',
    bio: 'Coffee lover, photographer, and world traveler. Capturing moments daily. ☕📸',
    profilePicture: '/uploads/profiles/default.png'
  },
  {
    name: 'Charlie Brown',
    username: 'charlie',
    email: 'charlie@example.com',
    password: 'password123',
    bio: 'Musician and guitarist. Playing tunes and making vibes. 🎸🎶',
    profilePicture: '/uploads/profiles/default.png'
  },
  {
    name: 'Diana Prince',
    username: 'diana',
    email: 'diana@example.com',
    password: 'password123',
    bio: 'Fitness coach & healthy lifestyle promoter. Never give up on your dreams! 💪🥗',
    profilePicture: '/uploads/profiles/default.png'
  },
  {
    name: 'Ethan Hunt',
    username: 'ethan',
    email: 'ethan@example.com',
    password: 'password123',
    bio: 'Adrenaline junkie, extreme sports fan. Live life on the edge!',
    profilePicture: '/uploads/profiles/default.png'
  }
];

// Sample posts content
const postTemplates = [
  {
    caption: 'Hello ShareVerse! Excited to join this new social platform. Let us build something awesome! 🚀 #coding',
    mediaType: 'text',
    mediaUrl: ''
  },
  {
    caption: 'My morning routine starting with a fresh cup of coffee. What is your go-to beverage? ☕ #coffee #morning',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
  },
  {
    caption: 'Check out this stunning view from my hike last weekend. Nature never ceases to amaze me! 🏔️✨ #nature #hiking',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80'
  },
  {
    caption: 'Working on a new guitar solo today. Music is the universal language of mankind. 🎸 #guitar #music',
    mediaType: 'text',
    mediaUrl: ''
  },
  {
    caption: 'Checkout this cool developer setup. Keep it clean, keep it simple. 💻⌨️ #setup #workspace',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80'
  },
  {
    caption: 'Leg day workout completed! Consistency is key to achieving your fitness goals. 💪🔥 #fitness #workout',
    mediaType: 'text',
    mediaUrl: ''
  },
  {
    caption: 'Just look at this beautiful sunset. Life is full of beautiful moments if we take time to see them. 🌅 #sunset #peace',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1472214222541-d510753a4907?w=800&auto=format&fit=crop&q=80'
  },
  {
    caption: 'A quick video showing beautiful fire flames. Check it out! 🔥 #fire #video',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    caption: 'Always learning, always growing. Currently reading a great book on design systems.',
    mediaType: 'text',
    mediaUrl: ''
  },
  {
    caption: 'Exploring city life. The lights, the noise, the energy! 🌃🏙️ #city #travel',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=80'
  },
  {
    caption: 'Cooked a delicious healthy meal today. Fueling my body right. 🥗🥑 #healthyfood #cooking',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80'
  },
  {
    caption: 'Time for a movie night! What are your top recommendations for action movies? 🍿🎥 #movienight #fun',
    mediaType: 'text',
    mediaUrl: ''
  },
  {
    caption: 'A lovely clip showing bunny animated scenes. Very nostalgic! 🐰 #animation #cartoon',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    caption: 'Writing clean code is like writing good poetry. It takes time, thought, and patience. 💻📜 #programming #craft',
    mediaType: 'text',
    mediaUrl: ''
  },
  {
    caption: 'Another beautiful day, another chance to improve. Make today count! ✨ #motivation #positivity',
    mediaType: 'text',
    mediaUrl: ''
  }
];

// Sample comments text list
const commentTexts = [
  'Awesome post! Keep it up. 🚀',
  'Totally agree with this! 💯',
  'This looks absolutely amazing!',
  'Wow, thanks for sharing this.',
  'Super cool! which setup/tool is this?',
  'This is so inspiring, thanks!',
  'Love this! ❤️',
  'Can you share more details about it?',
  'Great vibes here! ✨',
  'This made my day! 😊',
  'Nice! I need to try this too.',
  'Incredible shot!',
  'Beautiful! Where is this located?',
  'Indeed! Consistency is everything.',
  'Super nice video! Thanks for uploading.',
  'Haha that is so cute! 🐰',
  'So true. Code readability is underrated.',
  'Keep up the great work!',
  'Beautifully written!',
  'Outstanding! 🌟'
];

const seedDB = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shareverse');
    console.log('Database connected successfully.');

    // 2. Clear existing collections
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Follow.deleteMany({});
    console.log('Collections cleared.');

    // 3. Create Users (triggers save pre-hook password hashing)
    console.log('Creating sample users...');
    const users = [];
    for (const u of sampleUsers) {
      const user = await User.create(u);
      users.push(user);
    }
    console.log(`Created ${users.length} users.`);

    // 4. Create Posts
    console.log('Creating sample posts...');
    const posts = [];
    for (let i = 0; i < postTemplates.length; i++) {
      const template = postTemplates[i];
      // Distribute posts across our 5 users
      const author = users[i % users.length];
      const post = await Post.create({
        user: author._id,
        caption: template.caption,
        mediaType: template.mediaType,
        mediaUrl: template.mediaUrl,
        likes: [] // will populate next
      });
      posts.push(post);
    }
    console.log(`Created ${posts.length} posts.`);

    // 5. Add Random Likes
    console.log('Adding random likes...');
    for (const post of posts) {
      // Pick random number of likes (between 1 and 4)
      const numLikes = Math.floor(Math.random() * 4) + 1;
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      const likers = shuffledUsers.slice(0, numLikes);
      
      post.likes = likers.map(u => u._id);
      await post.save();
    }
    console.log('Likes added to posts.');

    // 6. Create Comments
    console.log('Creating sample comments...');
    for (let i = 0; i < 20; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      const randomText = commentTexts[i % commentTexts.length];

      await Comment.create({
        user: randomUser._id,
        post: randomPost._id,
        text: randomText
      });
    }
    console.log('Created 20 comments.');

    // 7. Create Follow Relationships
    console.log('Creating follow relationships...');
    // Seed standard follow rules:
    // Alice follows Bob, Charlie, Diana
    // Bob follows Alice, Diana
    // Charlie follows Alice
    // Diana follows Alice, Bob, Charlie, Ethan
    // Ethan follows Alice, Bob
    const follows = [
      { follower: users[0], following: users[1] }, // Alice -> Bob
      { follower: users[0], following: users[2] }, // Alice -> Charlie
      { follower: users[0], following: users[3] }, // Alice -> Diana
      { follower: users[1], following: users[0] }, // Bob -> Alice
      { follower: users[1], following: users[3] }, // Bob -> Diana
      { follower: users[2], following: users[0] }, // Charlie -> Alice
      { follower: users[3], following: users[0] }, // Diana -> Alice
      { follower: users[3], following: users[1] }, // Diana -> Bob
      { follower: users[3], following: users[2] }, // Diana -> Charlie
      { follower: users[3], following: users[4] }, // Diana -> Ethan
      { follower: users[4], following: users[0] }, // Ethan -> Alice
      { follower: users[4], following: users[1] }  // Ethan -> Bob
    ];

    for (const f of follows) {
      await Follow.create({
        follower: f.follower._id,
        following: f.following._id
      });
    }
    console.log('Follow relationships created.');

    console.log('Database seeding completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
