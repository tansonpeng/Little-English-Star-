export type Screen = 'MAP' | 'HUB' | 'LISTEN' | 'READ' | 'PLAY' | 'KARAOKE';

export interface StoryPage {
  text: string;
  chineseText: string;
  imageSeed: string;
  highlight: string;
  nurseryRhyme?: string;
  imageUrl?: string;  // Gemini-generated data URL; overrides picsum when set
}

export interface SongContent {
  lyrics: string[];
  lyricTimestamps?: number[];   // Start time (seconds) for each lyric line in the MP3
  storyPages: StoryPage[];
  game: {
    phonics: string;
    options: { label: string; imgSeed: string; correct: boolean }[];
  };
}

export interface SongNode {
  id: string;
  title: string;
  chineseTitle: string;
  locked: boolean;
  position: { left: string; top?: string; bottom?: string };
  icon: string;
  audioSrc?: string;  // Path to the song's MP3 file (served from public/)
  lrcSrc?: string;    // Path to the .lrc file (served from public/); authoritative for lyrics + timestamps
  content: SongContent;
}

export const SONGS: SongNode[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    chineseTitle: '一闪一闪亮晶晶',
    locked: true,
    position: { left: '20%', bottom: '30%' },
    icon: 'star',
    content: {
      lyrics: [
        "Twinkle, twinkle, little star,",
        "How I wonder what you are!",
        "Up above the world so high,",
        "Like a diamond in the sky."
      ],
      storyPages: [
        {
          text: "Look! A little star is winking at Leo!",
          chineseText: "你看！一颗小星星在对里奥眨眼睛！",
          imageSeed: "boy-grass-night-sky",
          highlight: "Star",
          nurseryRhyme: "Twinkle, twinkle, little star,"
        },
        {
          text: "What are you, little star? Leo wants to know!",
          chineseText: "你是什么呀，小星星？里奥好想知道！",
          imageSeed: "boy-pointing-wonder-sky",
          highlight: "Wonder",
          nurseryRhyme: "How I wonder what you are!"
        },
        {
          text: "The star lives way up high. Higher than the birds!",
          chineseText: "星星住在好高好高的天上。比小鸟还要高！",
          imageSeed: "star-above-clouds-mountain",
          highlight: "High",
          nurseryRhyme: "Up above the world so high,"
        },
        {
          text: "The star shines like a diamond. So bright and pretty!",
          chineseText: "星星像钻石一样闪亮。好漂亮啊！",
          imageSeed: "diamond-sparkle-night-sky",
          highlight: "Diamond",
          nurseryRhyme: "Like a diamond in the sky."
        }
      ],
      game: {
        phonics: "St",
        options: [
          { label: "SUN", imgSeed: "sun", correct: false },
          { label: "STAR", imgSeed: "star", correct: true },
          { label: "MOON", imgSeed: "moon", correct: false }
        ]
      }
    }
  },
  {
    id: 'macdonald',
    title: 'Old MacDonald',
    chineseTitle: '王老先生有块地',
    locked: true,
    position: { left: '38%', top: '15%' },
    icon: 'pets',
    content: {
      lyrics: [
        "Old MacDonald had a farm, E-I-E-I-O!",
        "And on that farm he had a cow, E-I-E-I-O!",
        "With a moo-moo here, and a moo-moo there,",
        "Here a moo, there a moo, everywhere a moo-moo!"
      ],
      storyPages: [
        {
          text: "Old MacDonald had a farm.",
          chineseText: "王老先生有一块地。",
          imageSeed: "farm-cow",
          highlight: "Farm"
        }
      ],
      game: {
        phonics: "F",
        options: [
          { label: "FISH", imgSeed: "fish", correct: false },
          { label: "FARM", imgSeed: "farm", correct: true },
          { label: "FOX", imgSeed: "fox", correct: false }
        ]
      }
    }
  },
  {
    id: 'sheep',
    title: 'Baa Baa Black Sheep',
    chineseTitle: '咩咩黑羊',
    locked: true,
    position: { left: '65%', top: '15%' },
    icon: 'sheep',
    content: {
      lyrics: [
        "Baa, baa, black sheep, have you any wool?",
        "Yes sir, yes sir, three bags full!",
        "One for the master, one for the dame,",
        "And one for the little boy who lives down the lane."
      ],
      storyPages: [
        {
          text: "Baa, baa, black sheep.",
          chineseText: "咩咩黑羊。",
          imageSeed: "sheep-wool",
          highlight: "Sheep"
        }
      ],
      game: {
        phonics: "Sh",
        options: [
          { label: "SHIP", imgSeed: "ship", correct: false },
          { label: "SHEEP", imgSeed: "sheep", correct: true },
          { label: "SHOE", imgSeed: "shoe", correct: false }
        ]
      }
    }
  },
  {
    id: 'bus',
    title: 'Wheels on the Bus',
    chineseTitle: '巴士轮子转呀转',
    locked: true,
    position: { left: '85%', bottom: '15%' },
    icon: 'bus',
    content: {
      lyrics: [
        "The wheels on the bus go round and round,",
        "Round and round, round and round.",
        "The wheels on the bus go round and round,",
        "All through the town."
      ],
      storyPages: [
        {
          text: "The wheels on the bus go round.",
          chineseText: "巴士轮子转呀转。",
          imageSeed: "bus-wheels",
          highlight: "Bus"
        }
      ],
      game: {
        phonics: "B",
        options: [
          { label: "BALL", imgSeed: "ball", correct: false },
          { label: "BUS", imgSeed: "bus", correct: true },
          { label: "BEE", imgSeed: "bee", correct: false }
        ]
      }
    }
  },
  {
    id: 'boat',
    title: 'Row Row Row Your Boat',
    chineseTitle: '划划划你的船',
    locked: false,
    position: { left: '5%', bottom: '15%' },
    icon: 'boat',
    audioSrc: '/Little-English-Star-/audio/row-row-row-your-boat.mp3',
    lrcSrc: '/Little-English-Star-/audio/row-row-row-your-boat.lrc',
    content: {
      // Lyrics kept as fallback (e.g. for karaoke); authoritative data comes from lrcSrc at runtime
      lyrics: [
        "Row, row, row your boat",
        "Gently down the stream",
        "Merrily, merrily, merrily, merrily",
        "Life is but a dream",
        "Row, row, row your boat",
        "Gently down the brook",
        "If you see a crocodile",
        "Don't forget to shout!",
      ],
      storyPages: [
        {
          text: "Row, row, row your boat, gently down the stream.",
          chineseText: "划呀划，划你的小船，轻轻顺着小溪流。",
          imageSeed: "boy-rowing-boat-river",
          imageUrl: "/Little-English-Star-/images/row-row-row-your-boat-1.png",
          highlight: "Row",
          nurseryRhyme: "Row, row, row your boat",
        },
        {
          text: "Merrily, merrily, merrily, merrily — life is but a dream!",
          chineseText: "快乐地，快乐地，快乐地，快乐地——生命如梦一场！",
          imageSeed: "happy-boy-singing-boat",
          imageUrl: "/Little-English-Star-/images/row-row-row-your-boat-2.png",
          highlight: "Dream",
          nurseryRhyme: "Life is but a dream",
        },
        {
          text: "Row, row, row your boat, gently down the brook.",
          chineseText: "划呀划，划你的小船，轻轻顺着小河流。",
          imageSeed: "boat-gentle-stream-nature",
          imageUrl: "/Little-English-Star-/images/row-row-row-your-boat-3.png",
          highlight: "Brook",
          nurseryRhyme: "Gently down the brook",
        },
        {
          text: "If you see a crocodile, don't forget to shout!",
          chineseText: "如果你看见鳄鱼，别忘了大声喊！",
          imageSeed: "crocodile-river-child",
          imageUrl: "/Little-English-Star-/images/row-row-row-your-boat-4.png",
          highlight: "Crocodile",
          nurseryRhyme: "Don't forget to shout!",
        },
      ],
      game: {
        phonics: "R",
        options: [
          { label: "ROW",  imgSeed: "rowing-boat",   correct: true },
          { label: "RAIN", imgSeed: "rain-drops",    correct: false },
          { label: "RUN",  imgSeed: "running-child", correct: false },
        ]
      }
    }
  },
];
