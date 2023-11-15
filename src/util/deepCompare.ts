/**
 * Deep compare any two objects
 */
export const deepCompare = (obj1: unknown, obj2: unknown): boolean => {
  if (!obj1 || !obj2) return obj1 == obj2;
  else if (obj1 instanceof Object && obj2 instanceof Object) {
    return (
      Object.keys(obj1).length === Object.keys(obj2).length &&
      Object.keys(obj1).every((key) => {
        return (
          obj2.hasOwnProperty(key) &&
          deepCompare(
            (obj1 as { [x: string]: unknown })[key],
            (obj2 as { [x: string]: unknown })[key]
          )
        );
      })
    );
  } else return obj1 == obj2;
};
