/**
 * Quick script to check if there are any sales or reservations for today
 */
const { Pool } = require('pg');

// Configure database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tailtown',
  password: 'postgres',
  port: 5433,
});

async function checkTodaysData() {
  const client = await pool.connect();
  
  try {
    console.log('======= CHECKING DATA FOR TODAY =======');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log(`Today's date: ${todayStr}`);
    
    // Check reservations for today
    const reservationsQuery = `
      SELECT r.id, r.start_time, r.end_time, r.status, r.total_price, c.first_name, c.last_name
      FROM reservations r
      JOIN customers c ON r.customer_id = c.id
      WHERE DATE(r.start_time) = $1
      ORDER BY r.start_time;
    `;
    
    const reservationsResult = await client.query(reservationsQuery, [todayStr]);
    console.log(`\nReservations for today: ${reservationsResult.rowCount}`);
    
    if (reservationsResult.rowCount > 0) {
      console.table(reservationsResult.rows);
    }
    
    // Check financial transactions for today
    const transactionsQuery = `
      SELECT 
        t.id, 
        t.transaction_date, 
        t.total_amount, 
        t.status,
        c.first_name, 
        c.last_name
      FROM financial_transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE DATE(t.transaction_date) = $1
      ORDER BY t.transaction_date;
    `;
    
    const transactionsResult = await client.query(transactionsQuery, [todayStr]);
    console.log(`\nFinancial transactions for today: ${transactionsResult.rowCount}`);
    
    if (transactionsResult.rowCount > 0) {
      console.table(transactionsResult.rows);
    }
    
    // Check if reservations have corresponding financial transactions
    console.log('\nChecking for reservations without financial transactions:');
    const unmatchedQuery = `
      SELECT 
        r.id as reservation_id, 
        r.start_time, 
        r.total_price,
        c.first_name, 
        c.last_name, 
        r.status
      FROM reservations r
      JOIN customers c ON r.customer_id = c.id
      LEFT JOIN reservation_financial_links rfl ON r.id = rfl.reservation_id
      WHERE DATE(r.start_time) = $1
      AND rfl.financial_transaction_id IS NULL
      ORDER BY r.start_time;
    `;
    
    const unmatchedResult = await client.query(unmatchedQuery, [todayStr]);
    console.log(`Reservations without financial transactions: ${unmatchedResult.rowCount}`);
    
    if (unmatchedResult.rowCount > 0) {
      console.table(unmatchedResult.rows);
    }
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    client.release();
    pool.end();
  }
}

checkTodaysData();
