/**
 * Vietnamese Audio Scripts for RPG Hùng Vương
 * 
 * Complete voice line library covering:
 * - Story narration and cinematics
 * - Tutorial guidance
 * - Character selection and dialog
 * - Battle events and reactions
 * - Monster interactions by element and tier
 * - UI feedback and notifications
 */

// ========================================
// STORY & NARRATION
// ========================================

const storyScripts = {
  // Opening Cinematic
  intro_welcome: {
    vi: "Chào mừng bạn đến với Văn Lang, thời đại của các vị Vua Hùng!",
    en: "Welcome to Van Lang, the era of the Hung Kings!",
    category: "narration",
    file: "voice_intro_welcome.mp3"
  },
  intro_mission: {
    vi: "Bạn là Chiến Sĩ Lạc Việt, sứ mệnh bảo vệ bộ lạc bằng sức mạnh Thần Thú.",
    en: "You are a Lac Viet Warrior, with the mission to protect the tribe with Divine Beast power.",
    category: "narration",
    file: "voice_intro_mission.mp3"
  },
  intro_journey: {
    vi: "Hành trình của bạn bắt đầu từ đây. Hãy khám phá thế giới và thu phục các Thần Thú!",
    en: "Your journey begins here. Explore the world and capture the Divine Beasts!",
    category: "narration",
    file: "voice_intro_journey.mp3"
  },
  
  // Welcome Back
  welcome_back: {
    vi: "Chào mừng trở lại Văn Lang! Tiếp tục hành trình nào!",
    en: "Welcome back to Van Lang! Let's continue the journey!",
    category: "narration",
    file: "voice_welcome_back.mp3"
  }
};

// ========================================
// TUTORIAL GUIDANCE
// ========================================

const tutorialScripts = {
  tutorial_start: {
    vi: "Đây là hướng dẫn cơ bản cho người mới. Hãy chú ý!",
    en: "This is the basic tutorial for beginners. Pay attention!",
    category: "tutorial",
    file: "voice_tutorial_start.mp3"
  },
  tutorial_move: {
    vi: "Đây là cách di chuyển—sử dụng các phím WASD hoặc mũi tên.",
    en: "This is how to move—use WASD or arrow keys.",
    category: "tutorial",
    file: "voice_tutorial_move.mp3"
  },
  tutorial_encounter: {
    vi: "Gặp vùng sáng màu là nơi sinh sống của Thần Thú. Bước vào để bắt đầu chiến đấu!",
    en: "The bright colored areas are where Divine Beasts live. Enter to start battle!",
    category: "tutorial",
    file: "voice_tutorial_encounter.mp3"
  },
  tutorial_select_team: {
    vi: "Hãy chọn ba Thần Thú cho đội hình bạn. Chọn cân bằng các hệ!",
    en: "Choose three Divine Beasts for your team. Balance the elements!",
    category: "tutorial",
    file: "voice_tutorial_select_team.mp3"
  },
  tutorial_battle: {
    vi: "Trong chiến đấu, sử dụng các kỹ năng để tấn công đối thủ!",
    en: "In battle, use skills to attack your opponent!",
    category: "tutorial",
    file: "voice_tutorial_battle.mp3"
  },
  tutorial_elements: {
    vi: "Ngũ Hành là chìa khóa chiến thắng! Kim thắng Mộc, Mộc thắng Thổ, Thổ thắng Thủy, Thủy thắng Hỏa, Hỏa thắng Kim!",
    en: "The Five Elements are the key to victory! Metal beats Wood, Wood beats Earth, Earth beats Water, Water beats Fire, Fire beats Metal!",
    category: "tutorial",
    file: "voice_tutorial_elements.mp3"
  },
  tutorial_complete: {
    vi: "Hướng dẫn hoàn tất! Giờ bạn đã sẵn sàng cho cuộc phiêu lưu!",
    en: "Tutorial complete! Now you're ready for the adventure!",
    category: "tutorial",
    file: "voice_tutorial_complete.mp3"
  }
};

// ========================================
// CHARACTER SELECTION
// ========================================

