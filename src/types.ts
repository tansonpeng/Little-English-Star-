export type Screen = 'MAP' | 'HUB' | 'LISTEN' | 'READ' | 'PLAY' | 'KARAOKE';

export interface StoryPage {
  text: string;
  chineseText: string;
  imageSeed: string;
  highlight: string;
  nurseryRhyme?: string;
}

export interface SongContent {
  lyrics: string[];
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
  content: SongContent;
}

export const SONGS: SongNode[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    chineseTitle: '一闪一闪亮晶晶',
    locked: false,
    position: { left: '5%', bottom: '15%' },
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
    locked: false,
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
];
