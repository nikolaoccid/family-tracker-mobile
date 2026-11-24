export interface MapMember {
  id: string;
  latitude?: number;
  longitude?: number;
  user?: { name?: string };
}

export interface MapZone {
  id: string;
  name: string;
  color: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  isActive: boolean;
}
