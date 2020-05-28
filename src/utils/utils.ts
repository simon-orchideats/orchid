/**
 * Returns a fn, Chooser, that returns a random element in arr. Chooser always returns unique elements until all uniques
 * are returned at which point the chooser "resets". Upon a reset, Chooser returns another cycle of unique elements.
 * Therefore repeat values only occur from mulitple cycles.
 * @param arr the array which contains items to be chosen
 */
export const getItemChooser = <T>(
  arr: T[],
  filter: (t: T) => boolean = () => true
) => {
  let copy = arr.slice(0).filter(filter); //simonv filter verified
  return () => {
    if (copy.length < 1) {
      copy = arr.slice(0);
    }
    const index = Math.floor(Math.random() * copy.length);
    return copy.splice(index, 1)[0];
  };
}