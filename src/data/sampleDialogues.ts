/**
 * Sample Dialogue Data - Example dialogues for Văn Lang
 * 
 * This file contains sample dialogue definitions that can be used
 * with the DialogueSystem. Includes Vietnamese text with choices.
 */

import { DialogueData } from '../systems/DialogueSystem';

/**
 * Dialogue library - maps dialogue IDs to dialogue data
 */
export const DIALOGUE_LIBRARY: Record<string, DialogueData> = {
  // Village NPCs
  elder_greeting: {
    id: 'elder_greeting',
    npcName: 'Thôn Trưởng Minh',
    text: 'Chào mừng con đến Văn Lang! Ta là Thôn Trưởng của ngôi làng này. Có điều gì ta có thể giúp con?',
    choices: [
      { text: 'Tôi muốn biết về Văn Lang', action: 'ask_about_vanLang' },
      { text: 'Có việc gì tôi có thể giúp không?', action: 'ask_for_quest' },
      { text: 'Tạm biệt', action: 'goodbye' }
    ]
  },
  
  merchant_herbs_greeting: {
    id: 'merchant_herbs_greeting',
    npcName: 'Lương Thị Hoa',
    text: 'Xin chào! Ta bán dược thảo và thuốc men. Con cần gì nào?',
    choices: [
      { text: 'Xem hàng hóa', action: 'open_shop' },
      { text: 'Có nhiệm vụ gì không?', action: 'ask_quest' },
      { text: 'Không cần, cảm ơn', action: 'goodbye' }
    ]
  },

  trainer_greeting: {
    id: 'trainer_greeting',
    npcName: 'Võ Sư Thắng',
    text: 'Con muốn học võ thuật à? Ta có thể dạy con cách chiến đấu với Thần Thú!',
    choices: [
      { text: 'Dạy tôi chiến đấu', action: 'start_training' },
      { text: 'Tôi muốn thi đấu', action: 'start_battle' },
      { text: 'Để lúc khác', action: 'goodbye' }
    ]
  },

  villager_farming: {
    id: 'villager_farming',
    npcName: 'Nông Dân Tuấn',
    text: 'Mùa màng năm nay tốt lắm! Nhưng ta vẫn lo lắng về những con Thần Thú hoang dã phá hoại ruộng vườn.',
    autoClose: false
  },

  guide_tutorial: {
    id: 'guide_tutorial',
    npcName: 'Hướng Dẫn Viên Linh',
    text: 'Chào mừng! Ta sẽ giúp con làm quen với cuộc sống tại Văn Lang. Con muốn học gì trước?',
    choices: [
      { text: 'Di chuyển và tương tác', action: 'tutorial_movement' },
      { text: 'Chiến đấu với Thần Thú', action: 'tutorial_battle' },
      { text: 'Bắt Thần Thú', action: 'tutorial_capture' },
      { text: 'Tôi đã hiểu rồi', action: 'skip_tutorial' }
    ]
  },

  // Forest NPCs
  hermit_wisdom: {
    id: 'hermit_wisdom',
    npcName: 'Ẩn Sĩ Sơn Lâm',
    text: 'Trong rừng sâu này, ta đã sống hàng chục năm. Con tìm ta có việc gì?',
    choices: [
      { text: 'Xin chỉ giáo', action: 'ask_wisdom' },
      { text: 'Có gì kỳ lạ trong rừng không?', action: 'ask_mystery' },
      { text: 'Xin phép ra về', action: 'goodbye' }
    ]
  },

  merchant_tools: {
    id: 'merchant_tools',
    npcName: 'Thợ Rèn Hùng',
    text: 'Đồ rèn của ta là số một Văn Lang! Con cần gì, cứ nói!',
    choices: [
      { text: 'Xem đồ nghề', action: 'open_shop' },
      { text: 'Rèn vũ khí', action: 'craft_weapon' },
      { text: 'Không cần', action: 'goodbye' }
    ]
  },

  hunter_tales: {
    id: 'hunter_tales',
    npcName: 'Thợ Săn Dũng',
    text: 'Con biết không, ta vừa gặp một con Thần Thú hiếm lắm! Nhưng nó chạy mất rồi...',
    autoClose: true,
    closeDelay: 4000
  },

  // Temple NPCs
  monk_blessing: {
    id: 'monk_blessing',
    npcName: 'Đạo Sư Tâm',
    text: 'Nam mô a di đà phật. Con đến đây để cầu gì?',
    choices: [
      { text: 'Cầu phước lành', action: 'receive_blessing' },
      { text: 'Hỏi về đạo', action: 'ask_dharma' },
      { text: 'Xin cáo từ', action: 'goodbye' }
    ]
  },

  priest_healing: {
    id: 'priest_healing',
    npcName: 'Tăng Nhân Bình',
    text: 'Các Thần Thú của con có vẻ kiệt sức. Ta có thể chữa lành cho chúng.',
    choices: [
      { text: 'Xin chữa lành (miễn phí)', action: 'heal_free' },
      { text: 'Mua thuốc', action: 'open_shop' },
      { text: 'Không cần, cảm ơn', action: 'goodbye' }
    ]
  },

  pilgrim_story: {
    id: 'pilgrim_story',
    npcName: 'Hành Khất Lữ',
    text: 'Ta đã đi khắp Văn Lang. Con muốn nghe chuyện về vùng đất nào?',
    choices: [
      { text: 'Về núi Tản Viên', action: 'story_mountain' },
      { text: 'Về biển Đông', action: 'story_sea' },
      { text: 'Về rừng Mộc', action: 'story_forest' },
      { text: 'Để sau', action: 'goodbye' }
    ]
  },

  // Tutorial dialogues
  tutorial_welcome: {
    id: 'tutorial_welcome',
    npcName: 'Hướng Dẫn Viên',
    text: 'Sử dụng WASD hoặc phím mũi tên để di chuyển. Nhấn Space hoặc Enter để tương tác với NPC và vật phẩm.',
    autoClose: true,
    closeDelay: 5000
  },

  tutorial_battle_intro: {
    id: 'tutorial_battle_intro',
    npcName: 'Võ Sư',
    text: 'Trong trận chiến, chọn kỹ năng của Thần Thú và nhấn Attack. Nhớ chú ý hệ Ngũ Hành để có lợi thế!',
    autoClose: true,
    closeDelay: 5000
  },

  tutorial_capture: {
    id: 'tutorial_capture',
    npcName: 'Võ Sư',
    text: 'Khi Thần Thú địch yếu đi, sử dụng Capture Orb để bắt chúng. Càng yếu thì càng dễ bắt!',
    autoClose: true,
    closeDelay: 5000
  },

  // Quest-related dialogues
  quest_accept: {
    id: 'quest_accept',
    text: 'Cảm ơn con! Ta tin con sẽ hoàn thành nhiệm vụ này.',
    autoClose: true,
    closeDelay: 3000
  },

  quest_complete: {
    id: 'quest_complete',
    text: 'Tuyệt vời! Con đã hoàn thành nhiệm vụ. Đây là phần thưởng của con.',
    autoClose: true,
    closeDelay: 3000
  },

  quest_in_progress: {
    id: 'quest_in_progress',
    text: 'Con đang làm nhiệm vụ à? Hãy cố gắng nhé!',
    autoClose: true,
    closeDelay: 2000
  },

  // Shop dialogues
  shop_welcome: {
    id: 'shop_welcome',
    text: 'Chào mừng đến cửa hàng! Xem kỹ hàng hóa nhé.',
    autoClose: true,
    closeDelay: 2000
  },

  shop_thank_you: {
    id: 'shop_thank_you',
    text: 'Cảm ơn con đã mua hàng! Hẹn gặp lại!',
    autoClose: true,
    closeDelay: 2000
  },

  shop_no_money: {
    id: 'shop_no_money',
    text: 'Tiếc quá, con không đủ tiền mua món này.',
    autoClose: true,
    closeDelay: 2000
  },

  // Generic dialogues
  goodbye: {
    id: 'goodbye',
    text: 'Tạm biệt! Chúc con may mắn trên hành trình!',
    autoClose: true,
    closeDelay: 2000
  },

  not_implemented: {
    id: 'not_implemented',
    text: 'Tính năng này sẽ sớm được cập nhật. Hãy quay lại sau nhé!',
    autoClose: true,
    closeDelay: 3000
  }
};

/**
 * Get dialogue by ID
 */
export function getDialogue(id: string): DialogueData | undefined {
  return DIALOGUE_LIBRARY[id];
}

/**
 * Get random dialogue from a list
 */
export function getRandomDialogue(ids: string[]): DialogueData | undefined {
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  return DIALOGUE_LIBRARY[randomId];
}

/**
 * Common dialogue sets for easy access
 */
export const COMMON_DIALOGUES = {
  greetings: ['elder_greeting', 'merchant_herbs_greeting', 'trainer_greeting'],
  farewells: ['goodbye'],
  tutorial: ['tutorial_welcome', 'tutorial_battle_intro', 'tutorial_capture'],
  quest: ['quest_accept', 'quest_complete', 'quest_in_progress'],
  shop: ['shop_welcome', 'shop_thank_you', 'shop_no_money']
};
