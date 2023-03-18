import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Country {
  @Prop({ required: true })
  code!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  imageUrl?: string;
}

export type CountryDocument = HydratedDocument<Country>;
export const CountrySchema = SchemaFactory.createForClass(Country);