const characterSelectionScripts = {
  select_intro: {
    vi: "Lựa chọn Thần Thú thuộc hệ Kim, Mộc, Thủy, Hỏa, Thổ!",
    en: "Choose Divine Beasts of Metal, Wood, Water, Fire, Earth elements!",
    category: "character_selection",
    file: "voice_select_intro.mp3"
  },
  select_first: {
    vi: "Hãy chọn chiến binh đầu tiên! Anh hùng nào sẽ đồng hành cùng bạn?",
    en: "Choose your first warrior! Which hero will accompany you?",
    category: "character_selection",
    file: "voice_select_first.mp3"
  },
  select_second: {
    vi: "Chọn Thần Thú thứ hai. Đội hình đang dần hoàn thiện!",
    en: "Choose your second Divine Beast. The team is taking shape!",
    category: "character_selection",
    file: "voice_select_second.mp3"
  },
  select_third: {
    vi: "Lựa chọn cuối cùng! Hãy chọn Thần Thú thứ ba cho đội hình!",
    en: "Final choice! Choose your third Divine Beast for the team!",
    category: "character_selection",
    file: "voice_select_third.mp3"
  },
  select_complete: {
    vi: "Đội hình hoàn tất! Sẵn sàng cho cuộc phiêu lưu!",
    en: "Team complete! Ready for the adventure!",
    category: "character_selection",
    file: "voice_select_complete.mp3"
  }
};

// ========================================
// BATTLE EVENTS
// ========================================

const battleScripts = {
  battle_start: {
    vi: "Trận chiến bắt đầu! Chuẩn bị chiến đấu!",
    en: "Battle begins! Prepare to fight!",
    category: "battle",
    file: "voice_battle_start.mp3"
  },
  battle_your_turn: {
    vi: "Lượt của bạn! Hãy hành động!",
    en: "Your turn! Take action!",
    category: "battle",
    file: "voice_battle_your_turn.mp3"
  },
  battle_enemy_turn: {
    vi: "Lượt đối thủ! Cẩn thận!",
    en: "Enemy turn! Be careful!",
    category: "battle",
    file: "voice_battle_enemy_turn.mp3"
  },
  
  // Victory & Defeat
  victory: {
    vi: "Chiến thắng! Bạn đã chiến đấu xuất sắc!",
    en: "Victory! You fought excellently!",
    category: "battle",
    file: "voice_victory.mp3"
  },
  victory_exp: {
    vi: "Nhận được ba mươi điểm kinh nghiệm!",
    en: "Gained thirty experience points!",
    category: "battle",
    file: "voice_victory_exp.mp3"
  },
  defeat: {
    vi: "Thất bại! Đừng nản lòng, hãy thử lại!",
    en: "Defeat! Don't be discouraged, try again!",
    category: "battle",
    file: "voice_defeat.mp3"
  },
  
  // Capture
  capture_attempt: {
    vi: "Đang thu phục! Hãy cầu mong thành công!",
    en: "Attempting capture! Hope for success!",
    category: "battle",
    file: "voice_capture_attempt.mp3"
  },
  capture_success: {
    vi: "Thu phục thành công! Thần Thú mới gia nhập đội hình!",
    en: "Capture successful! New Divine Beast joins the team!",
    category: "battle",
    file: "voice_capture_success.mp3"
  },
  capture_failed: {
    vi: "Thu phục thất bại! Hãy thử lại sau!",
    en: "Capture failed! Try again later!",
    category: "battle",
    file: "voice_capture_failed.mp3"
  },
  
  // Evolution
  evolution: {
    vi: "Thần Thú đang tiến hóa! Sức mạnh tăng lên!",
    en: "Divine Beast is evolving! Power is increasing!",
    category: "battle",
    file: "voice_evolution.mp3"
  },
  evolution_complete: {
    vi: "Tiến hóa hoàn tất! Thần Thú đã mạnh hơn!",
    en: "Evolution complete! Divine Beast is stronger!",
    category: "battle",
    file: "voice_evolution_complete.mp3"
  },
  
  // Warning
  warning_low_hp: {
    vi: "Cẩn thận! Máu sắp hết!",
    en: "Careful! HP is low!",
    category: "battle",
    file: "voice_warning_low_hp.mp3"
  },
  warning_enemy_strong: {
    vi: "Cẩn thận, kẻ thù rất mạnh!",
    en: "Careful, the enemy is very strong!",
    category: "battle",
    file: "voice_warning_enemy_strong.mp3"
  }
};

// ========================================
// ELEMENT ATTACKS (Ngũ Hành)
// ========================================

