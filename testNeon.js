const client = require('./NeonConnection');  // Import the database connection
const fs = require("fs");

const csv = require("csv-parser");

const path = require('path');

const filePath3 = path.join('C:', 'Users', 'hp', 'Downloads','activities_with_general_type - activities_with_general_type.csv.csv');


const filePath = path.join('C:', 'Users', 'hp', 'hotels_final.csv');

const filePath2 = path.join('C:', 'Users', 'hp', 'Downloads','updated_restaurants_with_tags.csv');

async function insertUser(name, email) {
  try {
    const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *';
    const values = [name, email];

    const res = await client.query(query, values);
    console.log('Inserted:', res.rows[0]);
  } catch (err) {
    console.error('Error inserting data:', err);
  }
}

async function getUsers() {
    try {
      const query = 'SELECT * FROM users';
      //const values = [name, email];
  
      const res = await client.query(query);
      console.log('Data:', res.rows);
    } catch (err) {
      console.error('Error inserting data:', err);
    }
}
async function insertHotelsToNeon(csvFilePath) {
  try {
    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });
    
    for (const row of results) {
      let secondaryImagesArray = [];
      let amenitiesArray = [];
    
      try {
        secondaryImagesArray = JSON.parse(row.secondary_images.replace(/'/g, '"'));
      } catch (e) {
        console.error('Invalid secondary_images format:', row.secondary_images);
      }
    
      try {
        amenitiesArray = JSON.parse(row.amenities.replace(/'/g, '"'));
      } catch (e) {
        console.error('Invalid amenities format:', row.amenities);
      }
    
      await client.query(
        `INSERT INTO hotels (
          name, description, address, priceRange, rating, numberOfReviews,
          CheckInDate, CheckOutDate, image, secondary_images, longitude,
          latitude, contact_info, amenities
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          row.name,
          row.description,
          row.address,
          parseFloat(row.priceRange) || 0,
          parseFloat(row.rating) || 0,
          parseInt(row.numberOfReviews) || 0,
          row.checkInDate || null,
          row.checkOutDate || null,
          row.image,
          secondaryImagesArray,
          parseFloat(row.longitude) || 0,
          parseFloat(row.latitude) || 0,
          row.contact_info,
          amenitiesArray,
        ]
      );
    }
    
    console.log('Data inserted successfully!');
  } catch (err) {
    console.error('Error inserting data:', err);
  } finally {
    await client.end();
  }
}


async function insertRestaurantsToNeon(csvFilePath) {
  try {
    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });
    
    for (const row of results) {
      const parseArrayField = (field) => {
        try {
          return JSON.parse(field.replace(/'/g, '"'));
        } catch (e) {
          console.error(`Invalid JSON in field: ${field}`);
          return [];
        }
      };
    
      const facilities = parseArrayField(row.facilities);
      const meals = parseArrayField(row.meals);
      const images = parseArrayField(row.images);
      const tags = parseArrayField(row.tags);
    
      await client.query(
        `INSERT INTO restaurants (
          name, address, priceLevel, rating, numberOfReviews, OpeningHours,
          image, longitude, latitude, contact_info,
          description, facilities, meals, images, tags
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15
        )`,
        [
          row.name,
          row.address,
          row.priceLevel,
          parseFloat(row.rating) || 0,
          parseInt(row.numberOfReviews) || 0,
          row.OpeningHours,
          row.image,
          parseFloat(row.longitude) || 0,
          parseFloat(row.latitude) || 0,
          row.contact_info,
          row.description,
          facilities,
          meals,
          images,
          tags,
        ]
      );
    }
    
    console.log('Restaurants data inserted successfully!');
  } catch (err) {
    console.error('Error inserting data:', err);
  } finally {
    await client.end();
  }
}


async function insertActivitiesToNeon(csvFilePath) {
  try {
    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of results) {
      await client.query(
        `INSERT INTO activities (
           name, rating, numberofreviews, image,
          addresse, longitude, latitude, description, activitytype
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9
        )`,
        [
          row.name,
          parseFloat(row.rating) || 0,
          parseInt(row.numberOfReviews) || 0,
          row.image,
          row.adresse,
          parseFloat(row.longitude) || 0,
          parseFloat(row.latitude) || 0,
          row.description,
          row.type,
        ]
      );
    }

    console.log('Activities data inserted successfully!');
  } catch (err) {
    console.error('Error inserting activities:', err);
  } finally {
    await client.end();
  }
}



async function getAllHotels() {
  try {
    const result = await client.query('SELECT * FROM hotels');
    console.log('Hotels:', result.rows);

    return result.rows;
  } catch (err) {
    console.error('Error fetching hotels:', err);
  } 
}

async function getAllRestaurants() {
  try {
    const result = await client.query('SELECT * FROM restaurants');
    console.log('Restaurants:', result.rows);

    return result.rows;
  } catch (err) {
    console.error('Error fetching restaurants:', err);
  } 
}

async function getAllActivities() {
  try {
    const result = await client.query('SELECT * FROM activities');
    console.log('Activities:', result.rows);

    return result.rows;
  } catch (err) {
    console.error('Error fetching activities:', err);
  } 
}

//getAllRestaurants();

//insertHotelsToNeon(filePath);

//insertActivitiesToNeon(filePath3);

//getAllActivities();


//getAllHotels();

//insertRestaurantsToNeon(filePath2);

module.exports = {getAllHotels, getAllRestaurants, getAllActivities};
