import pkg from 'pg'
import DBConfig from "../configs/db-config.js"
import pool from "../configs/db-config.js";
const { Client, Pool } = pkg;
export default class EventRepository {
    searchEvents = async (filters) => {
    const client = await pool.connect();
    const { name, category, startdate, tag, limit, offset } = filters;
    const conditions = [];
    const values = [];

    if (name) {
        values.push(`%${name}%`);
        conditions.push(`e.name ILIKE $${values.length}`);
    }
    if (category) {
        values.push(`%${category}%`);
        conditions.push(`c.name ILIKE $${values.length}`);
    }
    if (startdate) {
        values.push(startdate);
        conditions.push(`DATE(e.start_date) = $${values.length}`);
        console.log(values.length);
    }
    if (tag) {
        values.push(`%${tag}%`);
        conditions.push(`t.name ILIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
        SELECT 
            e.id, e.name, e.description, e.start_date, e.duration_in_minutes, e.price, e.enabled_for_enrollment, el.max_capacity,
            u.id as creator_user_id, u.first_name as creator_user_first_name, u.last_name as creator_user_last_name, u.username as creator_user_username,
            c.id as category_id, c.name as category_name,
            el.id as location_id, el.name as location_name, el.full_address as location_full_address
        FROM events e
        JOIN users u ON e.id_creator_user = u.id
        JOIN event_categories c ON e.id_event_category = c.id
        JOIN event_locations el ON e.id_event_location = el.id
        LEFT JOIN event_tags et ON e.id = et.id_event
        LEFT JOIN tags t ON et.id_tag = t.id
        ${whereClause}
        ORDER BY e.start_date DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    try {
        const res = await client.query(query, values);

        const countQuery = `
            SELECT COUNT(*)
            FROM events e
            JOIN event_categories c ON e.id_event_category = c.id
            LEFT JOIN event_tags et ON e.id = et.id_event
            LEFT JOIN tags t ON et.id_tag = t.id
            ${whereClause}
        `;
        const countRes = await client.query(countQuery, values.slice(0, values.length - 2));
        const total = parseInt(countRes.rows[0].count, 10);

        return {
            events: res.rows,
            total
        };
    } finally {
        client.release();
    }
};

 getById = async (eventId) => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM events WHERE id = $1', [eventId]);
        return res.rows[0];
   
    } finally {
        client.release();
    }
};
//5
listParticipantes = async (params) => {
    let returnObject = null;
    const client = await pool.connect();
    const adds = ['e.name', 'ec.name', 'e.start_date', 't.name']
    try {
        const res = await client.query ( `
        SELECT 
        json_agg(json_build_object(
            'id', e.id,
            'name', e.name,
            'description', e.description,
            'event_category', json_build_object(
                'id', ec.id,
                'name', ec.name
            ),
            'event_location', json_build_object(
                'id', el.id,
                'name', el.name,
                'full_address', el.full_address,
                'max_capacity', el.max_capacity,
                'latitude', el.latitude,
                'longitude', el.longitude,
                'location', json_build_object(
                    'id', l.id,
                    'name', l.name,
                    'latitude', l.latitude,
                    'longitude', l.longitude,
                    'province', json_build_object(
                        'id', pr.id,
                        'name', pr.name,
                        'full_name', pr.full_name,
                        'latitude', pr.latitude,
                        'longitude', pr.longitude,
                        'display_order', pr.display_order
                    )
                )
            ),
            'start_date', e.start_date,
            'duration_in_minutes', e.duration_in_minutes,
            'price', e.price,
            'enabled_for_enrollment', e.enabled_for_enrollment,
            'max_assistance', e.max_assistance,
            'creator_user', json_build_object(
                'id', u.id,
                'username', u.username,
                'first_name', u.first_name,
                'last_name', u.last_name
            ),
            'tags', (
                SELECT json_agg(json_build_object('id', tags.id, 'name', tags.name)) 
                FROM tags 
                JOIN event_tags et ON tags.id = et.id_tag 
                WHERE et.id_event = e.id
            )
        ))
        FROM events e
        INNER JOIN event_categories ec ON e.id_event_category = ec.id
        INNER JOIN event_locations el ON e.id_event_location = el.id
        INNER JOIN locations l ON el.id_location = l.id
        INNER JOIN provinces pr ON l.id_province = pr.id
        INNER JOIN users u ON e.id_creator_user = u.id
        INNER JOIN event_tags et ON e.id = et.id_event
        INNER JOIN tags t ON et.id_tag = t.id 
        `);
        let values = [];
        
        adds.forEach((add, index) => {
            if(params[index] != null){
                values.push(params[index]);
                if (values.length == 1){res += ' WHERE '}
                res += `${add} = $${values.length}`;
                if (index < adds.length - 1) {
                    res += ' AND ';
                }
            }
        });
        if (res.endsWith(' AND ')){res = res.slice(0, -5)}
        console.log(res);
        console.log(values);
        const result = await client.query(res, values);
        await client.end();
        returnObject = result.rows[0];
    }
    catch (error){
        console.log(error);
    }
    return returnObject;
}

    getByIdAsync = async (id) => {
        const query = `
          SELECT 
            e.id, e.name, e.description, e.startdate,
            l.name as locations, 
            p.name as provinces
          FROM  events  e
          JOIN locations l ON e.id_location = l.id
          JOIN provinces p ON l.id_province = p.id
          WHERE e.id=${id}
        `;
        const values = [id];
        console.log(id);
        try {
          const { rows } = await pool.query(query, values); 
          return rows[0];
         
        } catch (error) {
          console.error('Error al obtener el evento:', error);
          throw error;
        }
      }
//8
    getMaxCapacity = async (id_event_location) => {
    const client = await pool.connect();
    try {
        const res = await client.query(
        `SELECT max_capacity from event_locations el
        INNER JOIN events e ON  e.id_event_location = el.id
        WHERE e.id_event_location= ${id_event_location}
        `
        );
        return res.rows[0];
    } finally {
        client.release();
    }
};
    createEvent = async (eventData) => {
        const { id, name, description,  id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user } = eventData;
        const client = await pool.connect();
        try {
            const res = await client.query(
                'INSERT INTO events ( id, name, description,  id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
                [ id, name, description,  id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user]
            );
            return res.rows[0];
        } finally {
            client.release();
        }
    };
    updateEvent = async (eventData) => {
        const {id, name, description,  id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user} = eventData;
        const client = await pool.connect();
        try {
            const res = await client.query(
                'UPDATE events SET name = $1, description = $2, id_event_category=$3, id_event_location=$4, start_date=$5, duration_in_minutes=$6, price=$7, enabled_for_enrollment=$8, max_assistance=$9 ,id_creator_user =$10 WHERE id = $11 RETURNING *',
                [name, description,  id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user, id]
            );
            return res.rows[0];
        } finally {
            client.release();
        }
    };
    deleteEvent = async (id) => {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM events WHERE id = $1', [id]);
        } finally {
            client.release();
        }
    };
    async enrollAsync(id, userId) {
        const client = await pool.connect();
        try {
            const response = await client.query(
                `SELECT COUNT(*) AS enrolled, e.max_assistance
                FROM event_enrollments ee
                INNER JOIN events e ON ee.id_event = e.id
                WHERE ee.id_user = $1 AND ee.id_event = $2
                GROUP BY e.max_assistance`,
                [userId, id]
            );
            if (response.rowCount > 0) {
                if (response.rows[0].enrolled >= response.rows[0].max_assistance) {
                    return false;
                }
            }
        }
        catch (error) {
            console.error(error);
            return false;
        }
        try {
            await client.query(
                `INSERT INTO event_enrollments (id_user, id_event, registration_date_time)
                VALUES ($1, $2, now())`,
                [userId, id]
            );
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async unenrollAsync(id, userId) {
        const client = await pool.connect();
        let response;
        try {
            response = await client.query(
                `SELECT COUNT(*) AS enrolled, e.start_date
                FROM event_enrollments
                INNER JOIN events e ON event_enrollments.id_event = e.id
                WHERE id_user = $1 AND id_event = $2
                GROUP BY e.start_date`,
                [userId, id]
            );
            if (!response) {
                return 404;
            }
        }
        catch (error) {
            console.error(error);
            return 404;
        }
        /*if ( Date.now() > response.rows[0].start_date) {
            return 400;
        }*/
        try {
            await client.query(
                `DELETE FROM event_enrollments WHERE id_user = $1 AND id_event = $2`,
                [userId, id]
            );
            return 200;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    async rateEventRepo (eventId, userId, rating, observations) {
        const client = await pool.connect();
        try {
            // Verificar si el usuario está registrado al evento
            const enrollmentRes = await client.query('SELECT * FROM event_enrollments WHERE id_user = $1 AND id_event = $2', [userId, eventId]);
            if (enrollmentRes.rows.length === 0) {
                return { status: 400, message: 'El usuario no está registrado al evento.' };
            }
    
            const eventRes = await client.query('SELECT * FROM events WHERE id = $1', [eventId]);
            const event = eventRes.rows[0];
            if (!event) {
                return { status: 404, message: 'Evento no encontrado.' };
            }
            const currentTime = new Date();
            const eventEndDate = new Date(event.start_date);
    
            if (rating < 1 || rating > 10) {
                return { status: 400, message: 'El rating debe estar entre 1 y 10 (inclusive).' };
            }
            if (eventEndDate >= currentTime) {
                return { status: 400, message: 'El evento no ha finalizado aún.' };
            }
            const numericRating = Number(rating);
            const updateQuery = 'UPDATE event_enrollments SET rating = $1, observations = $2 WHERE id_event = $3 AND id_user = $4';
            const updateValues = [numericRating, observations, eventId, userId];
            const updateRes = await client.query(updateQuery, updateValues);
    
            if (updateRes.rowCount === 0) {
                return { status: 500, message: 'Error al actualizar el rating.' };
            }
            const postUpdateRes = await client.query('SELECT rating, observations FROM event_enrollments WHERE id_event = $1 AND id_user = $2', [eventId, userId]);
    
            if (postUpdateRes.rows[0].rating !== numericRating) {
                return { status: 500, message: 'El rating no se actualizó correctamente en la base de datos.' };
            }
    
            return { message: 'Evento rankeado correctamente.' };
        } finally {
            client.release();
        } 
    };
}
