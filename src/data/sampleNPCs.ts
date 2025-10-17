/**
 * Sample NPC Data - Example NPCs for Văn Lang
 * 
 * This file contains sample NPC definitions that can be loaded
 * into the NPCSystem. Includes various NPC types with Vietnamese names.
 */

import { NPCData } from '../systems/NPCSystem';

/**
 * Sample NPCs for the village area
 */
export const VILLAGE_NPCS: NPCData[] = [
  {
    id: 'elder_village',
    name: 'Thôn Trưởng Minh',
    type: 'elder',
    x: 320,
    y: 240,
    dialogue: 'elder_greeting',
    questId: 'main_001'
  },
  {
    id: 'merchant_herbs',
    name: 'Lương Thị Hoa',
    type: 'merchant',
    x: 480,
    y: 320,
    dialogue: 'merchant_herbs_greeting',
    shopId: 'shop_herbs'
  },
  {
    id: 'trainer_basic',
    name: 'Võ Sư Thắng',
    type: 'trainer',
    x: 640,
    y: 240,
    dialogue: 'trainer_greeting',
    questId: 'tutorial_battle'
  },
  {
    id: 'villager_farmer',
    name: 'Nông Dân Tuấn',
    type: 'villager',
    x: 400,
    y: 400,
    dialogue: 'villager_farming'
  },
  {
    id: 'guide_newbie',
    name: 'Hướng Dẫn Viên Linh',
    type: 'guide',
    x: 240,
    y: 320,
    dialogue: 'guide_tutorial',
    questId: 'tutorial_001'
  }
];

/**
 * Sample NPCs for the forest area
 */
export const FOREST_NPCS: NPCData[] = [
  {
    id: 'hermit_forest',
    name: 'Ẩn Sĩ Sơn Lâm',
    type: 'elder',
    x: 800,
    y: 600,
    dialogue: 'hermit_wisdom',
    questId: 'side_forest_mystery'
  },
  {
    id: 'merchant_tools',
    name: 'Thợ Rèn Hùng',
    type: 'merchant',
    x: 720,
    y: 560,
    dialogue: 'merchant_tools',
    shopId: 'shop_tools'
  },
  {
    id: 'villager_hunter',
    name: 'Thợ Săn Dũng',
    type: 'villager',
    x: 880,
    y: 640,
    dialogue: 'hunter_tales'
  }
];

/**
 * Sample NPCs for the temple area
 */
export const TEMPLE_NPCS: NPCData[] = [
  {
    id: 'monk_main',
    name: 'Đạo Sư Tâm',
    type: 'elder',
    x: 1120,
    y: 480,
    dialogue: 'monk_blessing',
    questId: 'main_temple_quest'
  },
  {
    id: 'priest_healing',
    name: 'Tăng Nhân Bình',
    type: 'guide',
    x: 1040,
    y: 520,
    dialogue: 'priest_healing',
    shopId: 'shop_temple_healing'
  },
  {
    id: 'pilgrim_traveler',
    name: 'Hành Khất Lữ',
    type: 'villager',
    x: 1200,
    y: 560,
    dialogue: 'pilgrim_story',
    repeatable: true
  }
];

/**
 * All sample NPCs combined
 */
export const ALL_SAMPLE_NPCS: NPCData[] = [
  ...VILLAGE_NPCS,
  ...FOREST_NPCS,
  ...TEMPLE_NPCS
];

/**
 * Get NPCs by area
 */
export function getNPCsByArea(area: 'village' | 'forest' | 'temple'): NPCData[] {
  switch (area) {
    case 'village':
      return VILLAGE_NPCS;
    case 'forest':
      return FOREST_NPCS;
    case 'temple':
      return TEMPLE_NPCS;
    default:
      return [];
  }
}

/**
 * Get NPC by ID
 */
export function getSampleNPC(id: string): NPCData | undefined {
  return ALL_SAMPLE_NPCS.find(npc => npc.id === id);
}
