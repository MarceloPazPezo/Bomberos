import banWords from "./banWords";

const shortBanList = ["puta", "culo", "pene", "mier", "pico", "ql", "ctm","puto","tetas","tula"]; // palabras ofensivas de 4 letras o menos

export function censurarTexto(texto = "") {
    let censurado = texto;

    for (const regex of banWords) {
        censurado = censurado.replace(regex, (match) => {
            const cleanMatch = match
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[\W_]+/g, "")
                .toLowerCase();

            if (
                cleanMatch.length >= 5 ||
                shortBanList.includes(cleanMatch)
            ) {
                return "*".repeat(match.length);
            } else {
                return match;
            }
        });
    }

    return censurado;
}
