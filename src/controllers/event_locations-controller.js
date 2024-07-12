import express from "express";
import {Router} from 'express';
import { authenticateToken } from '../middlewares/auth-middleware.js';
import locationService from "../services/event-location-service.js"
const svc = new locationService()

const router =  Router();

router.get('/', async (req, res) => {
    const result = await svc.getAllEventLocations();
    if (result) {
        res.status(200).send(result);
    } else {
        res.status(500).send('Error interno');
    }
});



router.get('/:id', authenticateToken, async (req, res) => {
    const id = req.params.id;

    try {
        const eventLocation = await svc.getEventLocationById(id);
        if (!eventLocation) {
            return res.status(404).json({ message: 'Event location not found or not authorized.' });
        }
        res.status(200).json(eventLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user } = req.body;

    if (name == "" || full_address == ""||  name.length < 3|| full_address.length < 3 ) {
        return res.status(400).json({ message: 'El nombre o la direccion estan vacias o tienen menos de 3 caracteres' });
    }
    if (max_capacity <= 0) {
        return res.status(400).json({ message: 'Max capacity must be greater than zero.' });
    }

    try {
        const newEventLocation = await svc.createEventLocation({  id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user});
        res.status(201).json("Fue creado correctamente");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.put('/', authenticateToken, async (req, res) => {
    let respuesta;
    console.log(req.body);
    const { id, id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user} = req.body;
  
    if (!name || name.length < 3 || !full_address || full_address.length < 3) {
        return res.status(400).json({ message: 'Name or full address is invalid.' });
    }
    if (max_capacity <= 0) {
        return res.status(400).json({ message: 'Max capacity must be greater than zero.' });
    }

    try {
        const updatedEventLocation = await svc.updateEventLocation({id, id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user });
        console.log(updatedEventLocation);
        if (updatedEventLocation==" ") {
            respuesta = res.status(404).json({ message: 'Event location not found or not authorized.' });
        }else{
            respuesta = res.status(201).json("Se actualizó correctamente");
        }
    } catch (error) {
        respuesta =res.status(500).json({ message: error.message });
    }

    return respuesta;
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const id = req.params.id;

    try {
        const idEventLocation= await svc.getEventLocationById(id)
        if (!idEventLocation) { 
            res.status(404).send('La ubicacion del evento no existe');
            return;
        }
        await svc.deleteEventLocation(id);
        res.status(200).json("Se eliminó correctamente");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
