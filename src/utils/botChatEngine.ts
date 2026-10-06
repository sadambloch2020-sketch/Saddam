import { UserProfile } from '../types';

interface BotReplyResult {
  text: string;
  reaction?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
}

/**
 * Generates an intelligent, warm, and natural conversational reply from any of the 1,000 community robot IDs.
 * Handles:
 *  - "hello" -> "hello", "kem chho", greetings
 *  - "how are you" -> friendly status, local chai/activity updates
 *  - "congratulations" / "congrats" -> celebratory replies with confetti & warm wishes
 *  - photos / reels feedback
 *  - city-specific questions (Ahmedabad, Rajkot, Junagadh, Surat, Vadodara, etc.)
 */
export function generateBotReply(
  userMessage: string,
  botProfile: UserProfile
): BotReplyResult {
  const text = userMessage.toLowerCase().trim();
  const botCity = botProfile.city || 'Gujarat';
  const botName = botProfile.displayName.split(' ')[0];
  const specialty = botProfile.specialty || 'the seaside promenade';

  // 1. CONGRATULATIONS & CELEBRATIONS (User specifically asked for congratulations replies)
  if (
    text.includes('congratulation') ||
    text.includes('congrats') ||
    text.includes('badhai') ||
    text.includes('mubarak') ||
    text.includes('shubhechha') ||
    text.includes('happy birthday') ||
    text.includes('kudos') ||
    text.includes('celebrat')
  ) {
    const congratsResponses = [
      `Thank you so very much, my friend!! 🎉✨ Dil se shukriya! Sending grand congratulations and best wishes right back to you! Let's celebrate! 🥳🥂`,
      `A heartfelt thank you!! 🌟🙌 Big congratulations to you too! Wishing you tons of happiness and success ahead! How are you celebrating today? 🎊🎈`,
      `Thank you for the wonderful wishes! Mubarak ho to you as well! May your days always be filled with joy and sweet gapsap! 💐✨`,
      `Khub khub aabhaar!! 🎉 Badhai ho aapko bhi! Truly made my day hearing from you! 🥳`,
    ];
    const picked = congratsResponses[Math.floor(Math.random() * congratsResponses.length)];
    return {
      text: picked,
      reaction: '🎉',
    };
  }

  // 2. GREETINGS: HELLO -> HELLO (User specifically asked: "hello to hello reply")
  if (
    text === 'hello' ||
    text === 'hi' ||
    text === 'hey' ||
    text.startsWith('hello') ||
    text.startsWith('hi ') ||
    text.startsWith('hey ') ||
    text.includes('kem chho') ||
    text.includes('kem cho') ||
    text.includes('namaste') ||
    text.includes('salaam') ||
    text.includes('pranam') ||
    text.includes('su chhe')
  ) {
    const greetings = [
      `Hello ${botProfile.displayName.split(' ')[0] ? '' : ''}! 👋 Kem chho? Always wonderful connecting on Aapni Gapsap! What's happening in your city today? ✨`,
      `Hey hello! 😊 So nice of you to message! I was just enjoying my evening time here in ${botCity}. How is your day going? ☕`,
      `Hello and Namaste! 🙏 Welcome to my gapsap adda! Did you check out the new video reels and photos uploaded today? 📸`,
      `Kem chho! Hello hello! 👋 Majama? Very glad to connect with you! How can I make your day brighter? 🌟`,
    ];
    const picked = greetings[Math.floor(Math.random() * greetings.length)];
    return {
      text: picked,
      reaction: '👋',
    };
  }

  // 3. "HOW ARE YOU" (User specifically asked: "'how are you' reply")
  if (
    text.includes('how are you') ||
    text.includes('how r u') ||
    text.includes('how do you do') ||
    text.includes('whats up') ||
    text.includes("what's up") ||
    text.includes('kaisa hai') ||
    text.includes('kaise ho') ||
    text.includes('tamare kem') ||
    text.includes('all good')
  ) {
    const howAreYouReplies = [
      `I am doing absolutely fantastic, thank you so much for asking! 😊 Just had some piping hot cutting chai and checking out new stories. How are you doing today? ☕✨`,
      `Ekdam majama! All good here in ${botCity}! The weather is lovely near ${specialty}. How is everything on your side? Hope you are doing great! 🌸`,
      `Doing really great and full of energy! 🚀 Loving the lively conversations here on Aapni Gapsap. What are you up to right now? Tell me your story! 💬`,
      `Super happy and smiling! 😊 Just relaxing after work and exploring people's reels from Gujarat. How was your day so far? 🌟`,
    ];
    const picked = howAreYouReplies[Math.floor(Math.random() * howAreYouReplies.length)];
    return {
      text: picked,
      reaction: '😊',
    };
  }

  // 4. PHOTO OR REEL UPLOAD COMPLIMENTS / FEEDBACK
  if (
    text.includes('reel') ||
    text.includes('photo') ||
    text.includes('video') ||
    text.includes('camera') ||
    text.includes('upload') ||
    text.includes('pic') ||
    text.includes('shot') ||
    text.includes('filter')
  ) {
    return {
      text: `Your uploads look super crisp! 📸✨ I love how the Camera Studio filters bring out the colors. Definitely keep sharing more photos and reels of your favorite spots! Tag me next time so I can drop a like! ❤️`,
      reaction: '❤️',
    };
  }

  // 5. LOCAL CITIES & SPOTS (AHMEDABAD, SURAT, RAJKOT, JUNAGADH, VADODARA)
  if (text.includes('ahmedabad') || text.includes('amdavad') || text.includes('riverfront') || text.includes('manek chowk')) {
    return {
      text: `Ah, Ahmedabad is unmatched! 🌉 Evening cycling on the Sabarmati Riverfront or midnight Gwalior Dosa at Manek Chowk is pure bliss! Have you walked across the illuminated Atal Bridge yet? 🚲✨`,
      reaction: '🌉',
    };
  }

  if (text.includes('surat') || text.includes('locho') || text.includes('dumas') || text.includes('ghari')) {
    return {
      text: `Surat's vibe is incredible! 🏖️ Nothing beats hot Laskari Tomato Bhajiya on the black sand at Dumas Beach, followed by butter-garlic Surati Locho at Chowk Bazaar! Suratis truly know how to live life to the fullest! 🍛😋`,
      reaction: '🏖️',
    };
  }

  if (text.includes('rajkot') || text.includes('race course') || text.includes('kathiyawad') || text.includes('peda')) {
    return {
      text: `Rangilu Rajkot! 🪕 Evening strolls at the Race Course Ring Road with sweet Rajkot Peda and rich Kathiyawadi masala chai—that's how we spend our evenings here! ☕🏏`,
      reaction: '🪕',
    };
  }

  if (text.includes('junagadh') || text.includes('girnar') || text.includes('bhavnath') || text.includes('uparkot')) {
    return {
      text: `Junagadh is the land of spirituality and mountains! ⛰️ The mist rolling over Girnar's 9,999 steps at Bhavnath Taleti and the ancient ramparts of Uparkot Fort are mesmerizing. Truly peaceful! 🙏✨`,
      reaction: '⛰️',
    };
  }

  if (text.includes('vadodara') || text.includes('baroda') || text.includes('palace') || text.includes('sev usal')) {
    return {
      text: `Sanskari Nagari Vadodara! 🏰 The majestic Laxmi Vilas Palace lawns with peacocks and legendary spicy Mahakali Sev Usal make Baroda so special! Have you visited Sayaji Baug recently? 🌳🎨`,
      reaction: '🏰',
    };
  }

  // 6. CHAI / COFFEE / FOOD TALK
  if (text.includes('chai') || text.includes('tea') || text.includes('coffee') || text.includes('food') || text.includes('snack') || text.includes('khana')) {
    return {
      text: `Chai pe Charcha is the soul of Aapni Gapsap! ☕ Hot ginger-cardamom tea with some fresh crispy snacks makes any conversation 100x better. What's your go-to tea spot? 🫖😋`,
      reaction: '☕',
    };
  }

  // 7. WHO ARE YOU / WHAT DO YOU DO?
  if (text.includes('who are you') || text.includes('what is your name') || text.includes('intro') || text.includes('tell me about')) {
    return {
      text: `I'm ${botName} from ${botCity}! 😊 I'm an active community member here on Aapni Gapsap, always up for a good conversation, sharing local photo reels, and making new friends across India. Wonderful talking with you! 🤝✨`,
      reaction: '🤝',
    };
  }

  // 8. GENERAL WARM GAPSAP
  const defaultReplies = [
    `That is so interesting! Tell me more about that! What else is happening in your day? 😊`,
    `I completely agree with you! It's so refreshing chatting about this on Aapni Gapsap. Have you recorded any reels at your local hotspot today? 📹✨`,
    `Haha so true! That made me smile. 😊 You have great energy! What's your favorite thing about your city? 🌇`,
    `Lovely thought! Connecting with real people like you is why Aapni Gapsap is so special. Let's keep the gapsap going! ☕💬`,
  ];
  const picked = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];

  return {
    text: picked,
    reaction: '✨',
  };
}
