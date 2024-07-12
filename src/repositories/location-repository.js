import pool from "../configs/db-config.js";
import pkg from "pg";
const { Pool } = pkg;

export default class EventLocationsRepository {
 

    async getAllLocations() {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM locations');
            return result.rows;
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }

    async getLocationById(id) {
        const client = await pool.connect();
        try {
            const result = await client.query(`SELECT * FROM locations WHERE id = ${id}`);
            return result.rows[0];
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }

    async getEventLocation(id) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM event_locations WHERE id_location = $1', [id]);
            console.log(result.rows);
            return result.rows;
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }
}
