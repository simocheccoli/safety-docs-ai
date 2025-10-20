import { OutputField } from "@/types/risk";

export function generateAIPrompt(
  riskName: string,
  inputExpectations: string,
  outputStructure: OutputField[]
): string {
  const structureDescription = generateStructureDescription(outputStructure);
  
  return `Sei un esperto di sicurezza sul lavoro specializzato nell'analisi del rischio: ${riskName}.

Il tuo compito è analizzare documenti e estrarre informazioni strutturate secondo le seguenti specifiche:

## CONTESTO E ASPETTATIVE
${inputExpectations || "Nessuna aspettativa specifica definita."}

## STRUTTURA OUTPUT RICHIESTA
${structureDescription}

## ISTRUZIONI
1. Analizza attentamente il documento fornito
2. Estrai le informazioni rilevanti seguendo esattamente la struttura definita
3. Se un campo obbligatorio non è presente nel documento, segnalalo esplicitamente
4. Mantieni i formati e i tipi di dati specificati
5. Per i campi array, estrai tutti i valori rilevanti trovati
6. Assicurati che l'output sia un JSON valido e conforme alla struttura

## OUTPUT
Fornisci l'output come JSON valido, senza commenti o testo aggiuntivo.`;
}

function generateStructureDescription(fields: OutputField[], level: number = 0): string {
  const indent = "  ".repeat(level);
  let description = "";

  fields.forEach(field => {
    const required = field.required ? " (OBBLIGATORIO)" : " (opzionale)";
    description += `${indent}- ${field.name}: ${field.type}${required}\n`;
    if (field.description) {
      description += `${indent}  Descrizione: ${field.description}\n`;
    }
    
    if (field.children && field.children.length > 0) {
      description += `${indent}  Campi:\n`;
      description += generateStructureDescription(field.children, level + 2);
    }
  });

  return description;
}
