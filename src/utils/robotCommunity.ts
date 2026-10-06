import { UserProfile } from '../types';

// Curated avatar sets from Unsplash portraits
const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
];

const FIRST_NAMES = [
  'Aarav', 'Priya', 'Karan', 'Pooja', 'Jay', 'Tanvi', 'Rohan', 'Ananya', 'Mehul', 'Kavita',
  'Harsh', 'Drashti', 'Bhavin', 'Nisha', 'Chirag', 'Neha', 'Parth', 'Khushi', 'Jignesh', 'Riddhi',
  'Siddharth', 'Divya', 'Tirth', 'Swati', 'Hardik', 'Ami', 'Pratik', 'Heena', 'Darshan', 'Mansi',
  'Viren', 'Komal', 'Milan', 'Shruti', 'Alpesh', 'Kinjal', 'Nayan', 'Payal', 'Yash', 'Bhumika',
  'Sagar', 'Sneha', 'Deep', 'Meera', 'Ravi', 'Shreya', 'Amit', 'Jinal', 'Monil', 'Twinkle',
  'Dev', 'Priyanka', 'Aditya', 'Ishita', 'Gaurav', 'Disha', 'Manish', 'Ritika', 'Sunny', 'Kavya',
  'Mayur', 'Bindiya', 'Kunal', 'Vaishali', 'Rahul', 'Jyoti', 'Chetan', 'Tejal', 'Ashish', 'Urvashi',
  'Hiren', 'Dolly', 'Nirav', 'Archana', 'Vishal', 'Mamta', 'Hemal', 'Nirali', 'Bhavesh', 'Geeta',
  'Ronak', 'Sejal', 'Paresh', 'Krupa', 'Sunil', 'Bhavna', 'Dhaval', 'Kajal', 'Ankit', 'Sheetal',
  'Kalpesh', 'Alpa', 'Manoj', 'Hetul', 'Dipen', 'Palak', 'Samir', 'Falguni', 'Bharat', 'Varsha',
];

const LAST_NAMES = [
  'Patel', 'Shah', 'Mehta', 'Bloch', 'Desai', 'Jadeja', 'Solanki', 'Joshi', 'Trivedi', 'Rajput',
  'Chauhan', 'Parekh', 'Vora', 'Randeria', 'Doshi', 'Bhavsar', 'Dave', 'Pandya', 'Parmar', 'Gohil',
  'Modi', 'Sharma', 'Verma', 'Zala', 'Makwana', 'Thakkar', 'Soni', 'Kapadia', 'Munshi', 'Dalal',
  'Merchant', 'Sheth', 'Gajjar', 'Panchal', 'Rathod', 'Chavda', 'Barot', 'Bhatt', 'Rawal', 'Vaidya',
  'Gandhi', 'Khatri', 'Surati', 'Barodia', 'Kothari', 'Shukla', 'Pathak', 'Vyas', 'Acharya', 'Upadhyay',
];

export interface CityStateConfig {
  city: string;
  state: string;
  specialties: string[];
}

export const REGIONAL_CITIES: CityStateConfig[] = [
  // GUJARAT CITIES (Prominent focus)
  {
    city: 'Ahmedabad',
    state: 'Gujarat',
    specialties: ['Sabarmati Riverfront', 'Manek Chowk Khau Gali', 'Atal Footbridge', 'Law Garden Night Market', 'Science City'],
  },
  {
    city: 'Rajkot',
    state: 'Gujarat',
    specialties: ['Race Course Ring Road', 'Kathiyawadi Chai', 'Dr. Yagnik Road Cafes', 'Aji Dam Lake', 'Famous Rajkot Peda'],
  },
  {
    city: 'Junagadh',
    state: 'Gujarat',
    specialties: ['Girnar Foothills Bhavnath', 'Uparkot Fort Stepwells', 'Sakkarbaug Zoo', 'Mahabat Maqbara', 'Gir Forest Trek'],
  },
  {
    city: 'Surat',
    state: 'Gujarat',
    specialties: ['Dumas Beach Promenade', 'Laskari Tomato Bhajiya', 'Chowk Bazaar Locho', 'VR Dumas Road Hub', 'Ghari Sweets'],
  },
  {
    city: 'Vadodara',
    state: 'Gujarat',
    specialties: ['Laxmi Vilas Palace', 'Sayaji Baug Garden', 'Mahakali Tari Sev Usal', 'MSU Fine Arts Adda', 'Sursagar Lake'],
  },

  // OTHER MAJOR STATES
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    specialties: ['Marine Drive Queen’s Necklace', 'Bandra Carter Road', 'Juhu Beach Chowpatty', 'Cutting Chai & Vada Pav'],
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    specialties: ['FC Road Student Adda', 'Vaishali Filter Coffee', 'Sinhagad Fort Trek', 'Irani Bun Maska'],
  },
  {
    city: 'New Delhi',
    state: 'Delhi NCR',
    specialties: ['Connaught Place Inner Circle', 'Hauz Khas Village', 'Chandni Chowk Food Walk', 'Central Park Music Jam'],
  },
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    specialties: ['Hawa Mahal Rooftop Tea', 'Nahargarh Fort Sunset', 'Johari Bazaar Silver Hunt', 'Kulhad Lassi'],
  },
  {
    city: 'Udaipur',
    state: 'Rajasthan',
    specialties: ['Fateh Sagar Lake Breeze', 'Ambrai Ghat Sunset', 'City Palace Heritage', 'Lakeside Cold Coffee'],
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    specialties: ['Koramangala 5th Block Cafes', 'Church Street Buskers', 'Blossom Book House', 'Artisanal Filter Coffee'],
  },
  {
    city: 'Amritsar',
    state: 'Punjab',
    specialties: ['Golden Temple Sarovar', 'Amritsari Crispy Kulcha', 'Heritage Street Walk', 'Kesar Da Dhaba'],
  },
  {
    city: 'Lahore',
    state: 'Punjab',
    specialties: ['Anarkali Old Food Street', 'Badshahi Heritage Walk', 'Live Tawa Karahi', 'Midnight Poetry Circles'],
  },
];

