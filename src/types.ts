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
          text: "Once upon a time, a little boy named Leo looked out of his window.",
          chineseText: "从前，有一个叫里奥的小男孩正看着窗外。",
          imageSeed: "boy-window-star",
          highlight: "Star",
          nurseryRhyme: "Twinkle, twinkle, little star,"
        },
        {
          text: "He saw a bright star in the dark night sky. It looked like a diamond.",
          chineseText: "他在漆黑的夜空中看到一颗明亮的星星。它看起来像一颗钻石。",
          imageSeed: "bright-star-diamond",
          highlight: "Diamond",
          nurseryRhyme: "How I wonder what you are!"
        },
        {
          text: "The star was so high above the world, shining over the sleepy town.",
          chineseText: "星星高高挂在世界上方，照耀着沉睡的小镇。",
          imageSeed: "star-over-town",
          highlight: "World",
          nurseryRhyme: "Up above the world so high,"
        },
        {
          text: "Leo made a wish. He wanted to fly to the sky and dance with the star.",
          chineseText: "里奥许了个愿。他想飞上天空，和星星一起跳舞。",
          imageSeed: "boy-flying-star",
          highlight: "Sky",
          nurseryRhyme: "Like a diamond in the sky."
        },
        {
          text: "The little star twinkled back at him. It was a magical night.",
          chineseText: "小星星也对他闪烁。这是一个神奇的夜晚。",
          imageSeed: "star-twinkling-boy",
          highlight: "Twinkle",
          nurseryRhyme: "Twinkle, twinkle, little star."
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
