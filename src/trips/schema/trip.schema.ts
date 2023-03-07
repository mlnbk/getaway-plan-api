import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

import { Budget, BudgetSchema } from './budget.schema';
import { Destination, DestinationSchema } from './destination.schema';
import { User } from '../../users/schema/user.schema';

@Schema({ timestamps: true })
export class Trip {
  @Prop()
  name?: string;

  @Prop()
  description?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user!: User;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'User' }] })
  invitedUsers?: User[];

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: [DestinationSchema], required: true })
  destinations!: Destination[];

  @Prop({ type: BudgetSchema })
  budget?: Budget;

  @Prop()
  pictures?: string[];
}

export type TripDocument = HydratedDocument<Trip>;
export const TripSchema = SchemaFactory.createForClass(Trip);
