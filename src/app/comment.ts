import {Entry} from './entry';

export class Comment {
  constructor(
    public ref: string,
    public content: string,
    public userRef: string,
    public entryRef: string
  ) { }
}
