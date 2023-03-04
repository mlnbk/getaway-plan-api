import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Destination {
  @Prop({ required: true })
  country!: string;

  @Prop()
  city?: string;

  @Prop()
  address?: string;
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);
