export const getCannotBeEmptyError = (value: string) =>
  `${value} cannot be empty. Please try again with a non-empty value`;

export const getNotSignedInErr = () => {
  const e = new Error('No signed in user');
  console.error(e.stack);
  throw e;
}