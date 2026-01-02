// Ce fichier est un "Stub" (un bouche-trou) temporaire.
// Il permet au site de démarrer même si la configuration Convex n'est pas finie.
// Dès que vous ferez 'npx convex dev' avec succès, ce fichier sera écrasé par le vrai.

const stubHandler = "stub:handler";

/** @type {any} */
export const api = {
  main: {
    listMessages: stubHandler,
    sendMessage: stubHandler,
    listAnnouncements: stubHandler,
    postAnnouncement: stubHandler,
    deleteAnnouncement: stubHandler,
    listSchedule: stubHandler,
    addScheduleItem: stubHandler,
    deleteScheduleItem: stubHandler,
    checkQuizSubmission: stubHandler,
    submitQuizResult: stubHandler,
    login: stubHandler,
    register: stubHandler,
    getUser: stubHandler
  },
  actions: {
    translateText: stubHandler,
    generateQuiz: stubHandler
  }
};
