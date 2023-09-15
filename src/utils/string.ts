/**
 * Check the given parameter is string or not.
 *
 * @param {any} text
 * @returns {boolean}
 */
export function isString(text: any): boolean {
  return typeof text === "string";
}

/**
 * Camel case given word or sentence, separator replaces to capital letters.
 * E.g. example_text => exampleText.
 *
 * @param {string} text
 * @param {string} [separator='_']
 * @returns string
 */
export function camelcase(text: string, separator = "_"): string {
  if (!isString(text)) {
    return text;
  }

  const words = text.split(separator);

  return [
    words[0],
    ...words
      .slice(1)
      .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`),
  ].join("");
}

export function generateRandomString(length: number): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
