export type FeatureItem = string | { label: string; value?: string };

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Colour = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string; // matches Django's "name"
  slug: string;
  category: Category; // nested object
  description?: string; // can be blank
  overview?: string;
  features?: FeatureItem[];
  price: number;
  stock: number; // PositiveIntegerField
  image: string;
  colours: string[] | Colour[];
  // 👆 Depending on how your serializer returns it:
  // - ArrayField/JSONField → ["red", "blue"]
  // - ManyToManyField with serializer → [{id:1,name:"red"}, {id:2,name:"blue"}]

  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
};
