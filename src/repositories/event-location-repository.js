import pool from "../configs/db-config.js";
import pkg from "pg";
const { Pool } = pkg;

export default class EventLocationRepository {
 

    async getAllEventLocations() {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM event_locations');
            return result.rows;
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }
    getEventLocationById = async (id) => {
        const client = await pool.connect();
        try {
            const result = await client.query(`SELECT * FROM event_locations WHERE id=${id}`);
            return result;
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }
    createEventLocation = async (entity) => {
        let rowsAffected = 0;
        const client = await pool.connect();
        try {
            const sql = `
                INSERT INTO event_locations
                    (id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user)
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7)
            `;
            const values = [entity.id_location, entity.name, entity.full_address, entity.max_capacity, entity.latitude, entity.longitude, entity.id_creator_user];
            const result = await client.query(sql, values);
            await client.end();
            rowsAffected = result.rowCount;
        }
        catch (error){
            console.log(error);
            await client.end();
        }
        return rowsAffected;
    }
    updateEventLocation = async ({ id, id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user }) => {
        const client = await pool.connect();
        try {
         /*   const result = await client.query(`
            UPDATE event_locations
            SET id_location = ${id_location}, name = ${name}, full_address = ${full_address}, max_capacity =  ${max_capacity}, latitude =  ${latitude}, longitude = ${longitude}, id_creator_user = ${id_creator_user}
            WHERE id =  ${id}
       `)*/
       const result = await client.query(`
       UPDATE event_locations
       SET id_location = $1, name = $2, full_address = $3, max_capacity =  $4, latitude =  $5, longitude = $6, id_creator_user = $7
       WHERE id =  $8
  `, [id_location, name, full_address, max_capacity, latitude, longitude, id_creator_user, id])
       console.log(result)
        return result;
        } finally {
            client.release();
        }
    }
    deleteEventLocation = async (id) => {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM event_locations WHERE id = $1', [id]);
        } finally {
            client.release();
        }
    };
}
