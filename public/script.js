
// ==================================================
// 1. CONNECT JAVASCRIPT WITH HTML ELEMENTS
// ==================================================

// Find the registration form in HTML
const form = document.getElementById("userForm");

// Find the hidden input that stores the ID of the user being edited
// Empty ID = new user; existing ID = update user
const recordId = document.getElementById("recordId");

// Find the HTML element where success/error messages appear
const message = document.getElementById("message");

// Find the Save/Update button
const submitBtn = document.getElementById("submitBtn");

// Find the Cancel Edit button
const cancelBtn = document.getElementById("cancelBtn");

// Find the HTML area where saved user records will be displayed
const records = document.getElementById("records");

// Backend address where user data is handled
const API = "http://localhost:3000/api/users";


// ==================================================
// 2. COMMON REQUEST FUNCTION
// PURPOSE: SEND REQUESTS TO THE BACKEND
// USED FOR: POST, GET, PATCH, DELETE
// ==================================================

async function request(url, options = {}) {

  // Send the request to the backend
  const response = await fetch(url, options);

  // Convert the backend's JSON response into JavaScript data
  const data = await response.json();

  // If the backend returns an unsuccessful HTTP status, show an error
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  // Return the backend response to the function that called request()
  return data;
}


// ==================================================
// 3. DISPLAY SUCCESS OR ERROR MESSAGES
// PURPOSE: SHOW MESSAGES ON THE WEBPAGE
// ==================================================

function showMessage(text) {

  // Display the supplied text inside the message element
  message.textContent = text;
}


// ==================================================
// 4. SAVE NEW USER OR UPDATE EXISTING USER
// NEW USER = POST
// EXISTING USER = PATCH
// ==================================================

form.addEventListener("submit", async (event) => {

  // Prevent the browser from reloading the page when the form is submitted
  event.preventDefault();

  // Get the ID of the user being edited
  const id = recordId.value;

  // Collect all named form fields and selected files
  const data = new FormData(form);

  // Remove the hidden ID from the submitted form fields
  // The ID is already stored separately in the variable id
  data.delete("recordId");

  // If an ID exists, add it to the backend URL
  // Otherwise, use the main users URL
  const url = id
    ? `${API}/${encodeURIComponent(id)}`
    : API;

  // Choose POST for a new user and PATCH for an existing user
  const method = id ? "PATCH" : "POST";

  try {

    // Disable the button while the request is running
    submitBtn.disabled = true;

    // Show a message while the backend processes the request
    showMessage("Saving...");

    // Send the form data to the backend
    // POST creates a user; PATCH requests an update
    await request(url, {
      method,
      body: data,
    });

    // Show the appropriate success message
    showMessage(id ? "Record updated!" : "Record saved!");

    // Clear the form and return the button to Save mode
    resetForm();

    // GET the latest users and display them
    await loadRecords();

  } catch (error) {

    // Display an error if the request fails
    showMessage(error.message);

  } finally {

    // Re-enable the button whether the request succeeds or fails
    submitBtn.disabled = false;
  }
});


// ==================================================
// 5. GET ALL USERS AND DISPLAY THEM
// HTTP METHOD: GET
// PURPOSE: READ AND DISPLAY SAVED RECORDS
// ==================================================

async function loadRecords() {

  // Show a loading message while retrieving users
  records.textContent = "Loading records...";

  try {

    // Send a GET request to retrieve all users
    // The backend must return an array of users
    const users = await request(API);

    // Remove the previous user cards from the webpage
    records.replaceChildren();

    // If there are no users, display a message and stop
    if (users.length === 0) {
      records.textContent = "No records found.";
      return;
    }

    // Repeat these instructions for every user returned by the backend
    users.forEach((user) => {

      // Create a separate HTML card for this user
      const card = document.createElement("article");

      // Add the CSS class used to style the card
      card.className = "record";


      // ----------------------------------------------
      // DISPLAY THE USER'S NAME
      // ----------------------------------------------

      // Create a heading element for the user's name
      const title = document.createElement("h3");

      // Put the first name and last name in the heading
      title.textContent = `${user.fname} ${user.lname}`;

      // Add the heading to the user card
      card.appendChild(title);


      // ----------------------------------------------
      // DISPLAY OTHER USER DETAILS
      // ----------------------------------------------

      // Prepare the details that should appear on the card
      const details = [
        `ID: ${user._id}`,
        `Phone: ${user.phone}`,
        `Email: ${user.email}`,
        `Gender: ${user.gender || "Not provided"}`,
        `Nationality: ${user.nationality || "Not provided"}`,
        `Qualification: ${user.qualification || "Not provided"}`
      ];

      // Create one paragraph for each detail and add it to the card
      details.forEach((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        card.appendChild(p);
      });


      // ----------------------------------------------
      // DISPLAY PHOTO AND SIGNATURE LINKS
      // ----------------------------------------------

      // Check whether the user has uploaded a photo or signature
      ["photo", "signature"].forEach((key) => {

        // If this file is missing, skip it
        if (!user[key]) return;

        // Create a link for opening the uploaded file
        const link = document.createElement("a");

        // Apply the CSS class for the file link
        link.className = "file-link";

        // Set the URL where the uploaded file can be accessed
        link.href = "/uploads/" + encodeURIComponent(user[key]);

        // Open the file in a new browser tab
        link.target = "_blank";

        // Add a security setting for the new tab
        link.rel = "noopener noreferrer";

        // Show either View Photo or View Signature
        link.textContent =
          key === "photo" ? "View Photo" : "View Signature";

        // Add the file link to the user's card
        card.appendChild(link);
      });


      // ----------------------------------------------
      // CREATE THE EDIT AND DELETE BUTTONS
      // ----------------------------------------------

      // Create a container for the action buttons
      const actions = document.createElement("div");
      actions.className = "record-actions";


      // Create the Edit button
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Edit";

      // When Edit is clicked, fill the form with this user's data
      editBtn.addEventListener("click", () => editUser(user));


      // Create the Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "danger";

      // When Delete is clicked, request deletion of this user's record
      deleteBtn.addEventListener("click", () => deleteUser(user._id));


      // Add both buttons to the button container
      actions.append(editBtn, deleteBtn);

      // Add the buttons to the user's card
      card.appendChild(actions);

      // Add the completed user card to the webpage
      records.appendChild(card);
    });

  } catch (error) {

    // Display an error if retrieving users fails
    records.textContent = error.message;
  }
}


