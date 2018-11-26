export function findArgument(key: string) {
  return process.argv
  .find(arg => arg.includes(key))
  .split('=')
  .pop();
}

export const isDev = findArgument('isDev') === 'true';