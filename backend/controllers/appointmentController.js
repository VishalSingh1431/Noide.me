import pool from '../config/database.js';
import { sendAppointmentConfirmation } from '../utils/emailService.js';
import Business from '../models/Business.js';

/**
 * Create a new appointment
 */
export const createAppointment = async (req, res) => {
  try {
    const { businessId } = req.params;
    const {
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      appointmentTime,
      serviceType,
      notes,
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        error: 'Missing required fields: customerName, customerPhone, appointmentDate, appointmentTime',
      });
    }

    // Validate date is in the future
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        error: 'Appointment date and time must be in the future',
      });
    }

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if appointment slot is available
    const existingAppointment = await pool.query(
      `SELECT * FROM appointments 
       WHERE business_id = $1 
       AND appointment_date = $2 
       AND appointment_time = $3 
       AND status IN ('pending', 'confirmed')`,
      [businessId, appointmentDate, appointmentTime]
    );

    if (existingAppointment.rows.length > 0) {
      return res.status(400).json({
        error: 'This time slot is already booked. Please choose another time.',
      });
    }

    // Create appointment
    const result = await pool.query(
      `INSERT INTO appointments (
        business_id, customer_name, customer_email, customer_phone,
        appointment_date, appointment_time, service_type, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        businessId,
        customerName,
        customerEmail || null,
        customerPhone,
        appointmentDate,
        appointmentTime,
        serviceType || null,
        notes || null,
        'pending',
      ]
    );

    const appointment = result.rows[0];

    // Send confirmation email if email provided
    if (customerEmail) {
      await sendAppointmentConfirmation(
        customerEmail,
        customerName,
        business.businessName,
        appointmentDate,
        appointmentTime
      );
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        id: appointment.id,
        customerName: appointment.customer_name,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

/**
 * Get appointments for a business
 */
export const getBusinessAppointments = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { status, startDate, endDate } = req.query;

    let query = 'SELECT * FROM appointments WHERE business_id = $1';
    const params = [businessId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND appointment_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND appointment_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ' ORDER BY appointment_date DESC, appointment_time DESC';

    const result = await pool.query(query, params);

    res.json({
      appointments: result.rows.map(row => ({
        id: row.id,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        appointmentDate: row.appointment_date,
        appointmentTime: row.appointment_time,
        serviceType: row.service_type,
        notes: row.notes,
        status: row.status,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await pool.query(
      `UPDATE appointments 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, appointmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment status updated successfully',
      appointment: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
};

/**
 * Get available time slots for a business on a specific date
 */
export const getAvailableSlots = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Get business hours for the day
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const businessHours = business.businessHours?.[dayOfWeek] || {};

    if (!businessHours.open) {
      return res.json({ availableSlots: [], message: 'Business is closed on this day' });
    }

    // Get booked appointments for the date
    const bookedAppointments = await pool.query(
      `SELECT appointment_time FROM appointments 
       WHERE business_id = $1 
       AND appointment_date = $2 
       AND status IN ('pending', 'confirmed')`,
      [businessId, date]
    );

    const bookedTimes = bookedAppointments.rows.map(row => row.appointment_time);

    // Generate available time slots (every 30 minutes)
    const availableSlots = [];
    const [startHour, startMinute] = businessHours.start.split(':').map(Number);
    const [endHour, endMinute] = businessHours.end.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      const timeObj = new Date(`${date}T${timeString}`);

      // Check if time is in the past
      if (timeObj > new Date()) {
        // Check if slot is not booked
        const isBooked = bookedTimes.some(bookedTime => {
          const booked = new Date(`${date}T${bookedTime}`);
          return Math.abs(booked - timeObj) < 30 * 60 * 1000; // 30 minutes
        });

        if (!isBooked) {
          availableSlots.push(timeString);
        }
      }

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

