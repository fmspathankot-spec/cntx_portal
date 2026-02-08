import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('serviceType'); // 'maan' or 'madm'
    const arNumber = searchParams.get('arNumber'); // 'AR-1' or 'AR-2'

    // Default to MAAN if not specified
    const table = serviceType === 'madm' ? 'afnet_madm_services' : 'afnet_maan_services';

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_services,
        COUNT(DISTINCT ar_number) as total_ars,
        COUNT(DISTINCT network_type) as network_types
      FROM ${table}
    `;
    
    const statsResult = await pool.query(statsQuery);
    const statistics = statsResult.rows[0];

    // Get AR-wise counts
    const arStatsQuery = `
      SELECT 
        ar_number,
        COUNT(*) as service_count
      FROM ${table}
      GROUP BY ar_number
      ORDER BY ar_number
    `;
    
    const arStatsResult = await pool.query(arStatsQuery);
    const arStatistics = arStatsResult.rows;

    // If AR number specified, get services for that AR
    if (arNumber) {
      const servicesQuery = `
        SELECT *
        FROM ${table}
        WHERE ar_number = $1
        ORDER BY sr_no
      `;
      
      const servicesResult = await pool.query(servicesQuery, [arNumber]);
      
      return NextResponse.json({
        success: true,
        serviceType: serviceType || 'maan',
        arNumber,
        services: servicesResult.rows,
        statistics,
        arStatistics
      });
    }

    // Return overview
    return NextResponse.json({
      success: true,
      serviceType: serviceType || 'maan',
      statistics,
      arStatistics
    });

  } catch (error) {
    console.error('Error fetching AFNET data:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, serviceType, ...updateData } = body;

    const table = serviceType === 'madm' ? 'afnet_madm_services' : 'afnet_maan_services';

    // Build update query dynamically
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE ${table}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);

    return NextResponse.json({
      success: true,
      service: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating AFNET service:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
