// helpers/quizDataMapper.js

// Importamos las plantillas de respuestas para obtener los iconos y colores.
import { createDefaultAnswers, createExtraAnswers } from './quizHelpers';

// Creamos una lista maestra con todas las plantillas de respuesta posibles (1 a 6).
const allAnswerTemplates = [...createDefaultAnswers(), ...createExtraAnswers()];

/**
 * Transforma los datos crudos de la API de preguntas a la estructura de "slides"
 * que utiliza la interfaz de usuario.
 * @param {Array} apiQuestions - El array de preguntas del endpoint.
 * @returns {Array} Un array de "slides" listas para ser usadas en el estado.
 */
export const transformApiDataToSlides = (apiQuestions) => {
    if (!apiQuestions || !Array.isArray(apiQuestions)) {
        return [];
    }

    return apiQuestions.map(question => ({
        // Mapeo de campos de la pregunta
        id: question.id, // Mantenemos el ID de la BD para la pregunta (usado como slide.id)
        type: 'Quiz',
        questionText: question.texto,
        imagen: question.imagenUrl || null, // Si no hay imagen, dejamos null
        
        // Mapeo de respuestas
        answers: question.Respuestas.map((answer, index) => {
            // Obtenemos la plantilla (para icono, color, etc.) basado en su posición
            const template = allAnswerTemplates[index] || allAnswerTemplates[0];
            
            // Fusionamos la plantilla con los datos reales de la API
            return {
                ...template,
                id: answer.id, // <-- CAMBIO CLAVE: Conservamos el ID de la respuesta
                text: answer.textoRespuesta,
                isCorrect: answer.correcta,
            };
        }),
    }));
};