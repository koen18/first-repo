import { format, addDays, subDays } from 'date-fns';
import type { Exam, Subject, Task, UserProfile, Quiz, FlashcardDeck, Summary } from '../types/models';

const today = new Date();
const iso = (d: Date) => format(d, 'yyyy-MM-dd');

export const demoProfile: UserProfile = {
  id: 'local-demo',
  name: 'Sam',
  schoolLevel: 'havo',
  subjects: ['Wiskunde', 'Engels', 'Geschiedenis', 'Biologie'],
  schoolStartTime: '08:30',
  schoolEndTime: '15:00',
  onboarded: false,
};

export const demoSubjects: Subject[] = [
  { id: 'sub-wi', name: 'Wiskunde', colorIndex: 0 },
  { id: 'sub-en', name: 'Engels', colorIndex: 1 },
  { id: 'sub-ge', name: 'Geschiedenis', colorIndex: 2 },
  { id: 'sub-bi', name: 'Biologie', colorIndex: 3 },
];

export const demoExams: Exam[] = [
  {
    id: 'exam-ge-1',
    subjectId: 'sub-ge',
    topic: 'Koude Oorlog',
    date: iso(addDays(today, 4)),
    difficulty: 'medium',
    chapters: 3,
    material:
      'De Koude Oorlog was de periode van politieke spanning tussen de Verenigde Staten en de Sovjet-Unie van 1947 tot 1991. Belangrijke gebeurtenissen: de Marshallhulp, de Berlijnse Blokkade, de Cubacrisis en de val van de Berlijnse Muur in 1989.',
    planGenerated: true,
  },
];

export const demoTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Huiswerk Engels - hoofdstuk 4',
    subjectId: 'sub-en',
    date: iso(today),
    time: '16:00',
    durationMinutes: 30,
    priority: 'medium',
    done: false,
    kind: 'task',
    examId: null,
    notes: null,
  },
  {
    id: 'task-2',
    title: 'Wiskunde opgaven 12-18',
    subjectId: 'sub-wi',
    date: iso(today),
    time: '19:00',
    durationMinutes: 45,
    priority: 'high',
    done: false,
    kind: 'task',
    examId: null,
    notes: null,
  },
  {
    id: 'task-3',
    title: 'Voetbaltraining',
    subjectId: null,
    date: iso(today),
    time: '18:00',
    durationMinutes: 90,
    priority: 'low',
    done: false,
    kind: 'event',
    examId: null,
    notes: null,
  },
  {
    id: 'session-ge-1',
    title: 'Studeren Koude Oorlog - deel 1/3',
    subjectId: 'sub-ge',
    date: iso(addDays(today, 1)),
    time: '17:00',
    durationMinutes: 45,
    priority: 'high',
    done: false,
    kind: 'study_session',
    examId: 'exam-ge-1',
    notes: null,
  },
  {
    id: 'session-ge-2',
    title: 'Studeren Koude Oorlog - deel 2/3',
    subjectId: 'sub-ge',
    date: iso(addDays(today, 2)),
    time: '17:00',
    durationMinutes: 45,
    priority: 'high',
    done: false,
    kind: 'study_session',
    examId: 'exam-ge-1',
    notes: null,
  },
  {
    id: 'session-ge-3',
    title: 'Studeren Koude Oorlog - deel 3/3',
    subjectId: 'sub-ge',
    date: iso(addDays(today, 3)),
    time: '17:00',
    durationMinutes: 45,
    priority: 'high',
    done: false,
    kind: 'study_session',
    examId: 'exam-ge-1',
    notes: null,
  },
  {
    id: 'task-done-1',
    title: 'Biologie samenvatting hoofdstuk 2',
    subjectId: 'sub-bi',
    date: iso(subDays(today, 1)),
    time: '16:30',
    durationMinutes: 30,
    priority: 'medium',
    done: true,
    kind: 'task',
    examId: null,
    notes: null,
  },
];

export const demoQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    subjectId: 'sub-bi',
    title: 'Fotosynthese - oefentoets',
    questions: [
      {
        question: 'Wat is de belangrijkste input voor fotosynthese naast water?',
        options: ['Zuurstof', 'Koolstofdioxide', 'Stikstof', 'Methaan'],
        correctIndex: 1,
        explanation: 'Planten gebruiken CO2 samen met water en licht om glucose te maken.',
      },
      {
        question: 'Waar vindt fotosynthese plaats in de plantencel?',
        options: ['Mitochondrion', 'Celkern', 'Bladgroenkorrel', 'Celwand'],
        correctIndex: 2,
        explanation: 'Bladgroenkorrels (chloroplasten) bevatten chlorofyl dat licht vangt.',
      },
    ],
    createdAt: iso(subDays(today, 2)),
    lastScore: 80,
    attempts: 2,
  },
];

export const demoDecks: FlashcardDeck[] = [
  {
    id: 'deck-1',
    subjectId: 'sub-en',
    title: 'Engelse werkwoorden - irregular verbs',
    cards: [
      { front: 'go - went - ?', back: 'gone' },
      { front: 'see - saw - ?', back: 'seen' },
      { front: 'take - took - ?', back: 'taken' },
    ],
    createdAt: iso(subDays(today, 5)),
  },
];

export const demoSummaries: Summary[] = [];
