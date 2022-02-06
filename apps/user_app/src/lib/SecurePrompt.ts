export function securePrompt(message: string): string {
    let result = prompt(message) as string;

    console.log(`set password: ${result}`)

    //TODO dodać poprawnośc sprawdzenia hasła
    return result;
}