const elementAttackScripts = {
  // Metal (Kim)
  attack_metal: {
    vi: "Tấn công bằng sức mạnh của Kim! Chém mạnh!",
    en: "Attack with the power of Metal! Strike hard!",
    category: "element_attack",
    file: "voice_attack_metal.mp3"
  },
  skill_metal: {
    vi: "Kim chém phá! Sức mạnh kim loại!",
    en: "Metal Slash! Metal power!",
    category: "element_attack",
    file: "voice_skill_metal.mp3"
  },
  
  // Wood (Mộc)
  attack_wood: {
    vi: "Tấn công bằng sức mạnh của Mộc! Vươn mình!",
    en: "Attack with the power of Wood! Reach out!",
    category: "element_attack",
    file: "voice_attack_wood.mp3"
  },
  skill_wood: {
    vi: "Mộc quấn quít! Sức sống thiên nhiên!",
    en: "Wood Entangle! Nature's life force!",
    category: "element_attack",
    file: "voice_skill_wood.mp3"
  },
  
  // Water (Thủy)
  attack_water: {
    vi: "Tấn công bằng sức mạnh của Thủy! Nước cuốn trôi!",
    en: "Attack with the power of Water! Water sweeps away!",
    category: "element_attack",
    file: "voice_attack_water.mp3"
  },
  skill_water: {
    vi: "Thủy triều dâng! Sóng nước dữ dội!",
    en: "Rising Tide! Fierce water waves!",
    category: "element_attack",
    file: "voice_skill_water.mp3"
  },
  
  // Fire (Hỏa)
  attack_fire: {
    vi: "Tấn công bằng sức mạnh của Hỏa! Lửa thiêu đốt!",
    en: "Attack with the power of Fire! Fire burns!",
    category: "element_attack",
    file: "voice_attack_fire.mp3"
  },
  skill_fire: {
    vi: "Hỏa diệm! Ngọn lửa dữ dội!",
    en: "Flame Burst! Fierce fire!",
    category: "element_attack",
    file: "voice_skill_fire.mp3"
  },
  
  // Earth (Thổ)
  attack_earth: {
    vi: "Tấn công bằng sức mạnh của Thổ! Đất rung chuyển!",
    en: "Attack with the power of Earth! Ground shakes!",
    category: "element_attack",
    file: "voice_attack_earth.mp3"
  },
  skill_earth: {
    vi: "Thổ nứt! Đất đá vỡ vụn!",
    en: "Earth Crack! Rocks shatter!",
    category: "element_attack",
    file: "voice_skill_earth.mp3"
  },
  
  // Super Effective
  super_effective: {
    vi: "Siêu hiệu quả! Đòn tấn công hoàn hảo!",
    en: "Super effective! Perfect attack!",
    category: "element_attack",
    file: "voice_super_effective.mp3"
  },
  not_effective: {
    vi: "Không hiệu quả lắm. Hãy thay đổi chiến thuật!",
    en: "Not very effective. Change tactics!",
    category: "element_attack",
    file: "voice_not_effective.mp3"
  },
  critical_hit: {
    vi: "Đòn chí mạng! Sát thương cực lớn!",
    en: "Critical hit! Massive damage!",
    category: "element_attack",
    file: "voice_critical_hit.mp3"
  }
};

// ========================================
// MONSTER REACTIONS BY TIER
// ========================================

const monsterReactionScripts = {
  // Common Monsters
  common_appear: {
    vi: "Thần Thú xuất hiện! Chuẩn bị chiến đấu!",
    en: "Divine Beast appears! Prepare to fight!",
    category: "monster_reaction",
    file: "voice_common_appear.mp3"
  },
  common_attack: {
    vi: "Tấn công!",
    en: "Attack!",
    category: "monster_reaction",
    file: "voice_common_attack.mp3"
  },
  common_hurt: {
    vi: "Ầu!",
    en: "Ouch!",
    category: "monster_reaction",
    file: "voice_common_hurt.mp3"
  },
  common_faint: {
    vi: "Tôi... thất bại...",
    en: "I... failed...",
    category: "monster_reaction",
    file: "voice_common_faint.mp3"
  },
  
  // Rare Monsters
  rare_appear: {
    vi: "Thần Thú hiếm xuất hiện! Đây là cơ hội!",
    en: "Rare Divine Beast appears! This is a chance!",
    category: "monster_reaction",
    file: "voice_rare_appear.mp3"
  },
  rare_attack: {
    vi: "Hãy nếm thử sức mạnh của ta!",
    en: "Taste my power!",
    category: "monster_reaction",
    file: "voice_rare_attack.mp3"
  },
  rare_hurt: {
    vi: "Ngươi không tệ!",
    en: "You're not bad!",
    category: "monster_reaction",
    file: "voice_rare_hurt.mp3"
  },
  rare_faint: {
    vi: "Ngươi xứng đáng... chiến thắng...",
    en: "You deserve... victory...",
    category: "monster_reaction",
    file: "voice_rare_faint.mp3"
  },
  
  // Legendary Monsters
  legendary_appear: {
    vi: "Thần Thú huyền thoại giáng lâm! Hãy cẩn thận!",
    en: "Legendary Divine Beast descends! Be careful!",
    category: "monster_reaction",
    file: "voice_legendary_appear.mp3"
  },
  legendary_attack: {
    vi: "Ta sẽ cho ngươi thấy sức mạnh thực sự!",
    en: "I will show you true power!",
    category: "monster_reaction",
    file: "voice_legendary_attack.mp3"
  },
  legendary_hurt: {
    vi: "Thú vị! Ngươi có chút kỹ năng!",
    en: "Interesting! You have some skill!",
    category: "monster_reaction",
    file: "voice_legendary_hurt.mp3"
  },
  legendary_faint: {
    vi: "Ngươi... đã chiến thắng ta... Thật phi thường...",
    en: "You... have defeated me... Truly extraordinary...",
    category: "monster_reaction",
    file: "voice_legendary_faint.mp3"
  }
};

