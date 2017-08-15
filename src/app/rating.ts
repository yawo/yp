import {Entry} from './entry';

export class Reaction {
  constructor(
    public ref: string,
    public rating: Rating,
    public userRef: string,
    public entryRef: string
  ) { }
}

export enum Rating {
  LIKE, UNLIKE
}
