import { MdFlashOn, MdFavorite, MdLightbulb, MdOutlineBrush, MdPushPin, MdRocketLaunch } from 'react-icons/md';

// Crea el array de respuestas por defecto para una nueva pregunta de tipo Quiz.
export const createDefaultAnswers = () => [
    { placeholder: "Respuesta 1", text: "", color: "bg-orange-600/80", Icon: MdFlashOn, isOptional: false, isCorrect: true }, 
    { placeholder: "Respuesta 2", text: "", color: "bg-purple-700/80", Icon: MdFavorite, isOptional: false, isCorrect: false },
    { placeholder: "Respuesta 3", text: "", color: "bg-amber-500/80", Icon: MdLightbulb, isOptional: true, isCorrect: false },
    { placeholder: "Respuesta 4", text: "", color: "bg-cyan-700/80", Icon: MdOutlineBrush, isOptional: true, isCorrect: false },
];

// Crea las dos respuestas extra
export const createExtraAnswers = () => [
    { placeholder: "Respuesta 5", text: "", color: "bg-teal-500/80", Icon: MdPushPin, isOptional: true, isCorrect: false },
    { placeholder: "Respuesta 6", text: "", color: "bg-pink-500/80", Icon: MdRocketLaunch, isOptional: true, isCorrect: false },
];

// Crea un objeto de pregunta (o diapositiva) nuevo.
export const createNewSlide = (type = 'Quiz') => ({
    id: Date.now(),
    type: type,
    questionText: '',
    answers: type === 'Quiz' ? createDefaultAnswers() : [],
    imagen: null,
});