// ========================================
// OVERWORLD EVENTS
// ========================================

const overworldScripts = {
  encounter_zone_kim: {
    vi: "Vùng Kim Sơn phía trước. Thần Thú kim loại sinh sống ở đây.",
    en: "Metal Mountain ahead. Metal Divine Beasts live here.",
    category: "overworld",
    file: "voice_encounter_zone_kim.mp3"
  },
  encounter_zone_moc: {
    vi: "Rừng Mộc Lâm phía trước. Cẩn thận với Thần Thú gỗ.",
    en: "Wood Forest ahead. Be careful of Wood Divine Beasts.",
    category: "overworld",
    file: "voice_encounter_zone_moc.mp3"
  },
  encounter_zone_thuy: {
    vi: "Đầm Thủy Trạch phía trước. Thần Thú nước rất mạnh.",
    en: "Water Marsh ahead. Water Divine Beasts are very strong.",
    category: "overworld",
    file: "voice_encounter_zone_thuy.mp3"
  },
  encounter_zone_hoa: {
    vi: "Núi Hỏa Sơn phía trước. Cảnh giác với Thần Thú lửa.",
    en: "Fire Mountain ahead. Watch out for Fire Divine Beasts.",
    category: "overworld",
    file: "voice_encounter_zone_hoa.mp3"
  },
  encounter_zone_tho: {
    vi: "Đồng Bằng Thổ Nguyên phía trước. Thần Thú đất rất kiên cường.",
    en: "Earth Plains ahead. Earth Divine Beasts are very resilient.",
    category: "overworld",
    file: "voice_encounter_zone_tho.mp3"
  },
  
  warning_danger: {
    vi: "Cẩn thận vùng nguy hiểm phía trước!",
    en: "Careful, dangerous area ahead!",
    category: "overworld",
    file: "voice_warning_danger.mp3"
  },
  safe_zone: {
    vi: "Đây là vùng an toàn. Hãy nghỉ ngơi.",
    en: "This is a safe zone. Rest here.",
    category: "overworld",
    file: "voice_safe_zone.mp3"
  },
  village_enter: {
    vi: "Chào mừng đến làng! Hãy giao lưu với dân làng!",
    en: "Welcome to the village! Talk to the villagers!",
    category: "overworld",
    file: "voice_village_enter.mp3"
  }
};

// ========================================
// UI FEEDBACK
// ========================================

const uiFeedbackScripts = {
  menu_open: {
    vi: "Menu mở.",
    en: "Menu opened.",
    category: "ui",
    file: "voice_menu_open.mp3"
  },
  menu_select: {
    vi: "Chọn.",
    en: "Select.",
    category: "ui",
    file: "voice_menu_select.mp3"
  },
  menu_back: {
    vi: "Quay lại.",
    en: "Back.",
    category: "ui",
    file: "voice_menu_back.mp3"
  },
  save_success: {
    vi: "Lưu game thành công!",
    en: "Game saved successfully!",
    category: "ui",
    file: "voice_save_success.mp3"
  },
  load_success: {
    vi: "Tải game thành công!",
    en: "Game loaded successfully!",
    category: "ui",
    file: "voice_load_success.mp3"
  },
  level_up: {
    vi: "Lên cấp! Sức mạnh tăng lên!",
    en: "Level up! Power increases!",
    category: "ui",
    file: "voice_level_up.mp3"
  }
};

// ========================================
// EXPORT ALL SCRIPTS
// ========================================

const allScripts = {
  ...storyScripts,
  ...tutorialScripts,
  ...characterSelectionScripts,
  ...battleScripts,
  ...elementAttackScripts,
  ...monsterReactionScripts,
  ...overworldScripts,
  ...uiFeedbackScripts
};

module.exports = {
  allScripts,
  storyScripts,
  tutorialScripts,
  characterSelectionScripts,
  battleScripts,
  elementAttackScripts,
  monsterReactionScripts,
  overworldScripts,
  uiFeedbackScripts,
  
  // Helper function to get all files
  getAllVoiceFiles: () => {
    return Object.values(allScripts).map(script => script.file);
  },
  
  // Helper function to get scripts by category
  getScriptsByCategory: (category) => {
    return Object.entries(allScripts)
      .filter(([_, script]) => script.category === category)
      .reduce((acc, [key, script]) => ({ ...acc, [key]: script }), {});
  }
};
