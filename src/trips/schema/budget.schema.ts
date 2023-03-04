import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Budget {
  @Prop()
  total?: number;

  @Prop()
  accomodation?: number;

  @Prop()
  transportation?: number;

  @Prop()
  food?: number;

  @Prop()
  activites?: number;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
