import { TripStatus } from 'src/types';
import { DestinationDto } from './dto/destination.dto';

export interface GetTripsForUserParameters {
  userId: string;
  filters?: GetTripFilter;
}

export type GetTripFilter = {
  invitedUsers?: string[];
  status?: TripStatus[];
  destinations?: DestinationDto[];
};
