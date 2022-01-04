export function securePrompt(message: string): string {
    let result = prompt(message) || '';

    //TODO dodać poprawnośc sprawdzenia hasła
    return result;
}