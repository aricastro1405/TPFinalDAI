import EventLocationRepository from '../repositories/event-location-repository.js';

export default class EventLocationService {
  
  getAllEventLocations = async () => {
    const repo = new EventLocationRepository();
    const LocationsArray= await repo.getAllEventLocations();
    return LocationsArray
  }

  getEventLocationById = async (id) => {
    
    const repo = new EventLocationRepository();
    const Location=await repo.getEventLocationById(id);
    return Location;
  }

  createEventLocation = async (eventLocationData) => {
    const repo = new EventLocationRepository();
    const Location=await repo.createEventLocation(eventLocationData);
    return Location
  }

  updateEventLocation = async ({  id,id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user }) => {
    const repo = new EventLocationRepository();
    const Location= await repo.updateEventLocation({ id, id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user });
    return Location;
  }

  deleteEventLocation = async (id) => {
    const repo = new EventLocationRepository();
    await repo.deleteEventLocation(id);
  }
}
