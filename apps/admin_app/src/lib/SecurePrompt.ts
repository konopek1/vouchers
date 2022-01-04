export function securePrompt(message: string): string {
    let result = prompt(message);

    while(!result) {
        result = prompt(message);
    }

    //TODO dodać poprawnośc sprawdzenia hasła

    return result;
}