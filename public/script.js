console.log("Hello, World! Welcome to the Student Management App.");

const form = document.querySelector('#add-student-form form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const studentList = document.querySelector('#student-list ul');
const resetButton = document.querySelector('button[type="reset"]');

const students = []; // Array to store student data

const loginForm = document.querySelector('#login-form form');
const loginMessage = document.querySelector('#login-message');
const loginFormSection = document.querySelector('#login-form');

let isLoggedIn = false;

function toggleFeatures() {
    const features = document.querySelectorAll('.restricted');
    features.forEach(feature => {
        feature.style.display = isLoggedIn ? 'flex' : 'none';
        loginFormSection.style.display = "none";
    });
}

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: document.querySelector('#username').value.trim(),
            password: document.querySelector('#password').value.trim()
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid username or password');
            }
            return response.json();
        })
        .then(() => {
            isLoggedIn = true;
            toggleFeatures();
        })
        .catch(() => {
            isLoggedIn = false;
            toggleFeatures();
        });
});

function fetchStudents() {
    // Fetch student data from the server
    fetch('/students')
        .then(response => {
            // Check if the server response is valid
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.errors || err.error); });
            }
            return response.json(); // Parse and return the response as JSON
        })
        .then(data => {
            console.log(data); // Log the fetched student data for debugging
            renderStudentList(data); // Call a function to display the data
        })
        .catch(error => {
            // Handle errors that occur during fetch or JSON parsing
            const studentList = document.querySelector('#student-list ul');
            studentList.innerHTML = '<li>Error loading student data</li>'; // Display error message in the UI
            console.error('Error fetching students:', error); // Log the error for debugging
        });
}

fetchStudents();

function showMessage(message, type) {
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.style.width = 'auto';
    messageBox.style.height = 'auto';
    messageBox.style.padding = '1rem';
    messageBox.style.margin = '0';  // Remove default margin
    messageBox.style.borderRadius = '5px';
    messageBox.style.color = type === 'success' ? 'green' : 'red';
    messageBox.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';

    // Center the message box with absolute positioning
    messageBox.style.position = 'absolute';
    messageBox.style.top = '6rem';
    messageBox.style.left = '50%';
    messageBox.style.transform = 'translateX(-50%)';
    messageBox.style.zIndex = '1000'; // Ensure it appears above other elements

    // Append the message box to the body or a main container
    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.remove();
    }, 4000);
}


// Add a 'submit' event listener to the form
form.addEventListener('submit', (event) => {
    // Prevent the default form submission behavior (page reload)
    event.preventDefault();

    // Get the value of the 'name' input field and remove whitespace
    const name = document.querySelector('#name').value.trim();

    // Get the value of the 'email' input field and remove whitespace
    const email = document.querySelector('#email').value.trim();

    // Make a POST request to the '/students' endpoint to add a new student
    fetch('/students', {
        method: 'POST', // Specify the HTTP method as POST
        headers: { 'Content-Type': 'application/json' }, // Specify the content type as JSON
        body: JSON.stringify({ name, email }) // Send the name and email as JSON in the request body
    })
        .then((response) => {
            if (response.status === 400) {
                showMessage('Invalid Name or Email!', 'failed');
                return;
            }
            response.json()
            showMessage('Student added successfully!', 'success');
        }) // Parse the JSON response
        .then(() => {
            fetchStudents(); // Refresh the list of students by fetching the updated data
            form.reset(); // Clear the form fields after successful submission
        })
        .catch((error) => {
            showMessage('Internal Server Error!', 'failed');
            console.error('Error adding student:', error)
        });
});

// Function to render the student list in the DOM
function renderStudentList(students) {
    // Select the parent element where the student list will be rendered
    const studentList = document.querySelector('#student-list ul');

    // Clear the existing content of the list to avoid duplicates
    studentList.innerHTML = '';

    // Iterate through the array of student objects
    students.forEach(student => {
        // Create a new list item element for each student
        const listItem = document.createElement('li');

        // Set the inner HTML of the list item with student details and buttons
        listItem.innerHTML = `
            <p>${student.name} - ${student.email}</p>
            <div class="action-btns">
                <button class="edit" data-id="${student._id}">Edit</button>
                <button class="delete" data-id="${student._id}">Delete</button>
            </div>
        `;

        // Append the list item to the parent student list element
        studentList.appendChild(listItem);
    });

    // Attach event listeners to the newly added buttons (e.g., Edit and Delete)
    attachEventListeners1();
    attachEventListeners2();
}

// Function to edit an existing student's details
function editStudent(id, name, email) {
    // Send a PUT request to the `/students/:id` endpoint with the student's ID
    fetch(`/students/${id}`, {
        method: 'PUT', // Specify the HTTP method as PUT for updating a resource
        headers: { 'Content-Type': 'application/json' }, // Set the request headers to indicate JSON content
        body: JSON.stringify({ name, email }) // Send the updated name and email as JSON in the request body
    })
        .then((response) => {
            if (response.status === 400) {
                showMessage('Invalid Name or Email!', 'failed');
                return;
            }
            response.json()
            showMessage('Student updated successfully!', 'success');
        }) // Parse the JSON response from the server
        .then(() => fetchStudents()) // Refresh the student list by fetching the updated data
        .catch((error) => {
            showMessage('Internal Server Error!', 'failed');
            console.error('Error updating student:', error)
        });
}

// Function to attach event listeners to edit buttons
function attachEventListeners1() {
    // Select all elements with the 'edit' class and iterate over them
    document.querySelectorAll('.edit').forEach(button => {
        // Add a click event listener to each 'edit' button
        button.addEventListener('click', () => {
            // Get the student's ID from the button's dataset
            const id = button.dataset.id;
            // Prompt the user to enter a new name for the student
            const name = prompt('Enter new name:');
            // Prompt the user to enter a new email for the student
            const email = prompt('Enter new email:');
            // If both name and email are provided, call the editStudent function
            if (name && email) {
                editStudent(id, name, email); // Update the student's details
            }
        });
    });
}

// Function to delete a student by their ID
function deleteStudent(id) {
    // Send a DELETE request to the `/students/:id` endpoint with the student's ID
    fetch(`/students/${id}`, {
        method: 'DELETE' // Specify the HTTP method as DELETE for removing a resource
    })
        .then(() => {
            showMessage('Student deleted successfully!', 'success');
            fetchStudents()
        })
        .catch((error) => {
            showMessage('Internal Server Error!', 'failed');
            console.error('Error deleting student:', error)
        });
}

// Function to attach event listeners to delete buttons
function attachEventListeners2() {
    // Select all elements with the 'delete' class and iterate over them
    document.querySelectorAll('.delete').forEach(button => {
        // Add a click event listener to each 'delete' button
        button.addEventListener('click', () => {
            // Get the student's ID from the button's dataset
            const id = button.dataset.id;
            // Display a confirmation dialog to the user
            if (confirm('Are you sure you want to delete this student?')) {
                // If the user confirms, call the deleteStudent function
                deleteStudent(id); // Remove the student with the specified ID
            }
        });
    });
}

// resetButton.addEventListener('click', (event) => {
//     const confirmation = confirm('Are you sure you want to clear the form?');
//     if (!confirmation) {
//         // Prevent the reset if the user cancels
//         event.preventDefault();
//     }
// });