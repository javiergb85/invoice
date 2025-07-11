export type Left<L> = { _tag: 'Left'; value: L };
export type Right<R> = { _tag: 'Right'; value: R };
export type Either<L, R> = Left<L> | Right<R>;

export const left = <L, R>(l: L): Either<L, R> => ({ _tag: 'Left', value: l });
export const right = <L, R>(r: R): Either<L, R> => ({ _tag: 'Right', value: r });

export const fold = <L, R, T>(
  either: Either<L, R>,
  onLeft: (l: L) => T,
  onRight: (r: R) => T
): T => {
  if (either._tag === 'Left') {
    return onLeft(either.value);
  } else {
    return onRight(either.value);
  }
};