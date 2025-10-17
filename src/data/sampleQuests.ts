/**
 * Sample Quest Data - Example quests for Văn Lang
 * 
 * This file contains sample quest definitions that can be loaded
 * into the QuestSystem. Includes main story, side quests, and tutorials.
 */

import { QuestData } from '../systems/QuestSystem';

/**
 * Tutorial quests for new players
 */
export const TUTORIAL_QUESTS: QuestData[] = [
  {
    id: 'tutorial_001',
    title: 'Chào Mừng Đến Văn Lang',
    description: 'Học cách di chuyển và tương tác với thế giới',
    type: 'tutorial',
    status: 'available',
    objectives: [
      {
        id: 'move_around',
        description: 'Di chuyển bằng WASD hoặc phím mũi tên',
        target: 1,
        current: 0
      },
      {
        id: 'talk_to_guide',
        description: 'Nói chuyện với Hướng Dẫn Viên',
        target: 1,
        current: 0
      }
    ],
    rewards: {
      exp: 50
    },
    giver: 'guide_newbie'
  },
  {
    id: 'tutorial_battle',
    title: 'Trận Chiến Đầu Tiên',
    description: 'Học cách chiến đấu với Thần Thú',
    type: 'tutorial',
    status: 'available',
    objectives: [
      {
        id: 'complete_battle',
        description: 'Hoàn thành một trận chiến',
        target: 1,
        current: 0
      }
    ],
    rewards: {
      exp: 100,
      items: ['potion_small']
    },
    giver: 'trainer_basic',
    prerequisiteQuests: ['tutorial_001']
  },
  {
    id: 'tutorial_capture',
    title: 'Bắt Thần Thú',
    description: 'Học cách bắt Thần Thú trong trận chiến',
    type: 'tutorial',
    status: 'available',
    objectives: [
      {
        id: 'capture_first',
        description: 'Bắt Thần Thú đầu tiên',
        target: 1,
        current: 0
      }
    ],
    rewards: {
      exp: 150,
      items: ['capture_orb']
    },
    giver: 'trainer_basic',
    prerequisiteQuests: ['tutorial_battle']
  }
];

/**
 * Main story quests
 */
export const MAIN_QUESTS: QuestData[] = [
  {
    id: 'main_001',
    title: 'Triệu Tập Của Thôn Trưởng',
    description: 'Thôn Trưởng cần sự giúp đỡ của bạn',
    type: 'main',
    status: 'available',
    objectives: [
      {
        id: 'meet_elder',
        description: 'Gặp Thôn Trưởng Minh',
        target: 1,
        current: 0
      },
      {
        id: 'listen_story',
        description: 'Lắng nghe câu chuyện',
        target: 1,
        current: 0
      }
    ],
    rewards: {
      exp: 200,
      gold: 100
    },
    giver: 'elder_village',
    prerequisiteQuests: ['tutorial_capture']
  },
  {
    id: 'main_002',
    title: 'Bí Ẩn Rừng Sâu',
    description: 'Điều tra những tiếng động lạ trong rừng',
    type: 'main',
    status: 'available',
    objectives: [
      {
        id: 'explore_forest',
        description: 'Khám phá khu vực rừng sâu',
        target: 1,
        current: 0
      },
      {
        id: 'defeat_enemies',
        description: 'Đánh bại kẻ thù trong rừng',
        target: 3,
        current: 0
      },
      {
        id: 'find_clue',
        description: 'Tìm manh mối',
        target: 1,
        current: 0
      }
    ],
    rewards: {
      exp: 300,
      gold: 200,
      items: ['rare_herb']
    },
    giver: 'elder_village',
    prerequisiteQuests: ['main_001']
  },
  {
    id: 'main_temple_quest',
    title: 'Hành Hương Đến Đền Thờ',
    description: 'Đi đến đền thờ để nhận lời chỉ dạy',
    type: 'main',
    status: 'available',
    objectives: [
      {
        id: 'reach_temple',
        description: 'Đến đền thờ',
        target: 1,
        current: 0
      },
      {
        id: 'meet_monk',
        description: 'Gặp Đạo Sư Tâm',
        target: 1,
        current: 0
      },
      {
        id: 'receive_blessing',
        description: 'Nhận phước lành',
        target: 1,
        current: 0
      }
    ],
    rewards: {
      exp: 400,
      gold: 300,
      items: ['blessing_charm']
    },
    giver: 'monk_main',
    prerequisiteQuests: ['main_002']
  }
];

