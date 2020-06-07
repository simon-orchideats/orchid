export type TagType = 'cuisine' | 'diet'

export const TagTypes: {
  Cuisine: 'cuisine',
  Diet: 'diet'
} = {
  Cuisine: 'cuisine',
  Diet: 'diet'
}

export interface ITag {
  readonly name: string
  readonly type: TagType
}

export class Tag implements ITag {
  readonly name: string
  readonly type: TagType

  constructor(tag: ITag) {
    this.name = tag.name;
    this.type = tag.type;
  }

  public get Name() { return this.name }
  public get Type() { return this.type }

  static getICopy(t: ITag) {
    return {
      name: t.name,
      type: t.type,
    }
  }

  static isEqual(t1: ITag, t2: ITag) {
    return t1.name === t2.name && t1.type === t2.type;
  }

  static areTagsEqual(t1: Tag[], t2: Tag[]) {
    if (t1.length !== t2.length) return false;
    const t1Copy = t1.map(t => Tag.getICopy(t));
    const t2Copy = t2.map(t => Tag.getICopy(t));
    for (let i = 0; i < t1.length; i++) {
      const findIndex = t2Copy.findIndex(t => Tag.isEqual(t1[i], t));
      if (findIndex === -1) return false;
      t2Copy.slice(findIndex, 1);
    }
    for (let i = 0; i < t2.length; i++) {
      const findIndex = t1Copy.findIndex(t => Tag.isEqual(t2[i], t));
      if (findIndex === -1) return false;
      t1Copy.slice(findIndex, 1);
    }
    return true;
  }

  static getCuisines(tags: ITag[]) {
    return tags.filter(t => t.type === TagTypes.Cuisine).map(t => t.name);
  }
}

export interface ECuisine extends ITag {
  readonly type: 'cuisine'
}

export interface EDiet extends ITag {
  readonly type: 'diet'
}