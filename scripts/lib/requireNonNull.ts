export const requireNonNull = (...args: any[]) => {
  if (args.filter(arg => !arg).length > 0) {
    const error = new Error('required parameters')
    console.error(error.message, { ...args })
    throw error;
  }
}
