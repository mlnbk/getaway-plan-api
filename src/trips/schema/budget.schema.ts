import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Budget {
  @Prop()
  total!: string;

  @Prop()
  accomodation?: string;

  @Prop()
  transportation?: string;

  @Prop()
  food?: string;

  @Prop()
  activites?: string;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
