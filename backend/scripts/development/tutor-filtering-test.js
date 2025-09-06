// Test script for tutor filtering functionality
const axios = require("axios");

const API_URL = "http://localhost:3001/api"; // Update with your actual API URL

async function testTutorFiltering() {
  try {
    console.log("Testing tutor filtering...");

    // Test case 1: Get all tutors
    console.log("\n1. Getting all tutors:");
    const allTutorsResponse = await axios.get(`${API_URL}/tutors`);
    console.log(`Total tutors: ${allTutorsResponse.data.tutors.length}`);

    // Test case 2: Filter by teaching mode
    console.log("\n2. Filtering tutors by teaching mode (online_individual):");
    const onlineTutorsResponse = await axios.get(
      `${API_URL}/tutors?teachingMode=online_individual`
    );
    console.log(`Online tutors: ${onlineTutorsResponse.data.tutors.length}`);

    // Test case 3: Filter by subject
    console.log("\n3. Filtering tutors by subject (Mathematics):");
    const mathTutorsResponse = await axios.get(
      `${API_URL}/tutors?subjects=Mathematics`
    );
    console.log(`Math tutors: ${mathTutorsResponse.data.tutors.length}`);

    // Test case 4: Filter by price range
    console.log("\n4. Filtering tutors by price range (min: 20, max: 50):");
    const priceTutorsResponse = await axios.get(
      `${API_URL}/tutors?minPrice=20&maxPrice=50`
    );
    console.log(
      `Price range tutors: ${priceTutorsResponse.data.tutors.length}`
    );

    // Test case 5: Filter by rating
    console.log("\n5. Filtering tutors by rating (min: 4.0):");
    const ratingTutorsResponse = await axios.get(
      `${API_URL}/tutors?minRating=4.0`
    );
    console.log(
      `Highly rated tutors: ${ratingTutorsResponse.data.tutors.length}`
    );

    // Test case 6: Combined filters
    console.log(
      "\n6. Applying combined filters (online, Mathematics, min rating 4.0):"
    );
    const combinedFiltersResponse = await axios.get(
      `${API_URL}/tutors?teachingMode=online_individual&subjects=Mathematics&minRating=4.0`
    );
    console.log(
      `Combined filter tutors: ${combinedFiltersResponse.data.tutors.length}`
    );

    // Test case 7: Sort by hourly rate (ascending)
    console.log("\n7. Sorting tutors by hourly rate (low to high):");
    const sortedByRateResponse = await axios.get(
      `${API_URL}/tutors?sort=hourlyRate&order=asc`
    );
    if (sortedByRateResponse.data.tutors.length > 1) {
      console.log(
        `First tutor hourly rate: ${sortedByRateResponse.data.tutors[0].hourlyRate}`
      );
      console.log(
        `Last tutor hourly rate: ${
          sortedByRateResponse.data.tutors[
            sortedByRateResponse.data.tutors.length - 1
          ].hourlyRate
        }`
      );
    } else {
      console.log("Not enough tutors to compare rates");
    }

    console.log("\nAll test cases completed!");
  } catch (error) {
    console.error("Error testing tutor filtering:", error.message);
    if (error.response) {
      console.error("API error response:", error.response.data);
    }
  }
}

testTutorFiltering();
