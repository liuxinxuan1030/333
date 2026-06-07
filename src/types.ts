export interface InkResult {
  dateStr: string; // YYYY-MM-DD
  inkFortune: string; // 今日墨运 (e.g., "宿墨")
  inkCharacter: string; // 今日字气 (e.g., "藏锋")
  paperType: string; // 今日纸性 (e.g., "熟宣")
  tiba: string; // 今日题跋 (e.g., "纸白留有余心。")
  ideals: string[]; // 今日宜 (e.g., ["神游", "摸鱼"])
  avoid: string; // 今日忌 (e.g., "回复导师")
  personality: string; // 今日人格 (e.g., "外冷内热，心事较重。")
  colorHex: string; // Accent color matching the ink theme
}

export type InkFortuneType = '宿墨' | '润墨' | '枯墨' | '淡墨' | '浓墨';
export type InkCharacterType = '藏锋' | '飞白' | '圆融' | '清逸' | '迟涩' | '沉静' | '劲健' | '疏朗';
export type PaperTypeCategory = '熟宣' | '生宣' | '澄心堂纸' | '竹纸' | '云母笺';