// ==================================================
// 6. EDIT AN EXISTING USER
// PURPOSE: PUT EXISTING USER DETAILS BACK INTO THE FORM
// THE ACTUAL UPDATE HAPPENS WHEN THE FORM IS SUBMITTED
// ==================================================

function editUser(user) {

  // Store the selected user's database ID in the hidden input
  recordId.value = user._id;

  // List the form fields that should be filled with existing data
  const fields = [
    "fname", "lname", "dob", "gender", "nationality",
    "phone", "email", "address", "qualification",
    "college", "year", "percentage"
  ];

  // Copy each saved value into the matching HTML input
  fields.forEach((name) => {
    form.elements[name].value = user[name] ?? "";
  });

  // Clear the photo input because browsers do not allow
  // JavaScript to preselect an existing local file
  document.getElementById("photo").value = "";
  document.getElementById("signature").value = "";

  // Change the Save button label to Update Details
  submitBtn.textContent = "Update Details";

  // Show the Cancel Edit button
  cancelBtn.hidden = false;

  // Tell the user which record is being edited
  showMessage("Editing record: " + user._id);

  // Scroll the page back to the registration form
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}


// ==================================================
// 7. DELETE A USER
// HTTP METHOD: DELETE
// PURPOSE: ASK THE BACKEND TO DELETE A RECORD
// ==================================================

async function deleteUser(id) {

  // Ask the user to confirm before deleting
  if (!confirm("Are you sure you want to delete this record?")) {
    return; // Stop if the user clicks Cancel
  }

  try {

    // Send a DELETE request for the selected user's ID
    await request(`${API}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    // Display a success message
    showMessage("Record deleted successfully.");

    // If the deleted user is currently being edited, clear the form
    if (recordId.value === id) {
      resetForm();
    }

    // Retrieve and display the remaining users
    await loadRecords();

  } catch (error) {

    // Display an error if deletion fails
    showMessage(error.message);
  }
}


// ==================================================
// 8. CLEAR THE FORM AND RETURN TO SAVE MODE
// PURPOSE: RESET THE FORM
// ==================================================

function resetForm() {

  // Clear the form's input fields
  form.reset();

  // Remove the selected user's ID
  recordId.value = "";

  // Change the button label back to Save Details
  submitBtn.textContent = "Save Details";

  // Hide the Cancel Edit button
  cancelBtn.hidden = true;
}


// ==================================================
// 9. CANCEL EDIT
// PURPOSE: CLEAR THE FORM AND EXIT EDIT MODE
// ==================================================

// When Cancel Edit is clicked, run resetForm()
cancelBtn.addEventListener("click", resetForm);


// ==================================================
// 10. HANDLE THE HTML FORM RESET EVENT
// PURPOSE: RETURN TO NEW-USER MODE AFTER A RESET
// ==================================================

form.addEventListener("reset", () => {

  // Clear the selected user's ID
  recordId.value = "";

  // Return the button label to Save Details
  submitBtn.textContent = "Save Details";

  // Hide the Cancel Edit button
  cancelBtn.hidden = true;
});


// ==================================================
// 11. REFRESH THE USER LIST
// PURPOSE: GET THE LATEST RECORDS AGAIN
// HTTP METHOD: GET, THROUGH loadRecords()
// ==================================================

document
  .getElementById("refreshBtn")
  .addEventListener("click", loadRecords);


// ==================================================
// 12. LOAD USERS WHEN THE PAGE FIRST OPENS
// PURPOSE: DISPLAY THE EXISTING RECORDS
// HTTP METHOD: GET, THROUGH loadRecords()
// ==================================================

loadRecords();
