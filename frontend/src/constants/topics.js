// frontend/src/constants/topics.js
// YDT topic definitions with Turkish labels and question counts

export const TOPICS = [
  { key: 'vocabulary', label: 'Kelime', maxQuestions: 5 },
  { key: 'grammar', label: 'Dilbilgisi', maxQuestions: 10 },
  { key: 'cloze_test', label: 'Cloze Test', maxQuestions: 5 },
  { key: 'sentence_completion', label: 'Cümleyi Tamamlama', maxQuestions: 8 },
  { key: 'paragraph', label: 'Paragraf', maxQuestions: 15 },
  { key: 'dialogue_completion', label: 'Diyalog Tamamlama', maxQuestions: 5 },
  { key: 'similar_meaning', label: 'Anlamca Yakın Cümle', maxQuestions: 5 },
  { key: 'situational', label: 'Duruma Uygun İfade', maxQuestions: 5 },
  { key: 'coherence', label: 'Anlam Bütünlüğü', maxQuestions: 5 },
  { key: 'eng_to_tr', label: 'İNG→TR Çeviri', maxQuestions: 6 },
  { key: 'tr_to_eng', label: 'TR→İNG Çeviri', maxQuestions: 6 },
  { key: 'irrelevant_sentence', label: 'Anlam Bozan Cümle', maxQuestions: 5 },
];

export const TOTAL_QUESTIONS = TOPICS.reduce((sum, t) => sum + t.maxQuestions, 0); // 80
