import EventsRepository from '../repositories/events-repository.js';
export default class EventsService {
    getAllAsync = async () => {
        const repo = new EventsRepository();
        const EventsArray = await repo.getAllAsync();
        return EventsArray;
    }
     searchEvents = async (filters) => {
        const repo = new EventsRepository();
        const EventsArray = await repo.searchEvents(filters);
        return EventsArray;
    };
    getById = async (id) => {
        const repo = new EventsRepository();
        const Evento = await repo.getById(id)
        return Evento;
    }
    listParticipantes= async (params) => {
        const repo = new EventsRepository();
        const EventsArray = await repo.listParticipantes(params);
        return EventsArray;
    };
     getEventoById = async (id) => {
        const repo = new EventsRepository();
        const EventsArray = await repo.getByIdAsync(id);
        return EventsArray;
    }
    //8
    createEvent = async (eventData) => {
        const repo = new EventsRepository();
        const EventsArray = await repo.createEvent(eventData);
        return EventsArray;
    };
    getMaxCapacity = async (id_event_location) => {
        const repo = new EventsRepository();
        const maxc = await repo.getMaxCapacity(id_event_location);
       
        return maxc;
    }
    updateEvent = async (eventData) => {
        const repo = new EventsRepository();
        const EventsArray = await repo.updateEvent(eventData);
        return EventsArray;
    };
    deleteEvent= async (id) => {
        const repo = new EventsRepository();
        await repo.deleteEvent(id);
    };
    enrollAsync(id, userId) {
        const repo = new EventsRepository();
        return repo.enrollAsync(id, userId);
    }

    unenrollAsync(id, userId) {
        const repo = new EventsRepository();
        return repo.unenrollAsync(id, userId);
    }
    rateEvent = async (eventId, userId, rating, observations) => {
        const repo = new EventsRepository();
        return await repo.rateEventRepo(eventId, userId, rating, observations);
    };
    
}
