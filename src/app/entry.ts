export class Entry {
  constructor(   
   public name: string,
   public description: string,
   public categories: Category[],
   public target: string[],
   public activiyZone: string[],
   public tags: string[]
  ) { }

  public contacts: Contact[];
  public address: Address;
  public pictureUrls: string[];
}

export class Contact {
  constructor(
    public name: string,
    public email: string, // TBV
    public phone: string, // to be validated
    public role: ContactRole
    ) { }
}

export class Address {
  constructor(
    public full: string,
    ) { }
    public line1: string;
    public postalCode: string;
    public town: string;
    public lat: number;
    public lon: number;
}

export enum Category {
  ASSOCIATION, RESTAURATION, MODE, ENTREPRISE
}

export enum ContactRole {
  PRESIDENT, MAINCONTACT, SECRETARY, OTHER
}
