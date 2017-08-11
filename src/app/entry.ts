export class Entry {
  key: string;
  name: string;
  description: string;
  contacts: Contact[];
  address: Address;
  categories: Category[];
  beneficiaires: string[];
  tags: string[];
  pictureUrls: string[];
}

export class Contact {
  name: string;
  email: string; // TBV
  phone: string; // to be validated
  role: ContactRole;
}

export class Address {
  full: string;
  line1: string;
  postalCode: string;
  town: string;
  lat: number;
  lon: number;
}

export enum Category {
  ASSOCIATION, RESTAURATION, MODE, ENTREPRISE
}

export enum ContactRole {
  PRESIDENT, MAINCONTACT, SECRETARY
}