/**
 * Side quests
 */
export const SIDE_QUESTS: QuestData[] = [
  {
    id: 'side_herbs',
    title: 'Thu Thập Dược Thảo',
    description: 'Giúp người bán thuốc thu thập dược thảo',
    type: 'side',
    status: 'available',
    objectives: [
      {
        id: 'collect_herbs',
        description: 'Thu thập dược thảo',
        target: 10,
        current: 0
      }
    ],
    rewards: {
      exp: 100,
      gold: 150,
      items: ['potion_medium']
    },
    giver: 'merchant_herbs'
  },
  {
    id: 'side_forest_mystery',
    title: 'Bí Mật Của Ẩn Sĩ',
    description: 'Giúp ẩn sĩ giải quyết một vấn đề',
    type: 'side',
    status: 'available',
    objectives: [
      {
        id: 'find_lost_item',
        description: 'Tìm vật phẩm thất lạc',
        target: 1,
        current: 0
      },
      {
        id: 'return_item',
        description: 'Trả lại vật phẩm',
        target: 1,
        current: 0
      }
    ],
    rewards: {
      exp: 250,
      items: ['rare_scroll']
    },
    giver: 'hermit_forest'
  },
  {
    id: 'side_hunting',
    title: 'Săn Thần Thú Hoang Dã',
    description: 'Giúp thợ săn bắt Thần Thú hoang dã',
    type: 'side',
    status: 'available',
    objectives: [
      {
        id: 'catch_wild',
        description: 'Bắt Thần Thú hoang dã',
        target: 5,
        current: 0
      }
    ],
    rewards: {
      exp: 200,
      gold: 250,
      items: ['capture_orb', 'capture_orb']
    },
    giver: 'villager_hunter'
  }
];

/**
 * Daily quests (repeatable)
 */
export const DAILY_QUESTS: QuestData[] = [
  {
    id: 'daily_training',
    title: 'Luyện Tập Hàng Ngày',
    description: 'Hoàn thành 3 trận chiến',
    type: 'daily',
    status: 'available',
    objectives: [
      {
        id: 'win_battles',
        description: 'Thắng trận chiến',
        target: 3,
        current: 0
      }
    ],
    rewards: {
      exp: 150,
      gold: 100
    },
    giver: 'trainer_basic'
  },
  {
    id: 'daily_gathering',
    title: 'Thu Hoạch Hàng Ngày',
    description: 'Thu thập tài nguyên',
    type: 'daily',
    status: 'available',
    objectives: [
      {
        id: 'gather_resources',
        description: 'Thu thập tài nguyên',
        target: 20,
        current: 0
      }
    ],
    rewards: {
      exp: 100,
      gold: 150
    },
    giver: 'villager_farmer'
  },
  {
    id: 'daily_blessing',
    title: 'Cầu Nguyện Hàng Ngày',
    description: 'Đến đền thờ cầu nguyện',
    type: 'daily',
    status: 'available',
    objectives: [
      {
        id: 'pray_temple',
        description: 'Cầu nguyện tại đền thờ',
        target: 1,
        current: 0
      }
    ],
    rewards: {
      exp: 80,
      items: ['blessing_token']
    },
    giver: 'priest_healing'
  }
];

/**
 * All sample quests combined
 */
export const ALL_SAMPLE_QUESTS: QuestData[] = [
  ...TUTORIAL_QUESTS,
  ...MAIN_QUESTS,
  ...SIDE_QUESTS,
  ...DAILY_QUESTS
];

/**
 * Get quests by type
 */
export function getQuestsByType(type: 'tutorial' | 'main' | 'side' | 'daily'): QuestData[] {
  switch (type) {
    case 'tutorial':
      return TUTORIAL_QUESTS;
    case 'main':
      return MAIN_QUESTS;
    case 'side':
      return SIDE_QUESTS;
    case 'daily':
      return DAILY_QUESTS;
    default:
      return [];
  }
}

/**
 * Get quest by ID
 */
export function getSampleQuest(id: string): QuestData | undefined {
  return ALL_SAMPLE_QUESTS.find(quest => quest.id === id);
}
