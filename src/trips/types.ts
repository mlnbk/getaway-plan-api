import { TripStatus } from 'src/types';
import { DestinationDto } from './dto/destination.dto';
import { TripDocument } from './schema/trip.schema';

export interface GetTripsForUserParameters {
  userId: string;
  filters?: GetTripFilter;
  skip: number;
  limit: number;
  sortBy?: string;
  asc?: boolean;
}

export class GetTripsForUserResponse {
  trips!: TripDocument[];
  total?: number;
  hasMore!: boolean;
}

export type GetTripFilter = {
  invitedUsers?: string[];
  status?: TripStatus[];
  destinations?: DestinationDto[];
};