const PASSIONS = [
  'Chai pe charcha & sunset reels lover ☕📹',
  'Foodie exploring local street bites & khau gali 🍛😋',
  'Street photographer & heritage architecture fan 📸🏛️',
  'Travel wanderer & mountain trekker ⛰️🎒',
  'Music enthusiast & acoustic guitar player 🎸🎵',
  'Bollywood dance reel creator & fitness fan 💃🏋️',
  'Student at MSU / GTU & weekend cafe hopper 📚☕',
  'Tech builder & startup discussions enthusiast 💻🚀',
  'Kathiyawadi culture & folk music lover 🪕✨',
  'Breezy seaside walker & evening gapsap fan 🌊🌅',
];

// In-memory cache for all 1,000 bots
let cachedCommunityRobots: UserProfile[] | null = null;

/**
 * Generates or retrieves exactly 1,000 unique Community Robot IDs
 */
export function getAllCommunityRobots(): UserProfile[] {
  if (cachedCommunityRobots && cachedCommunityRobots.length === 1000) {
    return cachedCommunityRobots;
  }

  const robots: UserProfile[] = [];
  const TOTAL_ROBOTS = 1000;

  for (let i = 1; i <= TOTAL_ROBOTS; i++) {
    const fnIndex = (i - 1) % FIRST_NAMES.length;
    const lnIndex = (Math.floor((i - 1) / FIRST_NAMES.length) + (i % 7)) % LAST_NAMES.length;
    const firstName = FIRST_NAMES[fnIndex];
    const lastName = LAST_NAMES[lnIndex];
    const displayName = `${firstName} ${lastName}`;

    // Regional distribution: prioritize Gujarat (60% weight for requested cities), rest across India
    let cityConfig: CityStateConfig;
    if (i % 10 < 6) {
      // Gujarat cities (Ahmedabad, Rajkot, Junagadh, Surat, Vadodara)
      const gujIndex = (i - 1) % 5;
      cityConfig = REGIONAL_CITIES[gujIndex];
    } else {
      // Other cities
      const otherIndex = 5 + ((i - 1) % (REGIONAL_CITIES.length - 5));
      cityConfig = REGIONAL_CITIES[otherIndex];
    }

    const specialty = cityConfig.specialties[i % cityConfig.specialties.length];
    const passion = PASSIONS[i % PASSIONS.length];
    const avatar = AVATAR_URLS[(i - 1) % AVATAR_URLS.length];
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${i > 100 ? (i % 99) : ''}`.replace(/\s+/g, '');

    const bio = `${passion} | Native of ${cityConfig.city}. Catch me at ${specialty}!`;

    robots.push({
      id: `robot_${i}`,
      username,
      displayName,
      avatar,
      bio,
      location: `${cityConfig.city}, ${cityConfig.state}`,
      city: cityConfig.city,
      state: cityConfig.state,
      specialty,
      isVerified: i <= 50 || i % 15 === 0,
      isBot: true,
      followersCount: 850 + (i * 37) % 8500,
      followingCount: 120 + (i * 19) % 600,
      reelsCount: 4 + (i * 3) % 45,
    });
  }

  cachedCommunityRobots = robots;
  return robots;
}

/**
 * Find bot by ID (e.g. robot_42)
 */
export function getRobotById(id: string): UserProfile | undefined {
  const robots = getAllCommunityRobots();
  return robots.find((r) => r.id === id);
}

/**
 * Filter community robot pool by search query, city, or state
 */
export function searchCommunityRobots(
  query: string = '',
  city: string = 'all',
  state: string = 'all',
  limit: number = 50
): UserProfile[] {
  const robots = getAllCommunityRobots();
  const q = query.toLowerCase().trim();

  return robots
    .filter((r) => {
      if (state !== 'all' && r.state !== state) return false;
      if (city !== 'all' && r.city?.toLowerCase() !== city.toLowerCase()) return false;
      if (!q) return true;

      return (
        r.displayName.toLowerCase().includes(q) ||
        r.username.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.specialty?.toLowerCase().includes(q) ||
        r.bio.toLowerCase().includes(q)
      );
    })
    .slice(0, limit);
}
