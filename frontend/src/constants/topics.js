// frontend/src/constants/topics.js
// YDT topic definitions with Turkish labels and question counts

export const TOPICS = [
  { key: 'vocabulary', label: 'Kelime', enLabel: 'Vocabulary', maxQuestions: 5 },
  { key: 'grammar', label: 'Dilbilgisi', enLabel: 'Grammar', maxQuestions: 10 },
  { key: 'cloze_test', label: 'Cloze Test', enLabel: 'Cloze Test', maxQuestions: 5 },
  { key: 'sentence_completion', label: 'Cümleyi Tamamlama', enLabel: 'Sentence Completion', maxQuestions: 8 },
  { key: 'paragraph', label: 'Paragraf', enLabel: 'Reading Comprehension', maxQuestions: 15 },
  { key: 'dialogue_completion', label: 'Diyalog Tamamlama', enLabel: 'Dialogue Completion', maxQuestions: 5 },
  { key: 'similar_meaning', label: 'Anlamca Yakın Cümle', enLabel: 'Restatement', maxQuestions: 5 },
  { key: 'situational', label: 'Duruma Uygun İfade', enLabel: 'Situational Expression', maxQuestions: 5 },
  { key: 'coherence', label: 'Anlam Bütünlüğü', enLabel: 'Paragraph Completion', maxQuestions: 5 },
  { key: 'eng_to_tr', label: 'İNG→TR Çeviri', enLabel: 'Translation (Eng-Tr)', maxQuestions: 6 },
  { key: 'tr_to_eng', label: 'TR→İNG Çeviri', enLabel: 'Translation (Tr-Eng)', maxQuestions: 6 },
  { key: 'irrelevant_sentence', label: 'Anlam Bozan Cümle', enLabel: 'Irrelevant Sentence', maxQuestions: 5 },
];

export const TOTAL_QUESTIONS = TOPICS.reduce((sum, t) => sum + t.maxQuestions, 0); // 80
